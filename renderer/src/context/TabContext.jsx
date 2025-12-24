import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TabContext = createContext();

let tabIdCounter = 1;
const generateTabId = () => `tab-${tabIdCounter++}`;

export function TabProvider({ children }) {
    const [tabs, setTabs] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const initialUrl = params.get('initialUrl');

        if (initialUrl) {
            return [{
                id: 'tab-1',
                url: initialUrl,
                title: 'Loading...',
                loading: true,
                canGoBack: false,
                canGoForward: false,
                favicon: null
            }];
        }
        return [{
            id: 'tab-1',
            url: '',
            title: 'New Tab',
            loading: false,
            canGoBack: false,
            canGoForward: false,
            favicon: null
        }];
    });

    // Ensure activeTabId matches the ID of the initial tab
    const [activeTabId, setActiveTabId] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        // We logic above used 'tab-1' for both, but better to be safe
        // Actually, logic above always returns an array with index 0
        return 'tab-1';
    });

    const addTab = useCallback((url = '', title = 'New Tab') => {
        const newTab = { id: generateTabId(), title, url, favicon: null, loading: !!url };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
        return newTab.id;
    }, []);

    // Add a tab in the background without switching to it
    const addTabInBackground = useCallback((url = '', title = 'New Tab') => {
        const newTab = { id: generateTabId(), title: url ? 'Loading...' : title, url, favicon: null, loading: !!url };
        setTabs((prev) => [...prev, newTab]);
        return newTab.id;
    }, []);

    const removeTab = useCallback((tabId) => {
        console.log('[TabContext] removeTab called with tabId:', tabId);

        setTabs((prev) => {
            console.log('[TabContext] Current tabs:', prev.map(t => t.id));
            const index = prev.findIndex((t) => t.id === tabId);
            console.log('[TabContext] Tab index:', index);

            if (index === -1) {
                console.log('[TabContext] Tab not found!');
                return prev; // Tab not found, no change
            }

            const newTabs = prev.filter((t) => t.id !== tabId);
            console.log('[TabContext] New tabs after removal:', newTabs.map(t => t.id));

            if (newTabs.length === 0) {
                // Create a new empty tab when closing the last one
                const newTab = { id: generateTabId(), title: 'New Tab', url: '', favicon: null, loading: false };
                console.log('[TabContext] Created new tab:', newTab.id);
                // Use setTimeout to update activeTabId after this render cycle
                setTimeout(() => setActiveTabId(newTab.id), 0);
                return [newTab];
            }

            // Always update active tab when closing
            const newIndex = Math.min(index, newTabs.length - 1);
            const newActiveId = newTabs[newIndex]?.id;
            console.log('[TabContext] New active tab will be:', newActiveId);
            if (newActiveId) {
                setTimeout(() => setActiveTabId(newActiveId), 0);
            }

            return newTabs;
        });
    }, []);

    const updateTab = useCallback((tabId, updates) => {
        setTabs((prev) =>
            prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
        );
    }, []);

    const setActiveTab = useCallback((tabId) => {
        setActiveTabId(tabId);
    }, []);

    const reorderTabs = useCallback((fromIndex, toIndex) => {
        setTabs((prev) => {
            const newTabs = [...prev];
            const [removed] = newTabs.splice(fromIndex, 1);
            newTabs.splice(toIndex, 0, removed);
            return newTabs;
        });
    }, []);

    const value = useMemo(() => ({
        tabs,
        activeTabId,
        addTab,
        addTabInBackground,
        removeTab,
        updateTab,
        setActiveTab,
        reorderTabs,
    }), [tabs, activeTabId, addTab, addTabInBackground, removeTab, updateTab, setActiveTab, reorderTabs]);

    return (
        <TabContext.Provider value={value}>
            {children}
        </TabContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabContext);
    if (!context) {
        throw new Error('useTabs must be used within a TabProvider');
    }
    return context;
}
