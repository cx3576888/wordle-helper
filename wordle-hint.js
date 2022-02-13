init();

function init() {
  const guesses = getGuesses();
  let result = [...list];
  guesses.forEach(guess => {
    result = narrowDown(result, guess);
  });
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
        clueArray: [],
        correctPosition: [],
        presentPosition: [],
      };
      gameRow.shadowRoot
        .querySelectorAll('game-tile')
        .forEach((gameTile, i) => {
          const tileLetter = gameTile.getAttribute('letter');
          const tileEvaluation = gameTile.getAttribute('evaluation');
          if (tileEvaluation !== null) {
            currentGuess.clueArray.push({
              position: i, letter: tileLetter, evaluation: tileEvaluation
            });
            if (tileEvaluation === 'correct') {
              currentGuess.correctPosition.push(i);
            }
            if (tileEvaluation === 'present') {
              currentGuess.presentPosition.push(i);
            }
          }
        });
      if (currentGuess.clueArray.length === 5) {
        guesses.push(currentGuess);
      }
    });
  return guesses;
}

function narrowDown(result, guess) {
  guess.clueArray.forEach(clue => {
    switch (clue.evaluation) {
      case 'correct':
        result = correct(result, clue.letter, clue.position);
        break;
      case 'present':
        result = present(result, clue.letter, clue.position, guess.correctPosition);
        break;
      case 'absent':
        const takenPosition = [...guess.correctPosition, ...guess.presentPosition];
        result = absent(result, clue.letter, clue.position, takenPosition);
        break;
      default:
        console.warn(`Unknown evaluation state ${clue.evaluation}!`);
        break;
    }
  });
  console.log(`Guess [${guess.letters}] -> ${result.length} possible answers remain: `, result);
  return result;
}

function correct(result, letter, position) {
  return result.filter(word => word[position] === letter);
}

function present(result, letter, position, takenPosition) {
  return result.filter(word => {
    return remainLetters(word, takenPosition).includes(letter) && word[position] !== letter;
  });
}

function absent(result, letter, position, takenPosition) {
  return result.filter(word => {
    return !remainLetters(word, takenPosition).includes(letter);
  });
}

function remainLetters(word, takenPosition) {
  return Array.from(word).filter((c, i) => !takenPosition.includes(i));
}
