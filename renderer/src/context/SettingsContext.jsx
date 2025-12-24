import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
    return useContext(SettingsContext);
}

const defaultSettings = {
    general: {
        startupPage: 'newtab', // newtab, previous, specific
        customStartupUrls: [],
        topSearchEngine: 'google',
        bottomSearchEngine: 'google'
    },
    appearance: {
        theme: 'system', // light, dark, system
        transparency: 0.8, // 0.1 to 1.0
        blurIntensity: 20, // 0 to 50px
        showToolbar: true,
        useCustomFont: false
    },
    privacy: {
        blockThirdPartyCookies: true,
        doNotTrack: true,
        httpsOnly: false
    },
    tabs: {
        openLinksInNewTab: true,
        confirmClose: false
    },
    downloads: {
        askLocation: false,
        autoOpen: false
    }
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    // Load settings from persistent storage on mount
    useEffect(() => {
        if (window.electronAPI?.getSettings) {
            window.electronAPI.getSettings().then((savedSettings) => {
                if (savedSettings) {
                    setSettings(prev => ({
                        ...prev,
                        ...savedSettings
                    }));
                }
            });
        }
    }, []);

    const updateSettings = (category, key, value) => {
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [category]: {
                    ...prev[category],
                    [key]: value
                }
            };
            // Persist changes
            if (window.electronAPI?.saveSettings) {
                window.electronAPI.saveSettings(newSettings);
            }
            return newSettings;
        });
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        if (window.electronAPI?.saveSettings) {
            window.electronAPI.saveSettings(defaultSettings);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
