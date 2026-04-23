const { BrowserWindow, screen, ipcMain, clipboard } = require('electron');
const { getColorAt, getRegionAt } = require('./colorPicker');
const { showToast } = require('./toast');

let overlayWindow = null;

function createOverlay() {
  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  const { x, y, width, height } = display.bounds;

  overlayWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.loadFile('overlay.html');

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function toggleOverlay() {
  if (overlayWindow) {
    overlayWindow.close();
  } else {
    createOverlay();
  }
}

function setupIpc() {
  ipcMain.handle('get-color', async (_, { x, y }) => {
    return await getColorAt(x, y);
  });

  ipcMain.handle('get-region', async (_, { x, y }) => {
    return await getRegionAt(x, y);
  });

  ipcMain.handle('copy-and-close', (_, hex) => {
    clipboard.writeText(hex);
    const point = screen.getCursorScreenPoint();
    if (overlayWindow) overlayWindow.close();
    showToast(hex, point);
  });

  ipcMain.handle('close-overlay', () => {
    if (overlayWindow) overlayWindow.close();
  });
}

module.exports = { toggleOverlay, setupIpc };
