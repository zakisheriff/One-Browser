const { session } = require('electron');
const path = require('path');
const fs = require('fs');
const { ElectronChromeExtensions } = require('electron-chrome-extensions');

let extensions = null;
const loadedExtensions = new Map();

// Directory to store extension metadata
const extensionsDir = path.join(require('electron').app.getPath('userData'), 'extensions');

// Ensure extensions directory exists
function ensureExtensionsDir() {
    if (!fs.existsSync(extensionsDir)) {
        fs.mkdirSync(extensionsDir, { recursive: true });
    }
}

// Initialize Chrome extensions support
function initExtensions(browserSession, createTab, createWindow, removeTab) {
    if (extensions) return extensions;

    extensions = new ElectronChromeExtensions({
        session: browserSession,
        createTab: createTab,
        createWindow: createWindow,
        removeTab: removeTab,
    });

    ensureExtensionsDir();

    // Load persisted extensions
    loadPersistedExtensions(browserSession);

    return extensions;
}

// Load an extension from a path
async function loadExtension(extensionPath) {
    try {
        const ses = session.fromPartition('persist:main');
        const extension = await ses.loadExtension(extensionPath, {
            allowFileAccess: true
        });

        loadedExtensions.set(extension.id, {
            id: extension.id,
            name: extension.name,
            version: extension.version,
            path: extensionPath,
            manifest: extension.manifest,
        });

        // Persist extension path
        saveExtensionPaths();

        return {
            success: true,
            extension: {
                id: extension.id,
                name: extension.name,
                version: extension.version,
                icon: getExtensionIcon(extensionPath, extension.manifest),
            }
        };
    } catch (error) {
        console.error('Failed to load extension:', error);
        return { success: false, error: error.message };
    }
}

// Get extension icon path
function getExtensionIcon(extPath, manifest) {
    if (manifest.icons) {
        // Try to get the largest icon
        const sizes = ['128', '64', '48', '32', '16'];
        for (const size of sizes) {
            if (manifest.icons[size]) {
                return path.join(extPath, manifest.icons[size]);
            }
        }
    }
    return null;
}

// Get all loaded extensions
function getExtensions() {
    const ses = session.fromPartition('persist:main');
    const allExtensions = ses.getAllExtensions();

    return allExtensions.map(ext => ({
        id: ext.id,
        name: ext.name,
        version: ext.version,
        path: ext.path,
        icon: getExtensionIcon(ext.path, ext.manifest),
    }));
}

// Remove an extension
async function removeExtension(extensionId) {
    try {
        const ses = session.fromPartition('persist:main');
        await ses.removeExtension(extensionId);
        loadedExtensions.delete(extensionId);
        saveExtensionPaths();
        return { success: true };
    } catch (error) {
        console.error('Failed to remove extension:', error);
        return { success: false, error: error.message };
    }
}

// Save extension paths for persistence
function saveExtensionPaths() {
    const paths = [];
    loadedExtensions.forEach((ext) => {
        paths.push(ext.path);
    });

    const configPath = path.join(extensionsDir, 'extensions.json');
    fs.writeFileSync(configPath, JSON.stringify(paths, null, 2));
}

// Load persisted extensions on startup
function loadPersistedExtensions(browserSession) {
    const configPath = path.join(extensionsDir, 'extensions.json');

    if (fs.existsSync(configPath)) {
        try {
            const paths = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            for (const extPath of paths) {
                if (fs.existsSync(extPath)) {
                    browserSession.loadExtension(extPath, { allowFileAccess: true })
                        .then(ext => {
                            loadedExtensions.set(ext.id, {
                                id: ext.id,
                                name: ext.name,
                                version: ext.version,
                                path: extPath,
                                manifest: ext.manifest,
                            });
                        })
                        .catch(err => console.error('Failed to load persisted extension:', err));
                }
            }
        } catch (error) {
            console.error('Failed to parse extensions config:', error);
        }
    }
}

// Get extension popup URL
function getExtensionPopupUrl(extensionId) {
    const ses = session.fromPartition('persist:main');
    const ext = ses.getExtension(extensionId);

    if (ext && ext.manifest.action && ext.manifest.action.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.action.default_popup}`;
    }
    // Manifest V2 fallback
    if (ext && ext.manifest.browser_action && ext.manifest.browser_action.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.browser_action.default_popup}`;
    }
    return null;
}

module.exports = {
    initExtensions,
    loadExtension,
    getExtensions,
    removeExtension,
    getExtensionPopupUrl,
};
