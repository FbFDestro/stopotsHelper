const dictionaryDiv = document.getElementById('dictionary');
let dictionary = {};

chrome.storage.local.get(['dictionary'], function ({ dictionary: chromeDictionary }) {
  dictionary = chromeDictionary;
  console.log(JSON.stringify(dictionary));
  processDictionary();
  handleModal();
});

function processDictionary() {
  console.log(dictionary);
  let dictionaryHTML = '';
  for (const letter in dictionary) {
    let letterHTML = `<div class='box-letter' data-letter='${letter}'>
                        <span class="title-letter">LETRA: ${letter}</span>
                        <button class="btn-addTopic">Adicionar tópico</button>
                        <div class="box-topics">                  
                    `;
    for (const topic in dictionary[letter]) {
      let topicHTML = `<div class="box-topic">
                        <span class="title-topic">Tópico:</span>
                        <input type="text" class="topic-input" value="${topic}" />
                        <button class="delete-btn">Apagar</button>
                        <div class="box-answers">`;
      for (const answer of dictionary[letter][topic]) {
        const answerHTML = `<div class="box-answer">
                            <input type="text" class="answer-input" value="${answer}" />
                            <button class="delete-btn">Apagar</button>
                           </div>`;
        topicHTML += answerHTML;
      }
      topicHTML += `  </div> 
                      <button class="btn-addAnswer">Adicionar resposta</button>
                    </div>`;
      letterHTML += topicHTML;
    }
    letterHTML += ` </div>
                   </div>`;
    dictionaryHTML += letterHTML;
  }
  dictionaryDiv.innerHTML = dictionaryHTML;

  const deleteBtns = document.getElementsByClassName('delete-btn');
  for (const deleteBtn of deleteBtns) {
    deleteBtn.onclick = deleteBox;
  }

  const addAnswerBtns = document.getElementsByClassName('btn-addAnswer');
  for (const addAnswerBtn of addAnswerBtns) {
    addAnswerBtn.onclick = addAnswer;
  }

  const addTopicBtns = document.getElementsByClassName('btn-addTopic');
  for (const addTopicBtn of addTopicBtns) {
    addTopicBtn.onclick = addTopic;
  }
}

function addTopic({ target }) {
  const boxTopics = target.nextElementSibling;
  const boxTopic = document.createElement('div');
  boxTopic.classList.add('box-topic');

  boxTopic.innerHTML = `<span class="title-topic">Tópico:</span>
                        <input type="text" class="topic-input" value="">
                        <button class="deleteTopic-btn">Apagar</button>
                        <div class="box-answers"></div> 
                        <button class="btn-addAnswer">Adicionar resposta</button>
                        `;
  boxTopic.children[2].onclick = deleteBox; // CHANGE FUNCTION NAME
  boxTopic.lastElementChild.onclick = addAnswer;
  boxTopic.lastElementChild.click(); // add one answer by default

  boxTopics.prepend(boxTopic);
}

/*
function deleteBox({ target }) {
  const answerBox = target.parentNode;
  if (!target.classList.contains('deleted')) {
    target.innerText = 'Adicionar';
    target.classList.add('deleted');
    answerBox.children[0].readOnly = true;
  } else {
    target.innerText = 'Apagar';
    target.classList.remove('deleted');
    answerBox.children[0].readOnly = false;
  }
}
*/
function deleteBox({ target }) {
  const answerBox = target.parentNode;
  target.parentNode.classList.add('deleted');
}

function addAnswer({ target }) {
  const newAnswerBox = document.createElement('div');
  newAnswerBox.classList.add('box-answer');
  newAnswerBox.innerHTML = `<input type="text" class="answer-input" value="" />
                            <button class="delete-btn">Apagar</button>`;
  newAnswerBox.children[1].onclick = deleteBox;
  target.parentNode.insertBefore(newAnswerBox, target);
}

const saveBtn = document.getElementById('saveBtn');
saveBtn.onclick = () => {
  try {
    const dictionaryJsonString = convertToJsonString();
    chrome.storage.local.set(
      {
        dictionary: JSON.parse(dictionaryJsonString),
      },
      () => {
        saveBtn.innerText = 'Alterações salvas!';
        setTimeout(() => {
          saveBtn.innerText = 'Salvar alterações';
        }, 1000);
        console.log('updated');
      }
    );
  } catch (e) {
    alert('Erro ao salvar alterações! JSON parser: ' + e.message);
  }
};

function convertToJsonString() {
  let jsonString = '{';
  const letterElements = document.getElementsByClassName('box-letter');

  for (let i = 0; i < letterElements.length; i++) {
    const letterElement = letterElements[i];
    if (i != 0) jsonString += ',';
    jsonString += `"${letterElement.dataset.letter}":{`;

    const topicElements = letterElement.getElementsByClassName('box-topic');
    let hasArrayElement = false;
    for (let j = 0; j < topicElements.length; j++) {
      const topicElement = topicElements[j];
      const topic = topicElement
        .getElementsByClassName('topic-input')[0]
        .value.trim()
        .toUpperCase();
      if (topicElement.classList.contains('deleted') || topic.length == 0) continue;
      if (j != 0 && jsonString[jsonString.length - 1] === ']') jsonString += ',';
      jsonString += `"${topic}":[`;

      const answerElements = topicElement.getElementsByClassName('box-answer');
      for (let k = 0; k < answerElements.length; k++) {
        const answerElement = answerElements[k];
        const answer = answerElement
          .getElementsByClassName('answer-input')[0]
          .value.trim()
          .toUpperCase();
        if (answerElement.classList.contains('deleted') || answer.length == 0) continue;
        if (k != 0 && jsonString[jsonString.length - 1] === '"') jsonString += ',';
        jsonString += `"${answer}"`;
      }
      jsonString += `]`;
    }
    if (hasArrayElement) jsonString = jsonString.slice(0, -1);
    jsonString += '}';
  }
  jsonString += '}';

  console.log(jsonString);
  return jsonString;
}

// modal

function handleModal() {
  const modal = document.getElementById('myModal');

  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const closeModalBtn = document.getElementsByClassName('close')[0];
  closeModalBtn.onclick = function () {
    modal.style.display = 'none';
  };

  function showImport() {
    modalTitle.innerText = 'Importar um dicionário';
    modalBody.innerHTML = `<textarea id="modal-textarea" placeholder=" Cole um dicionário válido"></textarea>
                           <button id="modal-btn">Importar</button>`;

    const modalBtn = modalBody.lastElementChild;

    modalBtn.onclick = () => {
      const modalTextarea = document.getElementById('modal-textarea');
      const dictionaryString = modalTextarea.value;
      console.log(modalTextarea);
      try {
        chrome.storage.local.set(
          {
            dictionary: JSON.parse(dictionaryString),
          },
          () => {
            modalBtn.innerText = 'Alterações salvas!';
            setTimeout(() => {
              location.reload();
              modalBtn.innerText = 'Importar';
            }, 1000);
          }
        );
      } catch (e) {
        alert('Erro ao salvar alterações! JSON parser: ' + e.message);
      }
    };
  }

  function showExport() {
    modalTitle.innerText = 'Exportar meu dicionário';
    const jsonString = convertToJsonString();
    modalBody.innerHTML = `<textarea id="modal-textarea">${jsonString}</textarea>
                           <button id="modal-btn">Copiar</button>`;

    const modalBtn = modalBody.lastElementChild;

    modalBtn.onclick = () => {
      const modalTextarea = modalBody.firstElementChild;
      modalTextarea.select();
      modalTextarea.setSelectionRange(0, 99999);
      document.execCommand('copy');
      modalBtn.innerText = 'Copiado';
      setTimeout(() => {
        modalBtn.innerText = 'Copiar';
      }, 1000);
    };
  }

  importBtn.onclick = function () {
    showImport();
    modal.style.display = 'block';
  };
  exportBtn.onclick = function () {
    showExport();
    modal.style.display = 'block';
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}
