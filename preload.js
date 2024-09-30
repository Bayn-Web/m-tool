// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exec: (filePath) => ipcRenderer.invoke('exec-command', filePath),
  getJsonData: () => ipcRenderer.invoke('get-json-data'),
  showOptions: (show) => ipcRenderer.invoke('show-options', show),
});

ipcRenderer.on('toggle-window', (event, isHidden) => {
  console.log('Toggle window:', isHidden);
  // 触发渲染进程中的事件
  window.dispatchEvent(new CustomEvent('toggle-window-event', { detail: isHidden }));
});