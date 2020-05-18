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
};

function main() {
  //utils.mediaQuery.addListener(changeDesign); // Attach listener function on state changes
  setInterval(checkPage, 2000);
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

function processAnswersPage(content) {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  const answers = content.getElementsByTagName('label');

  for (answer of answers) {
    var div = document.createElement('div');
    div.classList.add('anser-box');
    div.innerHTML = `
      <span class="answer-word">Respostinha roubada</span>
        <div class="answer-options">
          <span class="answer-copy answer-btn">Copiar</span>
          <span class="answer-prev answer-btn">&lt;</span>
          <span class="answer-next answer-btn">&gt;</span>
        </div> 
    `;
    //<span class="answer-pages">1 de 10</span>

    answer.prepend(div);
    //answer.style.height = '130px';
    //answer.style.width = '180px';
  }

  console.log(answers);

  return true;
}

function processValidationPage() {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  return true;
}

function changeDesign() {
  const ref = document.getElementById('extraClass');
  if (!ref) return false;

  const style = document.createElement('style');
  style.innerHTML = `
  body{
    height: 1050px !important;
  }
  #screens {
    height: 950px;
    min-width: 900px;
  }
  @media screen and (max-width: 1279px), screen and (max-height: 859px) {
    body {
      height: 900px !important;
    }
    #screens{
      height: 800px !important;

    }
  }

  #screenGame .content .ct>div:nth-of-type(1) label { 
    width: 180px !important;
    height: 190px !important;
  }

  .answer-box {
    display: flex;
    flex-direction: column;
    color: #9b95d1;
    width: max-content;
  }
  span.answer-word {
    text-transform: uppercase;
    margin-bottom: 5px;
    text-align: center;
    border-bottom: 1px dashed #9b95d1;
    padding-bottom: 5px;
  }
  .answer-options {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
  }
  span.answer-btn {
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
