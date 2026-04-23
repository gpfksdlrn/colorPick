const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    copyFormat: 'hex', // 'hex' | 'rgb' | 'hsl'
  },
});

function getCopyFormat() {
  return store.get('copyFormat');
}

function setCopyFormat(format) {
  store.set('copyFormat', format);
}

module.exports = { getCopyFormat, setCopyFormat };
