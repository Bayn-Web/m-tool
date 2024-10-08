// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exec: (fileName) => ipcRenderer.invoke('exec-command', fileName),
  getJsonData: () => ipcRenderer.invoke('get-json-data'),
  uploadFilePath: (filePath) => ipcRenderer.invoke('upload-file-path', filePath),
  showOptions: (show) => ipcRenderer.invoke('show-options', show)
});

ipcRenderer.on('toggle-window', (event, isHidden) => {
  // 触发渲染进程中的事件
  window.dispatchEvent(new CustomEvent('toggle-window-event', { isHidden }));
});