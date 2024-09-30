const { ipcMain, screen } = require('electron');
const fs = require('fs');

exports.runIpcBind = (mainWindow) => {
  ipcMain.handle('get-json-data', () => {
    return new Promise((resolve, reject) => {
      fs.readFile('./file/index.json', { encoding: "utf-8" }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  });

  ipcMain.handle('exec-command', async (event, filePath) => {
    return new Promise((resolve, reject) => {
      const exec = require('child_process').exec;
      let workerProcess;
      workerProcess = exec(`start ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      });

      workerProcess.stdout.on('data', (data) => {
        console.log('stdout: ' + data);
      });

      workerProcess.stderr.on('data', (data) => {
        console.log('stderr: ' + data);
      });

      workerProcess.on('close', (code) => {
        console.log('out code：' + code);
      });
    });
  });
}