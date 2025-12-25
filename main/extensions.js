const { session, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { ElectronChromeExtensions } = require('electron-chrome-extensions');
const https = require('https');
const { createWriteStream, createReadStream } = require('fs');
const { pipeline } = require('stream/promises');
const { execSync } = require('child_process');

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

// Extract extension ID from Chrome Web Store URL
function extractExtensionId(url) {
    // Match URLs like: https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm
    // or: https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm
    const patterns = [
        /chrome\.google\.com\/webstore\/detail\/[^\/]+\/([a-z]{32})/i,
        /chromewebstore\.google\.com\/detail\/[^\/]+\/([a-z]{32})/i,
        /chrome\.google\.com\/webstore\/detail\/([a-z]{32})/i,
        /chromewebstore\.google\.com\/detail\/([a-z]{32})/i,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    // Check if it's just an extension ID
    if (/^[a-z]{32}$/i.test(url.trim())) {
        return url.trim().toLowerCase();
    }

    return null;
}

// Download CRX file from Chrome Web Store
async function downloadCrx(extensionId) {
    return new Promise((resolve, reject) => {
        ensureExtensionsDir();

        const crxPath = path.join(extensionsDir, `${extensionId}.crx`);

        // Google's CRX download URL
        // Using the update check URL which returns CRX for Chromium-based browsers
        const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&prodversion=120.0.0.0&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;

        console.log('Downloading CRX from:', crxUrl);

        const file = createWriteStream(crxPath);

        const request = https.get(crxUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (response) => {
            // Handle redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                const redirectUrl = response.headers.location;
                console.log('Redirecting to:', redirectUrl);

                https.get(redirectUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                }, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Failed to download CRX: HTTP ${res.statusCode}`));
                        return;
                    }
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(crxPath);
                    });
                }).on('error', reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download CRX: HTTP ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(crxPath);
            });
        });

        request.on('error', (err) => {
            fs.unlink(crxPath, () => { });
            reject(err);
        });
    });
}

// Extract CRX file to directory
function extractCrx(crxPath, extensionId) {
    const extractDir = path.join(extensionsDir, extensionId);

    // Remove existing directory
    if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true });
    }
    fs.mkdirSync(extractDir, { recursive: true });

    // CRX files are ZIP files with a header
    // Read the file and find where the ZIP starts
    const crxBuffer = fs.readFileSync(crxPath);

    // CRX3 magic number: Cr24
    // CRX header structure varies, but ZIP always starts with PK (0x50 0x4B)
    let zipStart = 0;
    for (let i = 0; i < Math.min(crxBuffer.length, 1000); i++) {
        if (crxBuffer[i] === 0x50 && crxBuffer[i + 1] === 0x4B &&
            crxBuffer[i + 2] === 0x03 && crxBuffer[i + 3] === 0x04) {
            zipStart = i;
            break;
        }
    }

    if (zipStart === 0 && crxBuffer[0] !== 0x50) {
        throw new Error('Invalid CRX file format');
    }

    // Extract ZIP portion
    const zipPath = path.join(extensionsDir, `${extensionId}.zip`);
    fs.writeFileSync(zipPath, crxBuffer.slice(zipStart));

    // Use unzip command (available on macOS)
    try {
        execSync(`unzip -o -q "${zipPath}" -d "${extractDir}"`);

        // Clean up
        fs.unlinkSync(zipPath);
        fs.unlinkSync(crxPath);

        return extractDir;
    } catch (error) {
        throw new Error('Failed to extract extension: ' + error.message);
    }
}

// Download and install extension from Chrome Web Store URL
async function downloadExtensionFromUrl(url) {
    try {
        const extensionId = extractExtensionId(url);
        if (!extensionId) {
            return { success: false, error: 'Invalid Chrome Web Store URL' };
        }

        console.log('Downloading extension:', extensionId);

        // Download CRX
        const crxPath = await downloadCrx(extensionId);
        console.log('Downloaded CRX to:', crxPath);

        // Extract CRX
        const extractDir = extractCrx(crxPath, extensionId);
        console.log('Extracted to:', extractDir);

        // Load the extension
        return await loadExtension(extractDir);
    } catch (error) {
        console.error('Failed to download extension:', error);
        return { success: false, error: error.message };
    }
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

        // Also remove the extension directory
        const extDir = path.join(extensionsDir, extensionId);
        if (fs.existsSync(extDir)) {
            fs.rmSync(extDir, { recursive: true });
        }

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
    downloadExtensionFromUrl,
};
