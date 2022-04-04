const style = `<style>
#hint {
  position: relative;
  background-color: gray;
  cursor: pointer;
}
#selected {
  display: inline-block;
  padding: 2px;
}
#option-container {
  position: absolute;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
}
.option {
  padding: 2px;
  background-color: lightgray;
}
.option:hover {
  background-color: darkgray;
}

.hide {
  display: none;
}
</style>`;
const dropdown = document.createElement('div');
dropdown.id = 'hint';
dropdown.innerHTML = style;

const selected = document.createElement('span');
selected.id = 'selected';
dropdown.append(selected);

const optionContainer = document.createElement('div');
optionContainer.id = 'option-container';
optionContainer.classList.add('hide');
dropdown.append(optionContainer);

function updateOptions(arr) {
  const placeholder = `(${arr.length} possible answers)`;
  selected.innerText = placeholder;
  optionContainer.innerHTML = '';
  arr.unshift(placeholder);
  arr.forEach((elm, i) => {
    const optionDiv = document.createElement('div');
    optionDiv.id = i === 0 ? 'option_placeholder' : `option_${elm}`;
    optionDiv.innerText = elm;
    optionDiv.classList.add('option', 'hide');
    optionContainer.append(optionDiv);
  });
}

document
  .querySelector('game-app').shadowRoot
  .addEventListener('click', (evt) => {
    if (dropdown.contains(evt.target)) {
      const clickedId = evt.target.id;
      if (clickedId === 'hint' || clickedId === 'selected') {
        toggleDropdown(isDropdownOpen());
      } else if (clickedId.includes('option_')) {
        if (clickedId !== 'option_placeholder') {
          updateBoard(evt.target.innerText);
        }
        selected.innerText = evt.target.innerText;
        toggleDropdown(true);
      }
    } else {
      if (isDropdownOpen()) {
        toggleDropdown(true);
      }
    }
  });

function isDropdownOpen() {
  const firstOption = dropdown.querySelector('.option');
  return firstOption && !firstOption.classList.contains('hide');
}

function toggleDropdown(close) {
  optionContainer.classList.toggle('hide', close);
  dropdown
    .querySelectorAll('.option')
    .forEach(opt => opt.classList.toggle('hide', close));
}

function updateBoard(selectedText) {
  const clearLetter = new CustomEvent('game-key-press', {
    bubbles: !0, composed: !0, detail: { key: 'Backspace' }
  });
  for (let i = 0; i < 5; i++) {
    document
      .querySelector('game-app').shadowRoot
      .querySelector('#board')
      .dispatchEvent(clearLetter);
  }
  for (let i = 0; i < selectedText.length; i++) {
    const enterLetter = new CustomEvent('game-key-press', {
      bubbles: !0, composed: !0, detail: { key: selectedText[i] }
    });
    document
      .querySelector('game-app').shadowRoot
      .querySelector('#board')
      .dispatchEvent(enterLetter);
  }
}

document
  .querySelector('game-app').shadowRoot
  .querySelector('#board')
  .prepend(dropdown);

document
  .querySelector('game-app').shadowRoot
  .querySelector('#board-container')
  .setAttribute('part', 'adjust-container');
