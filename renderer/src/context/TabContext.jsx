import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TabContext = createContext();

let tabIdCounter = 1;
const generateTabId = () => `tab-${tabIdCounter++}`;

export function TabProvider({ children }) {
    const [tabs, setTabs] = useState([
        { id: 'tab-0', title: 'New Tab', url: '', favicon: null, loading: false },
    ]);
    const [activeTabId, setActiveTabId] = useState('tab-0');

    const addTab = useCallback((url = '', title = 'New Tab') => {
        const newTab = { id: generateTabId(), title, url, favicon: null, loading: false };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
        return newTab.id;
    }, []);

    const removeTab = useCallback((tabId) => {
        setTabs((prev) => {
            const index = prev.findIndex((t) => t.id === tabId);
            const newTabs = prev.filter((t) => t.id !== tabId);

            if (newTabs.length === 0) {
                const newTab = { id: generateTabId(), title: 'New Tab', url: '', favicon: null, loading: false };
                setActiveTabId(newTab.id);
                return [newTab];
            }

            setActiveTabId((currentActive) => {
                if (tabId === currentActive) {
                    const newIndex = Math.min(index, newTabs.length - 1);
                    return newTabs[newIndex].id;
                }
                return currentActive;
            });

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
        removeTab,
        updateTab,
        setActiveTab,
        reorderTabs,
    }), [tabs, activeTabId, addTab, removeTab, updateTab, setActiveTab, reorderTabs]);

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
