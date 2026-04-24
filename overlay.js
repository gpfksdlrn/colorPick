const { BrowserWindow, screen, ipcMain, clipboard, systemPreferences, dialog, shell, app } = require('electron');
const path = require('path');
const { getRegionAt } = require('./colorPicker');
const { showToast, showFormatToast } = require('./toast');
const { getCopyFormat, setCopyFormat } = require('./setting');

let overlayWindow = null;

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
  overlayWindow.loadFile(path.join(__dirname, 'overlay.html'));
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function toggleOverlay() {
  if (overlayWindow) {
    overlayWindow.close();
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
  ipcMain.handle('get-region', async (_, { x, y }) => {
    return await getRegionAt(x, y);
  });

  ipcMain.handle('copy-and-close', (_, { hex, rgb, hsl }) => {
    const format = getCopyFormat();
    let text;
    if (format === 'rgb') text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    else if (format === 'hsl') text = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    else text = hex;

    clipboard.writeText(text);
    const point = screen.getCursorScreenPoint();
    if (overlayWindow) overlayWindow.close();
    showToast(text, point);
  });

  ipcMain.handle('close-overlay', () => {
    if (overlayWindow) overlayWindow.close();
  });

  ipcMain.handle('get-format', () => getCopyFormat());

  ipcMain.handle('set-format', (_, format) => setCopyFormat(format));

  ipcMain.handle('show-format-toast', (_, format) => {
    const labels = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL' };
    const point = screen.getCursorScreenPoint();
    showFormatToast(labels[format], point);
  });
}

module.exports = { toggleOverlay, setupIpc };
