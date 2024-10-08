const { ipcMain, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const jsonPath = './file/index.json';
/**
 * read json
 *  @return {Promise<Array>}
 * */
const getJsonArray = () => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(jsonPath)) {
      fs.readFile(jsonPath, { encoding: "utf-8" }, (err, data) => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (parseError) {
          throw new Error('Error parsing JSON data: ' + parseError.message);
        }
      });
    } else {
      fs.mkdirSync('file');
      fs.writeFile(jsonPath, '[]', { encoding: 'utf-8' }, (writeErr) => {
        if (writeErr) {
          throw new Error('Error writing data: ' + writeErr);
        } else {
          resolve([]);
        }
      });
    }
  })
}

exports.runIpcBind = (mainWindow, mainDisplay) => {
  ipcMain.handle('get-json-data', () => {
    return getJsonArray();
  });

  ipcMain.handle('show-options', (_event, show) => {
    if (!show) {
      mainWindow.setSize(mainDisplay.size.width * 0.8, 50);
    } else {
      mainWindow.setSize(mainDisplay.size.width * 0.8, 300)
    }
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

  ipcMain.handle('upload-file-path', async (event, filePath) => {
    const name = filePath.split('\\')[filePath.split('\\').length - 1];
    const arr = await getJsonArray();
    const has = arr.some((item, index) => {
      if (item.value === name) {
        arr[index].label = filePath;
        return true;
      }
    })
    if (!has) {
      arr.push({
        value: name,
        label: filePath
      })
    }
    fs.writeFile(jsonPath, JSON.stringify(arr), { encoding: 'utf-8' }, (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
      } else {
        console.log('File created successfully.');
      }
    });
  });
}