const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const usb = require('usb');


if (require("electron-squirrel-startup")) {
  app.quit();
}

const webusb = new usb.WebUSB({
  allowAllDevices: true
});

const showDevices = async () => {
  const devices = await webusb.getDevices();
  const text = devices.map(d => `${d.vendorId}\t${d.productId}\t${d.serialNumber || '<no serial>'}`);
  text.unshift('VID\tPID\tSerial\n-------------------------------------');

  windows.forEach(win => {
    if (win) {
      win.webContents.send('devices', text.join('\n'));
    }
  });
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  showDevices();
};

app.whenReady().then(() => {
  createWindow();
  webusb.addEventListener('connect', showDevices);
  webusb.addEventListener('disconnect', showDevices);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Читаем файлы в директории
  const files = fs.readdirSync(__dirname);
  console.log("Список файлов в текущей директории:", files);
});

app.on("window-all-closed", () => {
  webusb.removeEventListener('connect', showDevices);
  webusb.removeEventListener('disconnect', showDevices);
  if (process.platform !== "darwin") {
    app.quit();
  }
});
