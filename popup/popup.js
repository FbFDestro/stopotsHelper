const toggleActiveBox = document.getElementById('toggle-active');
const warnBox = document.getElementsByClassName('warn')[0];
const dictionaryBtn = document.getElementById('myDictionaryBtn');
let isActive = null;

function main() {
  dictionaryBtn.onclick = () => {
    chrome.runtime.openOptionsPage();
  };

  chrome.storage.local.get(['active'], function ({ active }) {
    isActive = active;
    createToggleActiveBtn();
  });
}
main();

function createToggleActiveBtn() {
  btn = document.createElement('button');
  toggleActiveBtn(btn);

  toggleActiveBox.appendChild(btn);

  btn.onclick = () => {
    chrome.storage.local.set({ active: !isActive }, () => {
      isActive = !isActive;
      toggleActiveBtn(btn);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleActive' });
    });
  };
}

function toggleActiveBtn(btn) {
  if (isActive) {
    btn.classList.add('red');
    warnBox.classList.add('hidden');
    btn.innerText = 'Desativar';
  } else {
    btn.classList.remove('red');
    warnBox.classList.remove('hidden');
    btn.innerText = 'Ativar';
  }
}
