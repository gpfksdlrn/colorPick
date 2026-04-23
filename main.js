const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
} = require('electron');
const { getColorAtCursor } = require('./colorPicker');

let tray = null;

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile('index.html');

  globalShortcut.register('CommandOrControl+Shift+C', async () => {
    const color = await getColorAtCursor();
    console.log('추출된 색상:', color);
  });

  const icon = nativeImage.createFromNamedImage(
    'NSImageNameColorPanel',
    [-1, 0, 1],
  );
  tray = new Tray(icon);
  tray.setToolTip('Color Picker');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '스포이드 실행', click: () => console.log('트레이에서 실행!') },
      { label: '종료', click: () => app.quit() },
    ]),
  );
});

app.on('window-all-closed', () => app.quit());
