const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#fafaf9',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  if (isDev) {
    // Development mode - load from localhost:3000
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built Next.js app
    mainWindow.loadURL(`http://localhost:${process.env.PORT || 3000}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  if (isDev) {
    // In dev mode, assume Next.js dev server is already running
    return;
  }

  // In production, start the Next.js server
  const nextBin = path.join(__dirname, '../node_modules/.bin/next');
  nextServer = spawn(nextBin, ['start', '-p', process.env.PORT || '3000'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env },
  });

  nextServer.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
  });

  nextServer.stderr.on('data', (data) => {
    console.error(`Next.js Error: ${data}`);
  });
}

app.whenReady().then(() => {
  startNextServer();

  // Wait a bit for Next.js to start, then create window
  setTimeout(() => {
    createWindow();
  }, isDev ? 1000 : 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nextServer) {
      nextServer.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});
