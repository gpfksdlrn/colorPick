const { BrowserWindow, screen, ipcMain, clipboard, systemPreferences, dialog, shell, globalShortcut } = require('electron');
const path = require('path');
const { getRegionAt } = require('./colorPicker');
const { showToast, showFormatToast } = require('./toast');
const { getCopyFormat, setCopyFormat, addToHistory } = require('./setting');
const { updateTray } = require('./tray');

let overlayWindows = [];

const CYCLE_FORMATS = { hex: 'rgb', rgb: 'hsl', hsl: 'hex' };
const FORMAT_LABELS = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL' };

function getScreenPermissionStatus() {
  if (process.platform !== 'darwin') return 'granted';
  return systemPreferences.getMediaAccessStatus('screen');
}

async function showPermissionDialog() {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: '화면 녹화 권한 필요',
    message: 'ColorPick이 화면 색상을 추출하려면 화면 녹화 권한이 필요합니다.',
    detail:
      '① 아래 버튼으로 시스템 설정을 여세요.\n② 화면 녹화 목록에서 ColorPick을 활성화하세요.\n③ 활성화 후 ColorPick을 완전히 종료했다가 다시 실행하세요.',
    buttons: ['시스템 설정 열기', '닫기'],
    defaultId: 0,
    cancelId: 1,
  });

  if (response === 0) {
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
    );
  }
}

function closeAllOverlays() {
  overlayWindows.forEach((win) => { if (!win.isDestroyed()) win.close(); });
}

function createOverlay() {
  const point = screen.getCursorScreenPoint();
  const displays = screen.getAllDisplays();

  getRegionAt(point.x, point.y).catch(() => {});

  displays.forEach((display) => {
    const { x, y, width, height } = display.bounds;
    const win = new BrowserWindow({
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

    win.loadFile(path.join(__dirname, '../renderer/overlay.html'));

    if (display.id === screen.getDisplayNearestPoint(point).id) {
      win.once('ready-to-show', () => win.focus());
    }

    win.on('closed', () => {
      overlayWindows = overlayWindows.filter((w) => w !== win);
      if (overlayWindows.length === 0) {
        globalShortcut.unregister('F');
        updateTray(false);
      }
    });

    overlayWindows.push(win);
  });

  globalShortcut.register('F', () => {
    const next = CYCLE_FORMATS[getCopyFormat()] ?? 'hex';
    setCopyFormat(next);
    showFormatToast(FORMAT_LABELS[next], screen.getCursorScreenPoint());
  });

  updateTray(true);
}

function toggleOverlay() {
  if (overlayWindows.length > 0) {
    closeAllOverlays();
    return;
  }

  const permStatus = getScreenPermissionStatus();
  if (permStatus === 'denied' || permStatus === 'restricted') {
    showPermissionDialog();
    return;
  }

  createOverlay();
}

function setupIpc() {
  ipcMain.handle('get-region', (_, { x, y }) => getRegionAt(x, y));

  ipcMain.handle('copy-and-close', (_, { hex, rgb, hsl }) => {
    const format = getCopyFormat();
    let text;
    if (format === 'rgb') text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    else if (format === 'hsl') text = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    else text = hex;

    clipboard.writeText(text);
    addToHistory({ value: text, hex });
    updateTray();
    const point = screen.getCursorScreenPoint();
    closeAllOverlays();
    showToast(text, point);
  });

  ipcMain.handle('close-overlay', () => closeAllOverlays());

  ipcMain.handle('focus-overlay', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.focus();
  });

  ipcMain.handle('get-format', () => getCopyFormat());

  ipcMain.handle('set-format', (_, format) => setCopyFormat(format));

  ipcMain.handle('show-format-toast', (_, format) => {
    showFormatToast(FORMAT_LABELS[format], screen.getCursorScreenPoint());
  });
}

module.exports = { toggleOverlay, setupIpc };
