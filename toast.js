const { BrowserWindow, screen } = require('electron');
const path = require('path');

function showToast(hex, cursorPoint) {
  const toast = new BrowserWindow({
    width: 220,
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
  toast.setPosition(dx + Math.floor((width - 220) / 2), dy + height - 80);

  toast.loadFile(path.join(__dirname, 'toast.html'));

  toast.webContents.on('did-finish-load', () => {
    toast.webContents.send('toast-data', hex);
  });

  setTimeout(() => {
    if (!toast.isDestroyed()) toast.close();
  }, 2000);
}

module.exports = { showToast };
