import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Trash2, Eye, Lock } from 'lucide-react';

const PrivacySettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    // Local state for UI feedback
    const [isClearing, setIsClearing] = useState(false);

    const handleClearData = async () => {
        setIsClearing(true);
        // In a real app, we would call an IPC method here:
        // await window.electronAPI.clearStorageData();
        // For now, simulate it:
        setTimeout(() => {
            setIsClearing(false);
            alert('Browsing data cleared!');
        }, 1000);
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div className="pb-4 border-b border-gray-200 dark:border-white/10">
                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    Control your privacy and security settings. One Browser prioritizes your data protection.
                </p>
            </div>

            {/* Clear Data Section */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Trash2 size={20} />
                    Clear Browsing Data
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Clear History, Cookies, and Cache</h4>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                                Free up space and remove tracking data.
                            </p>
                        </div>
                        <button
                            onClick={handleClearData}
                            disabled={isClearing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                }`}
                        >
                            {isClearing ? 'Clearing...' : 'Clear Data'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Tracking Protection */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Shield size={20} />
                    Tracking Protection
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Block Third-Party Cookies</h4>
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                                    Prevent sites from tracking you across the web.
                                </p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.blockThirdPartyCookies ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.blockThirdPartyCookies || false}
                                    onChange={(e) => updateSettings({ blockThirdPartyCookies: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.blockThirdPartyCookies ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Incognito */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Eye size={20} />
                    Incognito Defaults
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Always Open in Incognito</h4>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                                Start browser in incognito mode by default.
                            </p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.alwaysIncognito ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                            <input
                                type="checkbox"
                                className="opacity-0 absolute inset-0 cursor-pointer"
                                checked={settings?.alwaysIncognito || false}
                                onChange={(e) => updateSettings({ alwaysIncognito: e.target.checked })}
                            />
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.alwaysIncognito ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </label>
                </div>
            </section>
        </div>
    );
};

export default PrivacySettings;
