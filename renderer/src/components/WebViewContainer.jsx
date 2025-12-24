import React, { useRef, useEffect, useImperativeHandle, forwardRef, memo, useState, useCallback } from 'react';
import { useTabs } from '../context/TabContext';
import { useTheme } from '../context/ThemeContext';

const WebViewContainer = memo(forwardRef(({ url, tabId, onFocus }, ref) => {
    const webviewRef = useRef(null);
    const { updateTab } = useTabs();
    const { theme } = useTheme();
    const [loadProgress, setLoadProgress] = useState(0);
    const isLoadingRef = useRef(false);

    useImperativeHandle(ref, () => ({
        goBack: () => webviewRef.current?.goBack(),
        goForward: () => webviewRef.current?.goForward(),
        reload: () => webviewRef.current?.reload(),
        stop: () => webviewRef.current?.stop(),
        canGoBack: () => webviewRef.current?.canGoBack() || false,
        canGoForward: () => webviewRef.current?.canGoForward() || false,
    }));

    useEffect(() => {
        const webview = webviewRef.current;
        if (!webview) return;

        const handleDidStartLoading = () => {
            if (!isLoadingRef.current) {
                isLoadingRef.current = true;
                setLoadProgress(15);
                updateTab(tabId, { loading: true });
            }
        };

        const handleLoadCommit = () => {
            if (isLoadingRef.current) {
                setLoadProgress(40);
            }
        };

        const handleDomReady = () => {
            if (isLoadingRef.current) {
                setLoadProgress(75);
            }
        };

        const handleDidStopLoading = () => {
            if (isLoadingRef.current) {
                isLoadingRef.current = false;
                setLoadProgress(100);
                updateTab(tabId, { loading: false });
                // Hide progress bar after animation
                setTimeout(() => setLoadProgress(0), 200);
            }
        };

        const handleDidFailLoad = (e) => {
            // Ignore aborted loads (like when navigating away)
            if (e.errorCode === -3) return;
            isLoadingRef.current = false;
            setLoadProgress(0);
            updateTab(tabId, { loading: false });
        };

        // Handle webview crash - auto reload
        const handleCrashed = () => {
            console.log('Webview crashed, reloading...');
            setTimeout(() => {
                webviewRef.current?.reload();
            }, 500);
        };

        const handlePageTitleUpdated = (e) => updateTab(tabId, { title: e.title });
        const handlePageFaviconUpdated = (e) => {
            if (e.favicons?.length > 0) updateTab(tabId, { favicon: e.favicons[0] });
        };
        const handleDidNavigate = (e) => {
            updateTab(tabId, { url: e.url });
            window.electronAPI?.addHistory({ url: e.url, title: webview.getTitle() });
        };

        const handleContextMenu = (e) => {
            // Electron context-menu event passes params object
            const params = e.params;

            e.preventDefault();

            const menuItems = [
                { label: 'Back', action: () => webview.goBack(), enabled: webview.canGoBack() },
                { label: 'Forward', action: () => webview.goForward(), enabled: webview.canGoForward() },
                { label: 'Reload', action: () => webview.reload() },
                { type: 'separator' },
                {
                    label: 'Save As...', action: async () => {
                        if (window.electronAPI?.savePage) {
                            const path = await window.electronAPI.savePage();
                            // Note: actual save logic would happen here or in main
                            // For fully functional save, we might need webview.getWebContents().savePage()
                            // Since we can't access webContents directly in renderer easily without remote,
                            // we can trigger a download or use the IPC response if implemented.
                            // Simplified for now:
                            console.log('Save initiated to', path);
                        }
                    }
                },
                { label: 'Print...', action: () => webview.print() },
                { type: 'separator' },
            ];

            // Context specific items
            if (params.mediaType === 'image') {
                menuItems.push(
                    { label: 'Save Image As...', action: () => window.electronAPI?.saveImage(params.srcURL) },
                    { label: 'Search Image with Google', action: () => onFocus && window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(params.srcURL)}`, '_blank') },
                    { label: 'Get Image Description (AI)', action: () => console.log('AI Describe', params.srcURL) }, // Placeholder for AI
                    { type: 'separator' }
                );
            }

            if (params.linkURL) {
                menuItems.push(
                    { label: 'Open Link in New Tab', action: () => window.electronAPI?.onNewTab && window.open(params.linkURL, '_blank') }, // Simplified
                    { label: 'Copy Link Address', action: () => navigator.clipboard.writeText(params.linkURL) },
                    { type: 'separator' }
                );
            }

            if (params.selectionText) {
                menuItems.push(
                    { label: `Search for "${params.selectionText.slice(0, 15)}..."`, action: () => onFocus && window.open(`https://www.google.com/search?q=${encodeURIComponent(params.selectionText)}`, '_blank') },
                    { label: 'Copy', action: () => webview.copy() },
                    { type: 'separator' }
                );
            }

            // Developer tools
            menuItems.push(
                { label: 'View Page Source', action: () => webview.loadURL('view-source:' + webview.getURL()) },
                { label: 'Inspect Element', action: () => webview.inspectElement(params.x, params.y) }
            );

            // Calculate correct position
            // params.x/y seem to include some offset or are screen relative in some cases. 
            // Trying without adding rect.left/top if user reports "somewhere else" (double offset).
            const x = params.x;
            const y = params.y;

            if (window.electronAPI?.log) {
                window.electronAPI.log('Opening Context Menu at:', x, y, 'Params:', params, 'Rect:', webview.getBoundingClientRect());
            }

            // Correction for Mac Titlebar offset if needed:
            // If params.y is 0 at top of webview, we DO need to add titlebar height (~80px).
            // But if params.y is 0 at top of SCREEN, we don't.
            // I'll try adding a fixed offset if it's consistently off by the header height.
            // Using rect.top + params.y is the most logical standard, but let's try this based on user feedback.
            // Actually, let's stick to the rect logic BUT with the overflow fix in showContextMenu, it might behave better.
            // User said "opens somewhere else".
            // Let's go with rect offset again but verify rect is correct.
            const rect = webview.getBoundingClientRect();
            const finalX = rect.left + params.x;
            const finalY = rect.top + params.y;

            showContextMenu(menuItems, finalX, finalY, theme);
        };

        // Close popovers when webview gets focus (user clicks inside)
        const handleFocus = () => {
            onFocus?.();
            // Remove context menu if it exists
            const existingMenu = document.getElementById('custom-context-menu');
            if (existingMenu) existingMenu.remove();
        };

        webview.addEventListener('did-start-loading', handleDidStartLoading);
        webview.addEventListener('load-commit', handleLoadCommit);
        webview.addEventListener('dom-ready', handleDomReady);
        webview.addEventListener('did-stop-loading', handleDidStopLoading);
        webview.addEventListener('did-fail-load', handleDidFailLoad);
        webview.addEventListener('page-title-updated', handlePageTitleUpdated);
        webview.addEventListener('page-favicon-updated', handlePageFaviconUpdated);
        webview.addEventListener('did-navigate', handleDidNavigate);
        webview.addEventListener('context-menu', handleContextMenu);
        webview.addEventListener('focus', handleFocus);
        webview.addEventListener('crashed', handleCrashed);
        webview.addEventListener('render-process-gone', handleCrashed);

        return () => {
            webview.removeEventListener('did-start-loading', handleDidStartLoading);
            webview.removeEventListener('load-commit', handleLoadCommit);
            webview.removeEventListener('dom-ready', handleDomReady);
            webview.removeEventListener('did-stop-loading', handleDidStopLoading);
            webview.removeEventListener('did-fail-load', handleDidFailLoad);
            webview.removeEventListener('page-title-updated', handlePageTitleUpdated);
            webview.removeEventListener('page-favicon-updated', handlePageFaviconUpdated);
            webview.removeEventListener('did-navigate', handleDidNavigate);
            webview.removeEventListener('context-menu', handleContextMenu);
            webview.removeEventListener('focus', handleFocus);
            webview.removeEventListener('crashed', handleCrashed);
            webview.removeEventListener('render-process-gone', handleCrashed);
        };
    }, [tabId, updateTab, theme, onFocus]);

    return (
        <div
            className="h-full w-full overflow-hidden rounded-2xl relative bg-white"
            onClick={() => onFocus?.()}
            onMouseDown={() => onFocus?.()}
        >
            {/* Loading Progress Bar */}
            {loadProgress > 0 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-black/5">
                    <div
                        className={`h-full bg-blue-500 ${loadProgress < 100 ? 'transition-all duration-500' : 'transition-all duration-200'}`}
                        style={{ width: `${loadProgress}%`, opacity: loadProgress >= 100 ? 0 : 1 }}
                    />
                </div>
            )}
            <webview
                ref={webviewRef}
                src={url}
                className="w-full h-full"
                allowpopups="true"
                partition="persist:main"
                useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                webpreferences="contextIsolation=no, javascript=yes, webSecurity=yes, allowRunningInsecureContent=no"
            />
        </div>
    );
}));

// function showContextMenu is restored below.

function showContextMenu(items, x, y, theme, bounds) {
    const existingMenu = document.getElementById('custom-context-menu');
    const existingBackdrop = document.getElementById('context-menu-backdrop');
    if (existingMenu) existingMenu.remove();
    if (existingBackdrop) existingBackdrop.remove();

    // 1. Create Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'context-menu-backdrop';
    backdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9998;
        cursor: default;
    `;
    backdrop.onclick = () => {
        const menu = document.getElementById('custom-context-menu');
        if (menu) menu.remove();
        backdrop.remove();
    };
    backdrop.oncontextmenu = (e) => {
        e.preventDefault();
        const menu = document.getElementById('custom-context-menu');
        if (menu) menu.remove();
        backdrop.remove();
    };

    // 2. Create Menu
    const menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    // Initial hidden state to measure size
    menu.style.cssText = `
    position: fixed; left: 0; top: 0; z-index: 9999; opacity: 0; pointer-events: none;
    min-width: 180px; padding: 6px 0; border-radius: 12px;
    background: ${theme === 'dark' ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)'};
    backdrop-filter: blur(12px);
    border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px;
  `;

    // Append items
    items.forEach((item) => {
        if (item.type === 'separator') {
            const sep = document.createElement('div');
            sep.style.cssText = `height: 1px; margin: 6px 12px; background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};`;
            menu.appendChild(sep);
        } else {
            const btn = document.createElement('button');
            btn.textContent = item.label;
            btn.disabled = item.enabled === false;
            btn.style.cssText = `
        display: block; width: 100%; padding: 8px 16px; text-align: left;
        background: transparent; border: none; cursor: default; font-size: 13px;
        color: ${item.enabled === false ? (theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : (theme === 'dark' ? '#fff' : '#000')};
        transition: background 0.1s;
      `;
            btn.onmouseenter = () => { if (item.enabled !== false) btn.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; };
            btn.onmouseleave = () => { btn.style.background = 'transparent'; };
            btn.onclick = () => {
                item.action?.();
                menu.remove();
                backdrop.remove();
            };
            menu.appendChild(btn);
        }
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);

    // Calculate position with overflow protection
    // Calculate position with overflow protection within bounds
    requestAnimationFrame(() => {
        const rect = menu.getBoundingClientRect();

        // Use bounds if provided, else window
        const limitLeft = bounds ? bounds.left : 0;
        const limitTop = bounds ? bounds.top : 0;
        const limitWidth = bounds ? bounds.width : window.innerWidth;
        const limitHeight = bounds ? bounds.height : window.innerHeight;
        const limitRight = limitLeft + limitWidth;
        const limitBottom = limitTop + limitHeight;

        let finalX = x;
        let finalY = y;

        // Overflow Right
        if (finalX + rect.width > limitRight) {
            finalX = limitRight - rect.width - 10;
        }
        // Overflow Bottom
        if (finalY + rect.height > limitBottom) {
            finalY = limitBottom - rect.height - 10;
        }

        // Overflow Left/Top
        if (finalX < limitLeft) finalX = limitLeft + 10;
        if (finalY < limitTop) finalY = limitTop + 10;

        menu.style.left = finalX + 'px';
        menu.style.top = finalY + 'px';
        menu.style.opacity = '1';
        menu.style.pointerEvents = 'auto';
        menu.style.animation = 'fadeIn 0.1s ease-out';
    });
}



WebViewContainer.displayName = 'WebViewContainer';

export default WebViewContainer;
