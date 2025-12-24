const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    fullscreen: () => ipcRenderer.invoke('window:fullscreen'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    isFullScreen: () => ipcRenderer.invoke('window:isFullScreen'),

    // Tab events from main process
    onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
    onCloseTab: (callback) => ipcRenderer.on('tab:close', callback),
    onReloadTab: (callback) => ipcRenderer.on('tab:reload', callback),
    onNewTabRequested: (callback) => ipcRenderer.on('new-tab-requested', (_, url) => callback(url)),


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
    clearDownloads: () => ipcRenderer.invoke('downloads:clear'),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
});
