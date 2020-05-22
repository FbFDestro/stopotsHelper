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
  const answer = event.target.parentNode.parentNode.children[0];
  answer.select();
  answer.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand('copy');
  console.log('Copiado ' + answer.innerText);
}

function processAnswersPage(content) {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  const { dictionary } = utils;
  console.log(dictionary);

  const answers = content.getElementsByTagName('label');

  for (answer of answers) {
    answer.classList.add('answer-label');
    const topic = answer.innerText.toUpperCase();

    let ans =
      dictionary &&
      dictionary[letter] &&
      dictionary[letter][topic] &&
      dictionary[letter][topic].length > 0
        ? dictionary[letter][topic][0].toUpperCase()
        : 'not found';

    const div = document.createElement('div');
    div.classList.add('answer-box');
    div.innerHTML = `
      <textarea readonly class="answer-word 1">${ans}</textarea>
        <div class="answer-options">
          <span class="answer-copy answer-btn">Copiar</span>
          <span class="answer-prev answer-btn">&lt;</span>
          <span class="answer-next answer-btn">&gt;</span>
        </div> 
    `;
    //<span class="answer-pages">1 de 10</span>

    answer.prepend(div);
  }
  console.log(answers);

  const copyBtns = document.getElementsByClassName('answer-copy');
  for (copyBtn of copyBtns) {
    copyBtn.onclick = copyToClipboard;
  }

  return true;
}

function processValidationPage() {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  const answers = document.querySelectorAll('label > div');
  // get btn, create my own btn, add valid answers to dictionary

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
  span.answer-btn {
    cursor: pointer;
    border: 1px solid;
    padding: 5px;
    border-radius: 10px;
    margin: 0 3px;
    transition: 0.5s;
  }
  span.answer-btn:hover {
    color: #fff;
  }
  span.answer-pages {
    padding: 6px 3px;
  }
  `;

  ref.parentNode.insertBefore(style, ref);
  return true;
}
