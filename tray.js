const { Tray, Menu, nativeImage, BrowserWindow } = require('electron');
const path = require('path');

let tray = null;
let settingsWindow = null;

function openSettings() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 300,
    height: 320,
    frame: true,
    resizable: false,
    title: '설정',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, 'setting.html'));
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createTray(onToggle, onQuit) {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, 'Logo', 'tray-iconTemplate.png'),
  );
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Color Picker');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '스포이드 실행', click: onToggle },
      { label: '설정', click: openSettings },
      { type: 'separator' },
      { label: '종료', click: onQuit },
    ]),
  );
}

module.exports = { createTray };
