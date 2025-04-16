const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Handle image conversion
ipcMain.handle('convert-image', async (_, options) => {
  const { inputPath, format, quality, removeMetadata } = options;
  const outputPath = inputPath.replace(/\.\w+$/, `.${format}`);
  let image = sharp(inputPath);

  if (removeMetadata) {
    image = image.withMetadata({ exif: false, iptc: false });
  }

  if (format === 'jpeg') {
    await image.jpeg({ quality }).toFile(outputPath);
  } else if (format === 'png') {
    await image.png({ quality }).toFile(outputPath);
  } else if (format === 'webp') {
    await image.webp({ quality }).toFile(outputPath);
  }

  return outputPath;
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] });
  return result.filePaths[0];
});
