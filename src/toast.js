const { BrowserWindow, screen } = require('electron');
const path = require('path');

function showToast(hex, cursorPoint) {
  const toast = createToastWindow(cursorPoint);
  toast.webContents.on('did-finish-load', () => {
    toast.webContents.send('toast-data', { type: 'color', value: hex });
  });
}

function showFormatToast(label, cursorPoint) {
  const toast = createToastWindow(cursorPoint);
  toast.webContents.on('did-finish-load', () => {
    toast.webContents.send('toast-data', { type: 'format', value: label });
  });
}

function createToastWindow(cursorPoint) {
  const toast = new BrowserWindow({
    width: 300,
    height: 52,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x: dx, y: dy, width, height } = display.workArea;
  toast.setPosition(dx + Math.floor((width - 300) / 2), dy + height - 80);

  toast.loadFile(path.join(__dirname, '../renderer/toast.html'));

  setTimeout(() => {
    if (!toast.isDestroyed()) toast.close();
  }, 2000);

  return toast;
}

module.exports = { showToast, showFormatToast };
