const { app, globalShortcut } = require('electron');
const { toggleOverlay, setupIpc } = require('./overlay');
const { createTray } = require('./tray');

app.whenReady().then(() => {
  setupIpc();

  globalShortcut.register('CommandOrControl+Shift+C', toggleOverlay);

  createTray(toggleOverlay, () => app.quit());
});

// 창 다 닫혀도 앱 유지 (트레이에서 계속 실행)
app.on('window-all-closed', (e) => {
  e.preventDefault();
});
