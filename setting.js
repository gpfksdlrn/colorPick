const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    copyFormat: 'hex',
    shortcut: 'CommandOrControl+Shift+C',
    history: [],
  },
});

function getCopyFormat() { return store.get('copyFormat'); }
function setCopyFormat(format) { store.set('copyFormat', format); }
function getShortcut() { return store.get('shortcut'); }
function setShortcut(shortcut) { store.set('shortcut', shortcut); }
function getHistory() {
  const history = store.get('history');
  if (history.length > 0 && typeof history[0] !== 'object') {
    store.set('history', []);
    return [];
  }
  return history;
}
function addToHistory({ value, hex }) {
  const next = [{ value, hex }, ...getHistory().filter((h) => h.value !== value)].slice(0, 5);
  store.set('history', next);
}

module.exports = { getCopyFormat, setCopyFormat, getShortcut, setShortcut, getHistory, addToHistory };
