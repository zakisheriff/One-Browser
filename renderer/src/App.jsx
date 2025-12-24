import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Titlebar from './components/Titlebar';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import WebViewContainer from './components/WebViewContainer';
import NewTabPage from './components/NewTabPage';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TabProvider, useTabs } from './context/TabContext';
import { SettingsProvider } from './context/SettingsContext';

const BrowserApp = memo(function BrowserApp() {
    const { theme } = useTheme();
    const { tabs, activeTabId, addTab, removeTab, updateTab } = useTabs();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const webviewRefs = useRef({});
    const closePopoversRef = useRef(null);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onNewTab(() => addTab());
            window.electronAPI.onCloseTab(() => { if (activeTabId) removeTab(activeTabId); });
            window.electronAPI.onReloadTab(() => { webviewRefs.current[activeTabId]?.reload(); });
        }
    }, []);

    const handleNavigate = useCallback((url) => {
        if (activeTabId) {
            if (!url) webviewRefs.current[activeTabId]?.stop();
            updateTab(activeTabId, { url, loading: !!url, title: url ? 'Loading...' : 'New Tab' });
        }
    }, [activeTabId, updateTab]);

    const handleGoBack = useCallback(() => {
        const webview = webviewRefs.current[activeTabId];
        if (webview?.canGoBack()) {
            webview.goBack();
        } else if (activeTab?.url) {
            // Store current URL for forward navigation, then go to home
            const currentUrl = activeTab.url;
            updateTab(activeTabId, {
                url: '',
                loading: false,
                title: 'New Tab',
                favicon: null,
                lastUrl: currentUrl
            });
        }
    }, [activeTabId, activeTab, updateTab]);

    const handleGoForward = useCallback(() => {
        const webview = webviewRefs.current[activeTabId];
        if (webview?.canGoForward()) {
            webview.goForward();
        } else if (!activeTab?.url && activeTab?.lastUrl) {
            // On home page with stored lastUrl, navigate forward to it
            updateTab(activeTabId, { url: activeTab.lastUrl, loading: true, title: 'Loading...', lastUrl: null });
        }
    }, [activeTabId, activeTab, updateTab]);
    const handleReload = useCallback(() => webviewRefs.current[activeTabId]?.reload(), [activeTabId]);
    const handleStop = useCallback(() => {
        webviewRefs.current[activeTabId]?.stop();
        updateTab(activeTabId, { loading: false });
    }, [activeTabId, updateTab]);

    const setWebviewRef = useCallback((tabId, ref) => {
        if (ref) webviewRefs.current[tabId] = ref;
        else delete webviewRefs.current[tabId];
    }, []);

    const handleContentClick = useCallback(() => {
        closePopoversRef.current?.close?.();
    }, []);

    const handleOpenPanel = useCallback((panel) => {
        console.log('handleOpenPanel:', panel);
        if (panel === 'settings') {
            console.log('Opening settings modal');
            setIsSettingsOpen(true);
            closePopoversRef.current?.close?.();
        } else {
            closePopoversRef.current?.open?.(panel);
        }
    }, []);

    return (
        <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <Titlebar />

            <div
                className={`flex-1 relative overflow-hidden mx-3 rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                onClick={handleContentClick}
            >
                {tabs.map((tab) => (
                    <div key={tab.id} className={`absolute inset-0 ${tab.id === activeTabId ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
                        {tab.url ? (
                            <WebViewContainer ref={(ref) => setWebviewRef(tab.id, ref)} url={tab.url} tabId={tab.id} onFocus={handleContentClick} />
                        ) : (
                            tab.id === activeTabId && <NewTabPage onNavigate={handleNavigate} onOpenPanel={handleOpenPanel} />
                        )}
                    </div>
                ))}
            </div>



            <Toolbar
                url={activeTab?.url || ''}
                onNavigate={handleNavigate}
                onGoBack={handleGoBack}
                onGoForward={handleGoForward}
                onReload={handleReload}
                onStop={handleStop}
                isLoading={activeTab?.loading || false}
                closePopoversRef={closePopoversRef}
                onOpenSettings={() => {
                    console.log('App: Opening Settings');
                    if (window.electronAPI?.log) window.electronAPI.log('App: Opening Settings');
                    setIsSettingsOpen(true);
                }}
            />

            <div className="py-2 px-2">
                <TabBar />
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
});

import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <SettingsProvider>
                <ThemeProvider>
                    <TabProvider>
                        <BrowserApp />
                    </TabProvider>
                </ThemeProvider>
            </SettingsProvider>
        </ErrorBoundary>
    );
}

export default App;
