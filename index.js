// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron')
const { runIpcBind } = require('./ipcBind.js')
const path = require('node:path')

let mainWindow = undefined;
let isDebug = false;
let mainDisplay = undefined;
const createWindow = () => {
  mainDisplay = screen.getPrimaryDisplay()
  mainWindow = new BrowserWindow({
    width: mainDisplay.size.width * 0.8,
    height: 50,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  // 加载 index.html
  mainWindow.loadFile('index.html')
  mainWindow.setMenu(null);
  mainWindow.setPosition(Math.floor(mainDisplay.size.width * 0.1), Math.floor(mainDisplay.size.height * 0.2));

  runIpcBind(mainWindow, mainDisplay)
}

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('Alt+M', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  })
  globalShortcut.register('Esc', () => {
    if (mainWindow.isVisible()) {
      app.exit();
    }
  })

  // debug
  globalShortcut.register('Alt+U', () => {
    isDebug = !isDebug;
    mainWindow.setSize(mainDisplay.size.width * 0.8, 300)
    setTimeout(() => { mainWindow.webContents.openDevTools({ mode: "detach", activate: true, }); }, 1000);
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})