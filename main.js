const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
  screen,
} = require('electron');
const { ipcMain, clipboard } = require('electron');
const { getColorAtCursor, getColorAt, getRegionAt } = require('./colorPicker');

let tray = null;
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
app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (overlayWindow) {
      overlayWindow.close();
    } else {
      createOverlay();
    }
  });

  ipcMain.handle('get-color', async (_, { x, y }) => {
    return await getColorAt(x, y);
  });

  ipcMain.handle('get-region', async (_, { x, y }) => {
    return await getRegionAt(x, y);
  });

  ipcMain.handle('copy-and-close', (_, hex) => {
    clipboard.writeText(hex);
    if (overlayWindow) overlayWindow.close();
  });

  ipcMain.handle('close-overlay', () => {
    if (overlayWindow) overlayWindow.close();
  });

  const icon = nativeImage.createFromNamedImage(
    'NSImageNameColorPanel',
    [-1, 0, 1],
  );
  tray = new Tray(icon);
  tray.setToolTip('Color Picker');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '스포이드 실행', click: () => createOverlay() },
      { label: '종료', click: () => app.quit() },
    ]),
  );
});

app.on('window-all-closed', () => app.quit());
