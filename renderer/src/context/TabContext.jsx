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
        // Get current state synchronously to avoid stale closure
        let newActiveId = null;
        let needsNewActive = false;

        setTabs((prev) => {
            const index = prev.findIndex((t) => t.id === tabId);
            if (index === -1) return prev; // Tab not found, no change

            const newTabs = prev.filter((t) => t.id !== tabId);

            if (newTabs.length === 0) {
                // Create a new empty tab when closing the last one
                const newTab = { id: generateTabId(), title: 'New Tab', url: '', favicon: null, loading: false };
                newActiveId = newTab.id;
                needsNewActive = true;
                return [newTab];
            }

            // Check if we need to update active tab
            // We use a functional check by seeing if tabId matches what we think is active
            const newIndex = Math.min(index, newTabs.length - 1);
            newActiveId = newTabs[newIndex]?.id;
            needsNewActive = true;

            return newTabs;
        });

        // Update activeTabId outside of setTabs to avoid closure issues
        if (needsNewActive && newActiveId) {
            setActiveTabId(newActiveId);
        }
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
