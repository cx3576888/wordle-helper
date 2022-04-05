const isNode = typeof module === 'object' && module.exports;

let result;
if (!isNode) {
  document.addEventListener('game-key-press', (evt => {
    if (evt.detail.key === 'Enter' || evt.detail.key === '↵') {
      enterClicked();
    }
  }));
  result = list.sort();
  init();
}

function init() {
  const guesses = getGuesses();
  guesses.forEach(guess => {
    result = narrowDown(result, guess);
  });
  updateOptions(result);
}

function newGuessEntered() {
  const guesses = getGuesses();
  const lastGuess = guesses[guesses.length - 1];
  result = narrowDown(result, lastGuess);
  updateOptions(result);
}

function getGuesses() {
  const guesses = [];
  document
    .querySelector('game-app').shadowRoot
    .querySelector('#board')
    .querySelectorAll('game-row')
    .forEach(gameRow => {
      const currentGuess = {
        letters: gameRow.getAttribute('letters'),
        correctInfo: [],
        presentInfo: [],
        absentInfo: [],
        evaluated: 0,
      };
      gameRow.shadowRoot
        .querySelectorAll('game-tile')
        .forEach((gameTile, i) => {
          const tileLetter = gameTile.getAttribute('letter');
          const tileEvaluation = gameTile.getAttribute('evaluation');
          switch (tileEvaluation) {
            case 'correct':
              currentGuess.correctInfo.push({ letter: tileLetter, position: i });
              currentGuess.evaluated++;
              break;
            case 'present':
              currentGuess.presentInfo.push({ letter: tileLetter, position: i });
              currentGuess.evaluated++;
              break;
            case 'absent':
              currentGuess.absentInfo.push({ letter: tileLetter, position: i });
              currentGuess.evaluated++;
              break;
          }
        });
      if (currentGuess.evaluated === 5) {
        guesses.push(currentGuess);
      }
    });
  return guesses;
}

function narrowDown(result, guess) {
  result = correct(result, guess.correctInfo);
  result = present(result, guess.correctInfo, guess.presentInfo);
  result = absent(result, guess.correctInfo, guess.presentInfo, guess.absentInfo);
  console.log(`Guess [${guess.letters}] -> ${result.length} possible answers remain: `);
  console.dir(result, { maxArrayLength: 3000 });
  return result;
}

function correct(result, correctInfo) {
  return result.filter(word => {
    return correctInfo.every(c => word[c.position] === c.letter);
  });
}

function present(result, correctInfo, presentInfo) {
  const takenPositions = correctInfo.map(c => c.position);
  presentInfo.forEach(info => {
    const currLetter = info.letter;
    const sameLetterInfo = presentInfo.filter(p => p.letter === currLetter);
    result = result.filter(word => {
      for (const sameLetter of sameLetterInfo) {
        if (word[sameLetter.position] === currLetter) {
          return false;
        }
      }
      return remainLetters(word, takenPositions).filter(l => l === currLetter).length >= sameLetterInfo.length;
    });
  });
  return result;
}

function absent(result, correctInfo, presentInfo, absentInfo) {
  const takenPositions = correctInfo.map(c => c.position);
  absentInfo.forEach(info => {
    const currLetter = info.letter;
    const sameLetterInfo = presentInfo.filter(p => p.letter === currLetter);
    result = result.filter(word => {
      return remainLetters(word, takenPositions).filter(l => l === currLetter).length === sameLetterInfo.length;
    });
  })
  return result;
}

function remainLetters(word, takenPositions) {
  return Array.from(word).filter((w, i) => !takenPositions.includes(i));
}

function enterClicked() {
  checkLastGuess()
    .then(() => {
      newGuessEntered();
    })
    .catch(err => {
      console.log(err);
    })
}

function checkLastGuess() {
  const toaster = document
    .querySelector('game-app').shadowRoot
    .querySelector('#game-toaster');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const toast = toaster.querySelector('game-toast');
      if (toast === null) {
        resolve();
      } else {
        reject(toast.getAttribute('text'));
      }
    }, 750);
  });
}

if (isNode) {
  module.exports = { narrowDown };
}
