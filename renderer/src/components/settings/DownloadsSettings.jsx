import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Download, Folder } from 'lucide-react';

const DownloadsSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Download size={20} />
                    Downloads Behavior
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Ask where to save each file</h4>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.askLocation ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.askLocation || false}
                                    onChange={(e) => updateSettings({ askLocation: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.askLocation ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>

                        <div className={`h-px ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Open files automatically after downloading</h4>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.autoOpen ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.autoOpen || false}
                                    onChange={(e) => updateSettings({ autoOpen: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.autoOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DownloadsSettings;
