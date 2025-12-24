import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Box, ToggleLeft } from 'lucide-react';

const ExtensionsSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Box size={20} />
                    Extensions
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Allow Extensions</h4>
                            <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Enable chrome extensions support (Beta)</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.allowExtensions ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                            <input
                                type="checkbox"
                                className="opacity-0 absolute inset-0 cursor-pointer"
                                checked={settings?.allowExtensions || false}
                                onChange={(e) => updateSettings({ allowExtensions: e.target.checked })}
                            />
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.allowExtensions ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </label>
                </div>
            </section>
        </div>
    );
};

export default ExtensionsSettings;
