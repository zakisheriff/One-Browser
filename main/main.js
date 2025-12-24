const { app, BrowserWindow, ipcMain, Menu, Tray, session } = require('electron');
const path = require('path');

let mainWindow;
let tray;

const isDev = !app.isPackaged;
const RENDERER_DEV_URL = 'http://localhost:5173';
const RENDERER_PROD_PATH = path.join(__dirname, '../renderer/dist/index.html');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    show: false,
    fullscreenable: true,
    simpleFullscreen: false, // Use native macOS fullscreen
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
    },
  });

  // Show window when ready to prevent blank flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the renderer
  if (isDev) {
    mainWindow.loadURL(RENDERER_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(RENDERER_PROD_PATH);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Placeholder for tray icon
  // tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'New Window', click: createWindow },
  //   { label: 'Incognito Window', click: createIncognitoWindow },
  //   { type: 'separator' },
  //   { label: 'Quit', click: () => app.quit() },
  // ]);
  // tray.setToolTip('One Browser');
  // tray.setContextMenu(contextMenu);
}

function createIncognitoWindow() {
  const incognitoSession = session.fromPartition('temp', { cache: false });

  const incognitoWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: true,
      session: incognitoSession,
    },
  });

  incognitoWindow.once('ready-to-show', () => {
    incognitoWindow.show();
  });

  if (isDev) {
    incognitoWindow.loadURL(RENDERER_DEV_URL + '?incognito=true');
  } else {
    incognitoWindow.loadFile(RENDERER_PROD_PATH, { query: { incognito: 'true' } });
  }
}

// Application Menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: () => mainWindow?.webContents.send('new-tab') },
        { label: 'New Window', accelerator: 'CmdOrCtrl+N', click: createWindow },
        { label: 'New Incognito Window', accelerator: 'CmdOrCtrl+Shift+N', click: createIncognitoWindow },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow?.webContents.send('close-tab') },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.send('reload-tab') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About One Browser',
          click: () => {
            // Show about dialog
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized());
ipcMain.handle('window:fullscreen', () => {
  if (mainWindow?.isFullScreen()) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow?.setFullScreen(true);
  }
});
ipcMain.handle('window:isFullScreen', () => mainWindow?.isFullScreen());

// Bookmarks storage (simple in-memory for now, can be persisted)
let bookmarks = [];
ipcMain.handle('bookmarks:get', () => bookmarks);
ipcMain.handle('bookmarks:add', (_, bookmark) => {
  bookmarks.push(bookmark);
  return bookmarks;
});
ipcMain.handle('bookmarks:remove', (_, url) => {
  bookmarks = bookmarks.filter((b) => b.url !== url);
  return bookmarks;
});

// History storage
let history = [];
ipcMain.handle('history:get', () => history);
ipcMain.handle('history:add', (_, entry) => {
  history.unshift({ ...entry, timestamp: Date.now() });
  if (history.length > 1000) history = history.slice(0, 1000); // Limit
  return history;
});
ipcMain.handle('history:clear', () => {
  history = [];
  return history;
});
ipcMain.handle('history:removeItem', (_, url) => {
  history = history.filter((h) => h.url !== url);
  return history;
});

// App lifecycle
app.whenReady().then(() => {
  createMenu();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
