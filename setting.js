const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    copyFormat: 'hex',
    shortcut: 'CommandOrControl+Shift+C',
  },
});

function getCopyFormat() { return store.get('copyFormat'); }
function setCopyFormat(format) { store.set('copyFormat', format); }
function getShortcut() { return store.get('shortcut'); }
function setShortcut(shortcut) { store.set('shortcut', shortcut); }

module.exports = { getCopyFormat, setCopyFormat, getShortcut, setShortcut };
