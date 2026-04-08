const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data, fileName) => ipcRenderer.invoke('save-file', data, fileName),
  
  platform: process.platform,
  
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
});