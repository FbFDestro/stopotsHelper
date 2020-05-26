const utils = {
  pageTypes: {
    answers: processAnswersPage,
    validation: processValidationPage,
  },
  tryGetContent: () => {
    return document.querySelector('.content > div');
  },
  tryGetLetter: () => {
    const letter = document.querySelector('#letter > span');
    return !!letter ? letter.innerText : null;
  },
  loadedStyle: false,
  dictionary: null,
  answerSet: {},
};

function main() {
  //utils.mediaQuery.addListener(changeDesign); // Attach listener function on state changes

  chrome.storage.sync.get(['dictionary'], function (result) {
    utils.dictionary = result.dictionary;
  });

  setInterval(checkPage, 1000);
}
main();

function checkPage() {
  try {
    const content = utils.tryGetContent();
    if (!utils.loadedStyle) {
      if (changeDesign()) utils.loadedStyle = true;
    }
    if (content) {
      //changeDesign();
      if (!content.classList.contains('hack-ready')) {
        // try to find type of page
        for (type in utils.pageTypes) {
          // if found a type
          if (content.classList.contains(type)) {
            // try to process page
            if (utils.pageTypes[type](content)) {
              content.classList.add('hack-ready');
              console.log('added hack ready');
            } else {
              console.log('fail to process page');
            }
            break;
          }
        }
      } else {
        console.log('alert already have been processed');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function copyToClipboard(event) {
  // change to coppied button
  const answer = event.target.parentNode.parentNode.children[0];
  answer.select();
  answer.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand('copy');
  event.target.innerText = 'Copiado';
  setTimeout(() => {
    event.target.innerText = 'Copiar';
  }, 1000);
  console.log('Copiado ' + answer.innerText);
}

function changeAnswer(event, { action }) {
  const { topic } = event.target.parentNode.dataset;
  const currentAnswer = utils.answerSet[topic];
  if (currentAnswer.index < 0) return;

  if (action === 'prev') {
    currentAnswer.index--;
    if (currentAnswer.index < 0) {
      currentAnswer.index = currentAnswer.indexArray.length - 1;
    }
  } else {
    currentAnswer.index = (currentAnswer.index + 1) % currentAnswer.indexArray.length;
  }
  const answerBox = event.target.parentNode.parentNode;
  const { letter } = answerBox.parentNode.dataset;
  answerBox.children[0].value =
    utils.dictionary[letter][topic][currentAnswer.indexArray[currentAnswer.index]];
}

function generateShuffledIndexArray(size) {
  const indexArray = [];
  for (let i = 0; i < size; i++) {
    indexArray.push(i);
  }
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexArray[i], indexArray[j]] = [indexArray[j], indexArray[i]];
  }
  return indexArray;
}

function processAnswersPage(content) {
  utils.answerSet = {}; // restart answerSet

  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  let { dictionary } = utils;
  dictionary = dictionary ? dictionary[letter] : null;

  const answers = content.getElementsByTagName('label');

  for (answer of answers) {
    answer.classList.add(`answer-label`);
    answer.dataset.letter = letter;
    const topic = answer.innerText.toUpperCase();

    if (dictionary && dictionary[topic] && dictionary[topic].length > 0) {
      utils.answerSet[topic] = {
        indexArray: generateShuffledIndexArray(dictionary[topic].length),
        index: 0,
      };
    } else {
      utils.answerSet[topic] = { index: -1 };
    }

    const currentAnswer = utils.answerSet[topic];

    const disabled = currentAnswer.index < 0 ? 'disabled' : '';
    const answerWord =
      currentAnswer.index >= 0
        ? dictionary[topic][currentAnswer.indexArray[currentAnswer.index]]
        : 'not found';

    const div = document.createElement('div');
    div.classList.add('answer-box');
    div.innerHTML = `
      <textarea readonly class="answer-word">${answerWord}</textarea>
        <div class="answer-options" data-topic="${topic}">
          <button class="answer-copy answer-btn ${disabled}-btn" ${disabled}>Copiar</button>
          <button class="answer-prev answer-btn ${disabled}-btn" ${disabled}>&lt;</button>
          <button class="answer-next answer-btn ${disabled}-btn" ${disabled}>&gt;</button>
        </div> 
    `;
    //<span class="answer-pages">1 de 10</span>

    answer.prepend(div);
  }

  const copyBtns = document.getElementsByClassName('answer-copy');
  for (copyBtn of copyBtns) {
    copyBtn.onclick = copyToClipboard;
  }
  const prevBtns = document.getElementsByClassName('answer-prev');
  for (prevBtn of prevBtns) {
    prevBtn.onclick = (event) => {
      changeAnswer(event, { action: 'prev' });
    };
  }
  const nextBtns = document.getElementsByClassName('answer-next');
  for (nextBtn of nextBtns) {
    nextBtn.onclick = (event) => {
      changeAnswer(event, { action: 'next' });
    };
  }

  return true;
}

function evaluateAndAddToDictionary(letter, topic, evaluateBtn) {
  const answers = document.querySelectorAll('label > div');
  for (const answer of answers) {
    if ('done' in answer.dataset || answer.classList.contains('answer-box')) {
      continue;
    }
    answer.dataset.done = true;
    if (answer.classList.contains('valid')) {
      const answerText = answer.innerText.toUpperCase();
      console.log('Added ' + answerText);
      if (!utils.dictionary[letter][topic]) {
        utils.dictionary[letter][topic] = [answerText];
      } else {
        if (utils.dictionary[letter][topic].indexOf(answerText) < 0)
          utils.dictionary[letter][topic].push(answerText);
      }
    }
  }
  // need to update full dictionay on chrome storage
  console.log(utils.dictionary);
  chrome.storage.sync.set({
    dictionary: utils.dictionary,
  });

  evaluateBtn.click();
}

function processValidationPage() {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  let topic = document.querySelector(
    '#screenGame > div:nth-child(2) > div.content > div > div:nth-child(1) > h3'
  ).innerText;
  topic = topic.substr(topic.indexOf(':') + 2).toUpperCase();

  console.log(letter + ' ' + topic);

  const evaluateBtn = document.querySelector(
    '#screenGame > div:nth-child(2) > div.content > div > button'
  );

  const evaluateAndAddBtn = document.createElement('button');
  evaluateAndAddBtn.id = 'adddToDictionaryBtn';
  evaluateAndAddBtn.classList.add('bt-yellow', 'icon-exclamation');
  evaluateAndAddBtn.innerHTML = `<strong>Avaliar e adicionar</strong>`;

  evaluateBtn.parentElement.insertBefore(evaluateAndAddBtn, evaluateBtn);

  evaluateAndAddBtn.onclick = () => {
    evaluateAndAddToDictionary(letter, topic, evaluateBtn);
    evaluateAndAddBtn.classList.add('disable');
  };

  return true;
}

function changeDesign() {
  const ref = document.getElementById('extraClass');
  if (!ref) return false;

  const style = document.createElement('style');
  style.innerHTML = `
  body{
    height: 970px !important;
  }
  #screens {
    height: 890px;
    min-width: 980px;
  }
  @media screen and (max-width: 1279px), screen and (max-height: 859px) {
    body {
      height: 830px !important;
    }
    #screens{
      height: 740px !important;

    }
  }

  #screenGame .content .ct>div:nth-of-type(1) label.answer-label { 
    width: 120px !important;
    height: 150px !important;
    font-size: 13px !important;
    justify-content: space-between !important;
  }

  .answer-box {
    display: flex;
    flex-direction: column;
    color: #9b95d1;
    margin-bottom: 5px;
  }
  span.answer-word {
    text-transform: uppercase;
    margin-bottom: 5px;
    text-align: center;
    border-bottom: 1px dashed #9b95d1;
    padding-bottom: 5px;
  }

  textarea.answer-word {
    text-transform: uppercase;
    background-color: transparent;
    height: 22px;
    margin-bottom: 5px;
    text-align: center;
    padding-bottom: 5px;
    display: flex;
    color: #9b95d1;
    border: none;
    overflow: hidden;
    resize: none;
   }
   textarea.answer-word::selection{
    background-color:#1a1a75;
    color: #9b95d1;
   }

  .answer-options {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
  }
  button.answer-btn {
    background-color: #312b99;
    color: #9b95d1;
    cursor: pointer;
    border: 1px solid;
    padding: 5px;
    border-radius: 10px;
    margin: 0 2px !important;
    transition: 0.5s;
    width: unset;
    height: unset;
    font-size: unset;
  }
  button.answer-btn:hover {
    color: #fff;
  }

  button.answer-btn.disabled-btn{
    cursor: default;
  }

  button.answer-btn.disabled-btn:hover{
    color: #9b95d1;
  }

  button.answer-pages {
    padding: 6px 3px;
  }
  `;

  ref.parentNode.insertBefore(style, ref);
  return true;
}
