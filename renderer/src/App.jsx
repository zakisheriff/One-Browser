import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Titlebar from './components/Titlebar';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import WebViewContainer from './components/WebViewContainer';
import NewTabPage from './components/NewTabPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TabProvider, useTabs } from './context/TabContext';

const BrowserApp = memo(function BrowserApp() {
    const { theme } = useTheme();
    const { tabs, activeTabId, addTab, removeTab, updateTab } = useTabs();

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

    const handleGoBack = useCallback(() => webviewRefs.current[activeTabId]?.goBack(), [activeTabId]);
    const handleGoForward = useCallback(() => webviewRefs.current[activeTabId]?.goForward(), [activeTabId]);
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
        // Close all popovers when clicking on content area
        closePopoversRef.current?.();
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
                            tab.id === activeTabId && <NewTabPage onNavigate={handleNavigate} />
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
            />

            <div className="py-2 px-2">
                <TabBar />
            </div>
        </div>
    );
});

function App() {
    return (
        <ThemeProvider>
            <TabProvider>
                <BrowserApp />
            </TabProvider>
        </ThemeProvider>
    );
}

export default App;
