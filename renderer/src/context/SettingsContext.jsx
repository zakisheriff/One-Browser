import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
    return useContext(SettingsContext);
}

const defaultSettings = {
    // General
    startupPage: 'newtab',
    customStartupUrls: [],
    searchEngine: 'google', // Used in GeneralSettings

    // Appearance
    theme: 'system',
    density: 'comfortable', // Used in AppearanceSettings
    showHomeButton: true,
    showBookmarksBar: false,
    transparency: 0.8,
    blurIntensity: 20,

    // Privacy
    blockThirdPartyCookies: true,
    doNotTrack: true,
    httpsOnly: false,

    // Tabs
    openLinksInNewTab: true,
    confirmClose: false,

    // Downloads
    askLocation: false,
    autoOpen: false
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    // Load settings from persistent storage on mount
    useEffect(() => {
        if (window.electronAPI?.getSettings) {
            window.electronAPI.getSettings().then((savedSettings) => {
                console.log('[SettingsContext] Loaded settings:', savedSettings);
                // Schema check: if settings look old (nested) or missing version, ignore them or migrate
                if (savedSettings && typeof savedSettings === 'object') {
                    // Simple migration: if it has 'general' key, it's old.
                    const isOldSchema = !!savedSettings.general;

                    if (isOldSchema) {
                        console.log('[SettingsContext] Detected old settings schema. Resetting to defaults.');
                        if (window.electronAPI?.saveSettings) {
                            window.electronAPI.saveSettings(defaultSettings);
                        }
                        return;
                    }

                    // Otherwise merge
                    setSettings(prev => ({
                        ...prev,
                        ...savedSettings
                    }));
                } else {
                    // No settings found, save defaults
                    if (window.electronAPI?.saveSettings) {
                        window.electronAPI.saveSettings(defaultSettings);
                    }
                }
            });
        }
    }, []);

    const updateSettings = (updates) => {
        console.log('[SettingsContext] Updating settings:', updates);
        setSettings(prev => {
            const newSettings = {
                ...prev,
                ...updates
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
