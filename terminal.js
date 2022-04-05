const { list } = require("./wordlist");
const { narrowDown } = require("./wordle-hint");
const readline = require('readline');

let result = list.sort();
const toEval = { 0: 'absent', 1: 'present', 2: 'correct' };
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log(`
*********************************************************
*** Type 0 if gray. Type 1 if yellow. Type 2 if green ***
*********************************************************`);
startGuess();

function startGuess() {
  enterGuess().then(showResult);
}

function enterGuess() {
  console.log('');
  return new Promise((resolve, reject) => {
    rl.question('  You guessed      : ', (guess) => {
      rl.question(', then Wordle shows: ', (evaluation) => {
        resolve([guess, evaluation]);
      });
    });
  });
}

function showResult(newGuess) {
  const guess = formatGuess(newGuess);
  result = narrowDown(result, guess);
  if (result.length > 1) {
    startGuess();
  } else {
    console.log(`"${result[0]}" is the answer!`);
    rl.close();
  }
}

function formatGuess(newGuess) {
  const obj = {
    letters: newGuess[0],
    correctInfo: [],
    presentInfo: [],
    absentInfo: [],
  };
  for (let i = 0; i < 5; i++) {
    const ev = toEval[newGuess[1][i]];
    switch (ev) {
      case 'correct':
        obj.correctInfo.push({ letter: newGuess[0][i], position: i });
        break;
      case 'present':
        obj.presentInfo.push({ letter: newGuess[0][i], position: i });
        break;
      case 'absent':
        obj.absentInfo.push({ letter: newGuess[0][i], position: i });
        break;
    }
  }
  return obj;
}
