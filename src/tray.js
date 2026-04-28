const {
  Tray,
  Menu,
  nativeImage,
  BrowserWindow,
  clipboard,
} = require('electron');
const path = require('path');
const { getHistory } = require('./setting');

let tray = null;
let settingsWindow = null;
let _onToggle = null;
let _onQuit = null;

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 560,
    frame: true,
    resizable: false,
    title: '설정',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, '../renderer/setting.html'));
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createColorIcon(hex) {
  if (!hex || typeof hex !== 'string' || hex.length < 7)
    return nativeImage.createEmpty();
  const size = 16;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2 - 0.5;
  const cy = size / 2 - 0.5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= 36) {
        const i = (y * size + x) * 4;
        buf[i] = b;
        buf[i + 1] = g;
        buf[i + 2] = r;
        buf[i + 3] = 255;
      }
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size });
}

function buildMenu() {
  const history = getHistory();

  const template = [
    { label: '스포이드 실행', click: _onToggle },
    { label: '설정', click: openSettings },
    { type: 'separator' },
  ];

  if (history.length > 0) {
    template.push({
      label: '최근 색상',
      submenu: history.map(({ value, hex }) => ({
        label: value,
        icon: createColorIcon(hex),
        click: () => clipboard.writeText(value),
      })),
    });
    template.push({ type: 'separator' });
  }

  template.push({ label: '종료', click: _onQuit });
  return Menu.buildFromTemplate(template);
}

function updateTray() {
  if (tray) tray.setContextMenu(buildMenu());
}

function createTray(onToggle, onQuit) {
  _onToggle = onToggle;
  _onQuit = onQuit;

  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-iconTemplate.png'),
  );
  if (process.platform === 'darwin') icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Color Picker');
  tray.setContextMenu(buildMenu());
}

module.exports = { createTray, updateTray };
