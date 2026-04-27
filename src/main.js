const { app, globalShortcut, desktopCapturer, systemPreferences, ipcMain } = require('electron');
const { toggleOverlay, setupIpc } = require('./overlay');
const { createTray } = require('./tray');
const { getShortcut, setShortcut } = require('./setting');

if (app.dock) app.dock.hide();

let currentShortcut = null;

function registerShortcut(accelerator) {
  if (currentShortcut) globalShortcut.unregister(currentShortcut);
  const ok = globalShortcut.register(accelerator, toggleOverlay);
  if (ok) currentShortcut = accelerator;
  return ok;
}

app.whenReady().then(async () => {
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('screen');
    if (status !== 'granted') {
      desktopCapturer
        .getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } })
        .catch(() => {});
    }
  }

  setupIpc();
  registerShortcut(getShortcut());

  ipcMain.handle('get-shortcut', () => getShortcut());
  ipcMain.handle('update-shortcut', (_, accelerator) => {
    const ok = registerShortcut(accelerator);
    if (ok) setShortcut(accelerator);
    return ok;
  });

  createTray(toggleOverlay, () => app.quit());
  toggleOverlay();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
