import React, { useRef, useEffect, useImperativeHandle, forwardRef, memo, useState, useCallback } from 'react';
import { useTabs } from '../context/TabContext';
import { useTheme } from '../context/ThemeContext';

const WebViewContainer = memo(forwardRef(({ url, tabId, onFocus, onOpenInNewTab }, ref) => {
    const webviewRef = useRef(null);
    const { updateTab } = useTabs();
    const { theme } = useTheme();
    const [loadProgress, setLoadProgress] = useState(0);
    const isLoadingRef = useRef(false);

    // Fix: Wait for DOM ready for post requests
    const [isDomReady, setIsDomReady] = useState(false);
    const hasLoadedPostDataRef = useRef(false);

    useImperativeHandle(ref, () => ({
        goBack: () => webviewRef.current?.goBack(),
        goForward: () => webviewRef.current?.goForward(),
        reload: () => webviewRef.current?.reload(),
        stop: () => webviewRef.current?.stop(),
        canGoBack: () => webviewRef.current?.canGoBack() || false,
        canGoForward: () => webviewRef.current?.canGoForward() || false,
    }));

    // Define handleFocus in component scope to avoid closure/reference issues
    const handleFocus = useCallback(() => {
        onFocus?.();
        const existingMenu = document.getElementById('custom-context-menu');
        if (existingMenu) existingMenu.remove();
        const backdrop = document.getElementById('context-menu-backdrop');
        if (backdrop) backdrop.remove();
    }, [onFocus]);

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

        const handleDidStopLoading = () => {
            if (isLoadingRef.current) {
                isLoadingRef.current = false;
                setLoadProgress(100);
                updateTab(tabId, { loading: false });
                setTimeout(() => setLoadProgress(0), 200);
            }
        };

        const handleDidFailLoad = (e) => {
            if (e.errorCode === -3) return;
            isLoadingRef.current = false;
            setLoadProgress(0);
            updateTab(tabId, { loading: false });
        };

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

        const handleNewWindow = (e) => {
            if (e.url.includes('programming-link.info') || e.url.includes('tutorials-forum.info')) {
                return;
            }
            e.preventDefault();
            if (onOpenInNewTab) {
                onOpenInNewTab(e.url, { referrer: webview.getURL() });
            }
        };

        const handleContextMenu = (e) => {
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
                            await window.electronAPI.savePage();
                        }
                    }
                },
                { label: 'Print...', action: () => webview.print() },
                { type: 'separator' },
            ];

            if (params.mediaType === 'image') {
                menuItems.push(
                    { label: 'Save Image As...', action: () => window.electronAPI?.saveImage(params.srcURL) },
                    { label: 'Search Image with Google', action: () => onFocus && window.open(`https://www.google.com/searchbyimage?image_url=${encodeURIComponent(params.srcURL)}`, '_blank') },
                    { type: 'separator' }
                );
            }

            if (params.linkURL) {
                menuItems.push(
                    {
                        label: 'Open Link in New Tab',
                        action: () => {
                            if (onOpenInNewTab) {
                                onOpenInNewTab(params.linkURL, { referrer: webview.getURL() });
                            }
                        }
                    },
                    {
                        label: 'Open Link in New Window',
                        action: () => window.electronAPI?.createWindow && window.electronAPI.createWindow(params.linkURL)
                    },
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

            menuItems.push(
                { label: 'View Page Source', action: () => webview.loadURL('view-source:' + webview.getURL()) },
                { label: 'Inspect Element', action: () => webview.openDevTools({ mode: 'right' }) }
            );

            const rect = webview.getBoundingClientRect();
            const finalX = rect.left + params.x;
            const finalY = rect.top + params.y;

            showContextMenu(menuItems, finalX, finalY, theme);
        };

        const handleDomReady = () => {
            setIsDomReady(true);
            if (isLoadingRef.current) {
                setLoadProgress(75);
            }
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
        webview.addEventListener('new-window', handleNewWindow);

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
            webview.removeEventListener('new-window', handleNewWindow);
        };
    }, [tabId, updateTab, theme, onFocus, onOpenInNewTab, handleFocus]);

    const { tabs } = useTabs();
    const currentTab = tabs.find(t => t.id === tabId);
    const referrer = currentTab?.referrer || '';
    const postBody = currentTab?.postBody;
    const contentType = currentTab?.contentType;
    const originalUrl = currentTab?.originalUrl;

    useEffect(() => {
        if (postBody && isDomReady && webviewRef.current && !hasLoadedPostDataRef.current) {
            hasLoadedPostDataRef.current = true;
            const targetUrl = originalUrl || url;
            webviewRef.current.loadURL(targetUrl, {
                postData: postBody,
                httpReferrer: referrer,
                extraHeaders: contentType ? `Content-Type: ${contentType}\n` : undefined
            });
        }
    }, [postBody, url, originalUrl, referrer, contentType, isDomReady]);

    return (
        <div
            className="h-full w-full overflow-hidden rounded-2xl relative bg-white"
            onClick={handleFocus}
            onMouseDown={handleFocus}
        >
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
                src={postBody ? 'about:blank' : url}
                className="w-full h-full"
                allowpopups="true"
                partition="persist:main"
                useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
                httpreferrer={referrer}
                webpreferences="contextIsolation=no, javascript=yes, webSecurity=yes, allowRunningInsecureContent=no"
            />
        </div>
    );
}));

function showContextMenu(items, x, y, theme, bounds) {
    const existingMenu = document.getElementById('custom-context-menu');
    const existingBackdrop = document.getElementById('context-menu-backdrop');
    if (existingMenu) existingMenu.remove();
    if (existingBackdrop) existingBackdrop.remove();

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

    const menu = document.createElement('div');
    menu.id = 'custom-context-menu';
    menu.style.cssText = `
    position: fixed; left: 0; top: 0; z-index: 9999; opacity: 1; pointer-events: auto;
    min-width: 180px; padding: 6px 0; border-radius: 12px;
    background: ${theme === 'dark' ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)'};
    backdrop-filter: blur(12px);
    border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px;
    animation: fadeIn 0.1s ease-out;
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

    const rect = menu.getBoundingClientRect();
    const limitLeft = bounds ? bounds.left : 0;
    const limitTop = bounds ? bounds.top : 0;
    const limitWidth = bounds ? bounds.width : window.innerWidth;
    const limitHeight = bounds ? bounds.height : window.innerHeight;
    const limitRight = limitLeft + limitWidth;
    const limitBottom = limitTop + limitHeight;

    let finalX = x - 10;
    let finalY = y - 10;

    if (finalX + rect.width > limitRight) finalX = limitRight - rect.width;
    if (finalY + rect.height > limitBottom) finalY = limitBottom - rect.height;
    if (finalX < limitLeft) finalX = limitLeft;
    if (finalY < limitTop) finalY = limitTop;

    menu.style.left = finalX + 'px';
    menu.style.top = finalY + 'px';
}

WebViewContainer.displayName = 'WebViewContainer';

export default WebViewContainer;
