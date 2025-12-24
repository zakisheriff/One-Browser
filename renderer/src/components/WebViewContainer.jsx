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
            e.preventDefault();
            showContextMenu([
                { label: 'Back', action: () => webview.goBack(), enabled: webview.canGoBack() },
                { label: 'Forward', action: () => webview.goForward(), enabled: webview.canGoForward() },
                { label: 'Reload', action: () => webview.reload() },
                { type: 'separator' },
                { label: 'View Page Source', action: () => webview.loadURL('view-source:' + webview.getURL()) },
                { label: 'Inspect Element', action: () => webview.inspectElement(e.x, e.y) },
            ], e.clientX, e.clientY, theme);
        };

        // Close popovers when webview gets focus (user clicks inside)
        const handleFocus = () => {
            onFocus?.();
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

function showContextMenu(items, x, y, theme) {
    const existingMenu = document.getElementById('custom-context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    menu.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px; z-index: 9999;
    min-width: 180px; padding: 6px 0; border-radius: 12px;
    background: ${theme === 'dark' ? '#1a1a1a' : '#fff'};
    border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px;
  `;

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
      `;
            btn.onmouseenter = () => { if (item.enabled !== false) btn.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; };
            btn.onmouseleave = () => { btn.style.background = 'transparent'; };
            btn.onclick = () => { item.action?.(); menu.remove(); };
            menu.appendChild(btn);
        }
    });

    document.body.appendChild(menu);
    setTimeout(() => {
        const close = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
        document.addEventListener('click', close);
    }, 0);
}

WebViewContainer.displayName = 'WebViewContainer';

export default WebViewContainer;
