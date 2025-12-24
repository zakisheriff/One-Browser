import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TabContext = createContext();

// Use timestamp to ensure unique IDs even after HMR
const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function TabProvider({ children }) {
    const [tabs, setTabs] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const initialUrl = params.get('initialUrl');
        const initialId = generateTabId();

        if (initialUrl) {
            return [{
                id: initialId,
                url: initialUrl,
                title: 'Loading...',
                loading: true,
                canGoBack: false,
                canGoForward: false,
                favicon: null
            }];
        }
        return [{
            id: initialId,
            url: '',
            title: 'New Tab',
            loading: false,
            canGoBack: false,
            canGoForward: false,
            favicon: null
        }];
    });

    // Initialize activeTabId with the ID of the first tab
    const [activeTabId, setActiveTabId] = useState(() => {
        return tabs[0].id;
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
        setTabs((currentTabs) => {
            const index = currentTabs.findIndex((t) => t.id === tabId);
            if (index === -1) {
                return currentTabs;
            }

            const newTabs = currentTabs.filter((t) => t.id !== tabId);

            if (newTabs.length === 0) {
                // Generate new tab if all closed
                const newTab = { id: generateTabId(), title: 'New Tab', url: '', favicon: null, loading: false };
                // We MUST schedule the activeTabId update to avoid concurrent state update warnings/issues
                // when called from UI handlers, but ensuring it happens with the new tab existence.
                setTimeout(() => setActiveTabId(newTab.id), 0);
                return [newTab];
            }

            // If we are removing the CURRENTLY ACTIVE tab, need to switch.
            // Since we can't easily access 'activeTabId' current state synchronously inside this callback 
            // without adding it to deps (which we avoided here to keep this callback pure-ish),
            // we will use a functional update for setActiveTabId as well, or just logic.

            // Actually, we can check if the removed tab ID is the same as current active tab ID?
            // But we don't have activeTabId here.

            // Logic: Always switch to specific neighbor if we removed a tab.
            // We can determine the "next" tab ID purely from the list.

            // To be safe, we will perform a check in a separate effect or just optimistically update activeTabId?
            // Let's use the setState callback pattern for setActiveTabId to ensure we check *its* current value.

            setTimeout(() => {
                setActiveTabId(currentActiveId => {
                    if (currentActiveId === tabId) {
                        // We closed the active tab, switch to neighbor
                        const newIndex = Math.min(index, newTabs.length - 1);
                        const newActiveId = newTabs[newIndex].id;
                        return newActiveId;
                    }
                    return currentActiveId; // We closed a background tab, stay on current
                });
            }, 0);

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
