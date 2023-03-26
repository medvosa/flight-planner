const { app, BrowserWindow, screen: electronScreen } = require('electron');
const path = require('path');

const createMainWindow = () => {
  let mainWindow = new BrowserWindow({
    width: electronScreen.getPrimaryDisplay().workArea.width,
    height: electronScreen.getPrimaryDisplay().workArea.height,
    show: false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // If you're using Electron v12 or later, you might need to set contextIsolation to false
      webSecurity: false, // Disable webSecurity to allow loading local resources
    }
  });

  const startURL = path.join(__dirname, '../build/index.html');
//   const startURL = './build/index.html';
//   const startURL = 'http://localhost:1324';

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});