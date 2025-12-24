const { app, BrowserWindow, ipcMain, Menu, Tray, session, net, dialog } = require('electron');
const path = require('path');

let mainWindow;
let tray;

const isDev = !app.isPackaged;
const RENDERER_DEV_URL = 'http://localhost:5173';
const RENDERER_PROD_PATH = path.join(__dirname, '../renderer/dist/index.html');

function createWindow(targetUrl) {
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

  // Handle downloads
  webviewSession.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron show a save dialog.
    item.setSaveDialogOptions({
      title: 'Save File',
      defaultPath: item.getFilename(), // Let Electron suggest the filename
      buttonLabel: 'Save'
    });

    const downloadId = Date.now();

    // Track active item
    activeDownloads.set(downloadId, item);

    const entry = {
      id: downloadId,
      filename: item.getFilename(),
      url: item.getURL(),
      timestamp: downloadId,
      state: 'progressing',
      size: 0,
      received: 0,
      startTime: Date.now() // For speed/time calc
    };
    downloads.unshift(entry);

    item.on('updated', (event, state) => {
      const idx = downloads.findIndex(d => d.id === downloadId);
      if (idx !== -1) {
        downloads[idx].state = state;
        downloads[idx].received = item.getReceivedBytes();
        downloads[idx].size = item.getTotalBytes();

        // Emit progress to renderer
        mainWindow?.webContents.send('download-progress', downloads[idx]);
      }

      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        // Progress
      }
    });

    item.once('done', (event, state) => {
      // Remove from active map
      activeDownloads.delete(downloadId);

      const idx = downloads.findIndex(d => d.id === downloadId);
      if (idx !== -1) {
        downloads[idx].state = state; // 'completed', 'cancelled', 'interrupted'
        if (state === 'completed') {
          downloads[idx].path = item.getSavePath();
        }
        // Emit final state
        mainWindow?.webContents.send('download-progress', downloads[idx]);
      }
      if (state === 'completed') {
        console.log('Download successfully');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });

  // Show window when ready to prevent blank flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Intercept new window events from WebViews
  // Track last opened URL to prevent duplicates from multiple webviews
  let lastNewTabUrl = null;
  let lastNewTabTime = 0;

  mainWindow.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.setWindowOpenHandler((details) => {
      const now = Date.now();

      // Prevent duplicate: same URL within 2 seconds
      if (details.url === lastNewTabUrl && (now - lastNewTabTime) < 2000) {
        return { action: 'deny' };
      }

      lastNewTabUrl = details.url;
      lastNewTabTime = now;

      // Send IPC to renderer to open in new tab
      mainWindow.webContents.send('new-tab-requested', details.url);
      return { action: 'deny' };
    });
  });

  // Load the renderer
  if (isDev) {
    const devUrl = new URL(RENDERER_DEV_URL);
    if (targetUrl) devUrl.searchParams.set('initialUrl', targetUrl);
    mainWindow.loadURL(devUrl.toString());
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // For production with file://, query params can be tricky but usually work with loadFile if passed as object or manual hash
    // using loadURL with file protocol is safer for params
    const prodPath = path.join('file://', RENDERER_PROD_PATH);
    const prodUrl = new URL(prodPath);
    if (targetUrl) prodUrl.searchParams.set('initialUrl', targetUrl);
    mainWindow.loadURL(prodUrl.toString());
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

// Downloads storage
let downloads = [];
const activeDownloads = new Map(); // Track active DownloadItems by ID

ipcMain.handle('downloads:get', () => downloads);

ipcMain.handle('downloads:cancel', (_, id) => {
  const item = activeDownloads.get(id);
  if (item) {
    item.cancel();
    return true;
  }
  return false;
});

ipcMain.handle('downloads:remove', (_, id) => {
  downloads = downloads.filter(d => d.id !== id);
  return downloads;
});

ipcMain.handle('downloads:clear', () => {
  // Keep only progressing downloads
  downloads = downloads.filter(d => d.state === 'progressing');
  return downloads;
});

ipcMain.handle('image:save', async (_, url) => {
  try {
    const { nativeImage } = require('electron');
    // Check if SVG before fetching if possible, or check extension
    // We just want to extract filename properly first

    let defaultName = 'image.png';
    let isSvg = false;

    try {
      if (url.startsWith('data:image/svg+xml')) {
        isSvg = true;
        defaultName = `image-${Date.now()}.svg`;
      } else if (url.startsWith('data:image/')) {
        const mime = url.split(';')[0].split(':')[1];
        const ext = mime.split('/')[1] || 'png';
        defaultName = `image-${Date.now()}.${ext}`;
      } else {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const base = path.basename(pathname);
        if (base && base.length > 0) {
          defaultName = decodeURIComponent(base);
        }

        // Check if it's explicitly an svg extension
        if (defaultName.toLowerCase().endsWith('.svg')) {
          isSvg = true;
        } else if (!path.extname(defaultName)) {
          // If no extension, default to png (unless we detect svg later, but for now safe)
          defaultName += '.png';
        }
      }
    } catch (e) {
      console.error('Filename extraction failed:', e);
    }

    const win = BrowserWindow.getFocusedWindow();
    const saveOptions = {
      title: 'Save Image As',
      defaultPath: defaultName
    };

    if (isSvg) {
      saveOptions.filters = [
        { name: 'SVG Image', extensions: ['svg'] },
        { name: 'All Files', extensions: ['*'] }
      ];
    } else {
      // Offer conversion options
      saveOptions.filters = [
        { name: 'All Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
        { name: 'PNG Image', extensions: ['png'] },
        { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
        { name: 'All Files', extensions: ['*'] }
      ];
    }

    const { filePath } = await dialog.showSaveDialog(win, saveOptions);

    if (filePath) {
      const response = await net.fetch(url);
      const buffer = await response.arrayBuffer();

      const ext = path.extname(filePath).toLowerCase();

      // Perform conversion if target format is strictly PNG or JPEG and not SVG
      // Note: nativeImage is robust but check for empty buffer
      if (!isSvg && (ext === '.png' || ext === '.jpg' || ext === '.jpeg')) {
        const image = nativeImage.createFromBuffer(Buffer.from(buffer));
        if (!image.isEmpty()) {
          let savedData;
          if (ext === '.jpg' || ext === '.jpeg') {
            savedData = image.toJPEG(100); // Quality 100
          } else {
            savedData = image.toPNG();
          }
          require('fs').writeFileSync(filePath, savedData);
        } else {
          // Fallback to raw buffer if image creation failed (e.g. unknown format)
          require('fs').writeFileSync(filePath, Buffer.from(buffer));
        }
      } else {
        // Write raw buffer (for SVGs, or if user picked 'All Files' with original extension, or unsupported conversion targets)
        require('fs').writeFileSync(filePath, Buffer.from(buffer));
      }

      // Add to downloads list
      const filename = path.basename(filePath);
      downloads.unshift({
        id: Date.now().toString(),
        filename,
        path: filePath,
        url,
        state: 'completed',
        timestamp: Date.now(),
        size: require('fs').statSync(filePath).size, // Get actual written size
        received: require('fs').statSync(filePath).size
      });

      return { success: true, filePath };
    }
    return { canceled: true };
    return { canceled: true };
  } catch (error) {
    console.error('Image save failed:', error);
    return { error: error.message };
  }
});

// Window creation
ipcMain.handle('window:create', (_, url) => {
  createWindow(url);
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
