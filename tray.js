const { Tray, Menu, nativeImage } = require('electron');

let tray = null;

function createTray(onToggle, onQuit) {
  const icon = nativeImage.createFromNamedImage(
    'NSImageNameColorPanel',
    [-1, 0, 1],
  );
  tray = new Tray(icon);
  tray.setToolTip('Color Picker');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '스포이드 실행', click: onToggle },
      { label: '종료', click: onQuit },
    ]),
  );
}

module.exports = { createTray };
