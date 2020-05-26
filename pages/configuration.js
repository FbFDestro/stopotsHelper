const dictionaryDiv = document.getElementById('dictionary');
let dictionary = {};

chrome.storage.sync.get(['dictionary'], function ({ dictionary: chromeDictionary }) {
  dictionary = chromeDictionary;
  console.log(JSON.stringify(dictionary));
  processDictionary();
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
  console.log(JSON.parse(jsonString));
  chrome.storage.sync.set({
    dictionary: JSON.parse(jsonString),
  });
  console.log('updated');
};

/*
{"A":{"FILME":["rola","pica"],"teste":["a","b","c","d"]},"B":{},"C":{},"D":{"BRINQUEDO":["DADO","DINOSSAURO"],"MSÉ":["ppppp","mae"],"VILÃO":["DEMETRUS","DEAD POOL"]},"E":{},"F":{},"G":{},"H":{"PICA":["aa"]},"I":{},"J":{"Animal":["JIBOIA","JACARE","JUMENTO"],"Cidade":["JUNDIAI","JUIZ DE FORA","JUAZEIRO","JOENVILE"],"Comida":["JAMACA","JESTE","JACA","JUJUBA"],"Flor":["JASMIM"],"MSÉ":["JUMENTA"],"Nome Feminino":["JOANA","JULIANA","JESSICA"],"Palavra em Inglês":["JOGGING"],"Verbo":["JANTAR","JUNTAR","JOGAR","JUNTANDO","JURAR"],"Vestuário":["JAQUETA","JEANS"],"Vilão":["JOKER"]},"K":{},"L":{},"M":{},"N":{},"O":{"App ou Site":["ORKUT"],"Ave":["ORNITORRINCO"],"Celebridade":["OTAVIANO COSTA","OSVALDO CRUZ","OTAVIO MESQUITA"],"Doença":["OSTEOPOROSE"],"PCH":["OLHO","ORELHA"],"Palavra em Inglês":["OTHER","OCTOBER","OLD","OUT"],"Vestuário":["OMBREIRA"],"Vilão":["OSTRA","OROCHIMARU","OTARIO"]},"P":{},"Q":{},"R":{},"S":{},"T":{},"U":{},"V":{},"W":{},"X":{},"Y":{},"Z":{}}
*/
