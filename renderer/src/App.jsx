import React, { useState, useEffect, useCallback, useRef, memo, useContext } from 'react';
import Titlebar from './components/Titlebar';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import WebViewContainer from './components/WebViewContainer';
import NewTabPage from './components/NewTabPage';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TabProvider, useTabs } from './context/TabContext';
// ... imports
import { SettingsProvider, useSettings } from './context/SettingsContext';

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
            // Handle new tab requests from webviews (intercepted by main process)
            window.electronAPI.onNewTabRequested && window.electronAPI.onNewTabRequested((url) => {
                if (url) addTab(url);
            });
        }
    }, [activeTabId, addTab, removeTab]);

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
        if (panel === 'settings') {
            setIsSettingsOpen(true);
            closePopoversRef.current?.close?.();
        } else {
            closePopoversRef.current?.open?.(panel);
        }
    }, []);

    // Get settings for Toolbar Position
    const { settings } = useSettings() || {};
    const toolbarPosition = settings?.toolbarPosition || 'bottom';
    const isTop = toolbarPosition === 'top';

    return (
        <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <Titlebar />

            {/* TOP TOOLBAR & TABS */}
            {isTop && (
                <>
                    <Toolbar
                        url={activeTab?.url || ''}
                        onNavigate={handleNavigate}
                        onGoBack={handleGoBack}
                        onGoForward={handleGoForward}
                        onReload={handleReload}
                        onStop={handleStop}
                        isLoading={activeTab?.loading || false}
                        closePopoversRef={closePopoversRef}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                    <div className="py-2 px-2">
                        <TabBar />
                    </div>
                </>
            )}

            {/* MAIN CONTENT */}
            <div
                className={`flex-1 relative overflow-hidden mx-3 rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                onClick={handleContentClick}
            >
                {tabs.map((tab) => (
                    <div key={tab.id} className={`absolute inset-0 ${tab.id === activeTabId ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
                        {tab.url ? (
                            <WebViewContainer
                                ref={(ref) => webviewRefs.current[tab.id] = ref}
                                url={tab.url}
                                tabId={tab.id}
                                onFocus={() => setActiveTabId(tab.id)}
                                onOpenInNewTab={(url) => addTab(url)}
                            />
                        ) : (
                            tab.id === activeTabId && <NewTabPage onNavigate={handleNavigate} onOpenPanel={handleOpenPanel} />
                        )}
                    </div>
                ))}
            </div>

            {/* BOTTOM TOOLBAR & TABS */}
            {
                !isTop && (
                    <>
                        <div className="py-2 px-2">
                            <TabBar />
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
                                setIsSettingsOpen(true);
                            }}
                        />
                    </>
                )
            }

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div >
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
