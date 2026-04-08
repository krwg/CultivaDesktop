// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'Cultiva',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: false,
      sandbox: true
    },
    icon: path.join(__dirname, '../dist/favicon.ico'),
    backgroundColor: '#1c1c1e',
    show: false
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc) => {
  console.error('[Electron] Failed to load:', errorCode, errorDesc);
  mainWindow.webContents.openDevTools(); 
});

mainWindow.webContents.on('render-process-gone', (event, details) => {
  console.error('[Electron] Render process gone:', details);
});


mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data:"]
    }
  });
});



  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-file', async (event, data, fileName) => {
  const { dialog } = require('electron');
  const { writeFile } = require('fs/promises');
  
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Сохранить резервную копию',
    defaultPath: fileName,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  
  if (filePath) {
    await writeFile(filePath, data);
    return { success: true, path: filePath };
  }
  return { success: false };
});