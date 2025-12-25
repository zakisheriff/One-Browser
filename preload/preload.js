const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    fullscreen: () => ipcRenderer.invoke('window:fullscreen'),
    close: () => ipcRenderer.invoke('window:close'),
    fullscreen: () => ipcRenderer.invoke('window:fullscreen'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    isFullScreen: () => ipcRenderer.invoke('window:isFullScreen'),

    // Tab events from main process
    // Tab events from main process
    onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
    removeNewTabListeners: () => ipcRenderer.removeAllListeners('new-tab'),

    onCloseTab: (callback) => ipcRenderer.on('tab:close', callback),
    removeCloseTabListeners: () => ipcRenderer.removeAllListeners('tab:close'),

    onReloadTab: (callback) => ipcRenderer.on('tab:reload', callback),
    removeReloadTabListeners: () => ipcRenderer.removeAllListeners('tab:reload'),

    onNewTabRequested: (callback) => ipcRenderer.on('new-tab-requested', (_, url, data) => callback(url, data)),
    removeNewTabRequestedListeners: () => ipcRenderer.removeAllListeners('new-tab-requested'),

    // Bookmarks
    getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
    addBookmark: (bookmark) => ipcRenderer.invoke('bookmarks:add', bookmark),
    removeBookmark: (url) => ipcRenderer.invoke('bookmarks:remove', url),

    // History
    getHistory: () => ipcRenderer.invoke('history:get'),
    addHistory: (entry) => ipcRenderer.invoke('history:add', entry),
    clearHistory: () => ipcRenderer.invoke('history:clear'),
    removeHistoryItem: (url) => ipcRenderer.invoke('history:removeItem', url),

    // Search suggestions
    getSuggestions: (query) => ipcRenderer.invoke('search:suggestions', query),

    // Advanced Page Actions
    savePage: () => ipcRenderer.invoke('page:save'),
    printPage: () => ipcRenderer.invoke('page:print'),

    // Debugging
    log: (...args) => ipcRenderer.invoke('log', args),

    // Settings
    getSettings: () => ipcRenderer.invoke('settings:get'),
    saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

    // Downloads
    getDownloads: () => ipcRenderer.invoke('downloads:get'),
    saveImage: (url) => ipcRenderer.invoke('image:save', url),
    cancelDownload: (id) => ipcRenderer.invoke('downloads:cancel', id),
    removeDownload: (id) => ipcRenderer.invoke('downloads:remove', id),
    saveImage: (url) => ipcRenderer.invoke('image:save', url),
    cancelDownload: (id) => ipcRenderer.invoke('downloads:cancel', id),
    removeDownload: (id) => ipcRenderer.invoke('downloads:remove', id),
    clearDownloads: () => ipcRenderer.invoke('downloads:clear'),
    createWindow: (url) => ipcRenderer.invoke('window:create', url),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
    onGlobalClick: (callback) => ipcRenderer.on('global-click', () => callback()),
    removeGlobalClickListeners: () => ipcRenderer.removeAllListeners('global-click'),
    inspectElement: (webContentsId, x, y) => ipcRenderer.invoke('inspect-element', webContentsId, x, y),
    openDevTools: (webContentsId, mode) => ipcRenderer.invoke('open-devtools', webContentsId, mode),
    toggleDevTools: (webContentsId) => ipcRenderer.invoke('toggle-devtools', webContentsId),
    createIncognitoWindow: () => ipcRenderer.invoke('window:incognito'),
    onShowAbout: (callback) => ipcRenderer.on('show-about', () => callback()),
    removeShowAboutListeners: () => ipcRenderer.removeAllListeners('show-about'),

    // Extensions
    loadExtension: () => ipcRenderer.invoke('extensions:load'),
    getExtensions: () => ipcRenderer.invoke('extensions:get'),
    removeExtension: (id) => ipcRenderer.invoke('extensions:remove', id),
    getExtensionPopupUrl: (id) => ipcRenderer.invoke('extensions:getPopupUrl', id),
});
