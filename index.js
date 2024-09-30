// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron')
const { runIpcBind } = require('./ipcBind.js')
const path = require('node:path')

let mainWindow = undefined;
let isHide = false;
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

  ipcMain.handle('show-options', (_event, show) => {
    if (isDebug) return;
    if (!show) {
      mainWindow.hide();
    } else {
      mainWindow.setSize(mainDisplay.size.width * 0.8, 300)
    }
  });
  runIpcBind(mainWindow)
}

app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('Alt+M', () => {
    isHide ? mainWindow.hide() : mainWindow.show();
    isHide = !isHide;
    
    mainWindow.webContents.send('toggle-window', isHide);
  })
  // globalShortcut.register('Esc', () => {
  //   if (!isHide) {
  //     app.exit();
  //   }
  // })

  // debug
  globalShortcut.register('Alt+U', () => {
    isDebug = !isDebug;
    mainWindow.setSize(mainDisplay.size.width * 0.8, 300)
    mainWindow.webContents.openDevTools()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
