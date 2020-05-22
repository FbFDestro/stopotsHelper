const initialDictionary = {
  A: {},
  B: {},
  C: {},
  D: {},
  E: {},
  F: {},
  G: {},
  H: {},
  I: {},
  J: {},
  K: {},
  L: {},
  M: {},
  N: {},
  O: {},
  P: {},
  Q: {},
  R: {},
  S: {},
  T: {},
  U: {},
  V: {},
  W: {},
  X: {},
  Y: {},
  Z: {},
};

chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.sync.get(['dictionary'], function ({ dictionary }) {
    // checks if it's the first time the extension is running
    if (dictionary) {
      mergeDictionary(dictionary);
    }
    console.log(initialDictionary);
    chrome.storage.sync.set({
      dictionary: initialDictionary,
    });
  });
});

/**
 * Merge initial dictionary setted by hard-code with current user's dictionary
 * @param {*} dictionary
 */
function mergeDictionary(dictionary) {
  for (letter in dictionary) {
    for (topic in dictionary[letter]) {
      const currentArray = dictionary[letter][topic];
      if (!(topic in initialDictionary[letter])) {
        initialDictionary[letter][topic] = currentArray;
      } else {
        const initialArray = initialDictionary[letter][topic];
        initialDictionary[letter][topic] = mergeArray(initialArray, currentArray);
      }
    }
  }
}

function mergeArray(a, b) {
  return a.concat(b.filter((item) => a.indexOf(item) < 0));
}
