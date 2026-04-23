const { app, globalShortcut } = require('electron');
const { toggleOverlay, setupIpc } = require('./overlay');
const { createTray } = require('./tray');

app.whenReady().then(() => {
  setupIpc();

  globalShortcut.register('CommandOrControl+Shift+C', toggleOverlay);

  createTray(toggleOverlay, () => app.quit());
});

app.on('window-all-closed', () => app.quit());
