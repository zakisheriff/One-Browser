import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Layout, Type, Palette } from 'lucide-react';

const AppearanceSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    // Default values if settings are empty
    const density = settings?.density || 'comfortable';
    const showHomeButton = settings?.showHomeButton !== false; // default true

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Density Section */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Layout size={20} />
                    Density
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="density"
                                checked={density === 'comfortable'}
                                onChange={() => updateSettings({ density: 'comfortable' })}
                                className="w-4 h-4 text-blue-500"
                            />
                            <div className="flex flex-col">
                                <span className={theme === 'dark' ? 'text-white/90' : 'text-black/90'}>Comfortable</span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Standard spacing for touch and mouse</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="density"
                                checked={density === 'compact'}
                                onChange={() => updateSettings({ density: 'compact' })}
                                className="w-4 h-4 text-blue-500"
                            />
                            <div className="flex flex-col">
                                <span className={theme === 'dark' ? 'text-white/90' : 'text-black/90'}>Compact</span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>More content on the screen</span>
                            </div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Toolbar Customization */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Palette size={20} />
                    Toolbar
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Show Home Button</h4>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${showHomeButton ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={showHomeButton}
                                    onChange={(e) => updateSettings({ showHomeButton: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${showHomeButton ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Show Bookmarks Bar</h4>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.showBookmarksBar ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.showBookmarksBar || false}
                                    onChange={(e) => updateSettings({ showBookmarksBar: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.showBookmarksBar ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AppearanceSettings;
