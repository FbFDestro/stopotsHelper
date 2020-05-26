const dictionaryDiv = document.getElementById('dictionary');
let dictionary = {};

chrome.storage.sync.get(['dictionary'], function ({ dictionary: chromeDictionary }) {
  dictionary = chromeDictionary;
  processDictionary();
});

function processDictionary() {
  console.log(dictionary);
  let dictionaryHTML = '';
  for (const letter in dictionary) {
    let letterHTML = `<div class='box-letter'>
                        <span class="title-letter">LETRA: ${letter}</span>
                        <button class="btn-addTopic">Adicionar tópico</button>
                        <div class="box-topics">                  
                    `;
    for (const topic in dictionary[letter]) {
      let topicHTML = `<div class="box-topic">
                        <span class="title-topic">Tópico:</span>
                        <input type="text" class="topic-input" value="${topic}" />
                        <button class="deleteTopic-btn">Apagar</button>
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
    deleteBtn.onclick = toggleAnswer;
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
  console.log(boxTopic.lastElementChild);
  boxTopic.lastElementChild.onclick = addAnswer;
  boxTopic.lastElementChild.click(); // add one answer by default

  boxTopics.appendChild(boxTopic);
}

function toggleAnswer({ target }) {
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

function addAnswer({ target }) {
  const newAnswerBox = document.createElement('div');
  newAnswerBox.classList.add('box-answer');
  newAnswerBox.innerHTML = `<input type="text" class="answer-input" value="" />
                            <button class="delete-btn">Apagar</button>`;
  newAnswerBox.children[1].onclick = toggleAnswer;
  target.parentNode.insertBefore(newAnswerBox, target);
}
