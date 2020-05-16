const utils = {
  tryGetContent: () => {
    return document.querySelector('.content > div');
  },
  tryGetLetter: () => {
    const letter = document.querySelector('#letter > span');
    return !!letter ? letter.innerText : null;
  },
};

const processAnswersPage = (content) => {
  // change style

  try {
    document.getElementsByTagName('body')[0].style.height = '800px';
    document.getElementById('screens').style.height = '700px';
  } catch (error) {}

  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  const answers = content.getElementsByTagName('label');

  for (answer of answers) {
    var span = document.createElement('span');
    span.innerText = 'rolao';
    answer.prepend(span);
    answer.style.height = '100px';
  }

  console.log(answers);

  return true;
};

const processValidationPage = () => {
  const letter = utils.tryGetLetter();
  if (!letter) return false;
  console.log(letter);

  return true;
};

const pageTypes = {
  answers: processAnswersPage,
  validation: processValidationPage,
};

const checkPage = () => {
  try {
    const content = utils.tryGetContent();
    if (!content) {
      console.log('nothing usefull');
    } else {
      if (content.classList.contains('hack-ready')) {
        console.log('alert already processed');
      } else {
        for (type in pageTypes) {
          if (content.classList.contains(type)) {
            if (pageTypes[type](content)) {
              content.classList.add('hack-ready');
              console.log('added hack ready');
            }
            break;
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

setInterval(checkPage, 2000);
