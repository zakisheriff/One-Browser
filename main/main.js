const { app, BrowserWindow, ipcMain, Menu, Tray, session, net, dialog } = require('electron');
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

  // Configure the webview session for better compatibility
  const webviewSession = session.fromPartition('persist:main');

  // Set a proper user agent for the webview session
  webviewSession.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Handle permission requests (for things like geolocation, camera, etc.)
  webviewSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
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

// Search suggestions via main process to bypass CORS
ipcMain.handle('search:suggestions', async (_, query) => {
  if (!query || query.length < 1) return [];

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const response = await net.fetch(url);
    const data = await response.json();
    return data && data[1] ? data[1].slice(0, 6) : [];
  } catch (e) {
    return [];
  }
});

// Settings persistence
const fs = require('fs');
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Load settings helper
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return null;
}

// Save settings helper
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

ipcMain.handle('settings:get', () => loadSettings());
ipcMain.handle('settings:save', (_, settings) => {
  saveSettings(settings);
  return true;
});

ipcMain.handle('log', (_, message) => {
  console.log('[Renderer]:', ...message);
});

// Advanced Page Actions
ipcMain.handle('page:print', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  // For webview, we might need to target the webview's webContents, but 
  // currently we are invoking this from the renderer which hosts the webview.
  // The actual printing logic for the *content* of the webview is best handled 
  // via the webview instance methods in the renderer.
  // However, this handler is here if we need to print the app window or proxy.
  // The plan specified webContents.print() which is available directly on the <webview> tag in renderer.
  // So these IPCs might be redundant if we just use the webview reference in React.
  // But let's keep them for structural completeness as requested.
  // Actually, for "Save As", we need main process dialog.
  win.webContents.print();
});

ipcMain.handle('page:save', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { filePath } = await dialog.showSaveDialog(win, {
    defaultPath: 'page.html',
    filters: [{ name: 'Web Page', extensions: ['html'] }]
  });

  if (filePath) {
    // Again, saving the *webview* content usually requires calling savePage on the webview element.
    // The main process savePage saves the *host* window.
    // We will return the path to the renderer so the renderer can call webview.savePage().
    return filePath;
  }
  return null;
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
