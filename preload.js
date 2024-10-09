// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exec: (fileName) => ipcRenderer.invoke('exec-command', fileName),
  hide: () => ipcRenderer.invoke('hide'),
  getJsonData: () => ipcRenderer.invoke('get-json-data'),
  uploadFilePath: (filePath) => ipcRenderer.invoke('upload-file-path', filePath),
  setAutoHeight: (n) => ipcRenderer.invoke('set-auto-height', n),
  focusInput: (callback) => ipcRenderer.on('focus-search', (_event, value) => callback(value))
});