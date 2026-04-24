const { app, globalShortcut, desktopCapturer, systemPreferences } = require('electron');
const { toggleOverlay, setupIpc } = require('./overlay');
const { createTray } = require('./tray');

if (app.dock) app.dock.hide();

app.whenReady().then(async () => {
  // macOS TCC 화면 녹화 목록에 앱 등록 (granted가 아닐 때만)
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('screen');
    if (status !== 'granted') {
      desktopCapturer
        .getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } })
        .catch(() => {});
    }
  }

  setupIpc();

  globalShortcut.register('CommandOrControl+Shift+C', toggleOverlay);

  createTray(toggleOverlay, () => app.quit());
  toggleOverlay();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 창 다 닫혀도 앱 유지 (트레이에서 계속 실행)
app.on('window-all-closed', (e) => {
  e.preventDefault();
});
