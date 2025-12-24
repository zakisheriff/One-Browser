import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Layout, MousePointer, AppWindow } from 'lucide-react';

const TabsSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Layout size={20} />
                    Tab Behavior
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Open links in new tab</h4>
                                <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>When clicking external links</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.openLinksInNewTab ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.openLinksInNewTab || false}
                                    onChange={(e) => updateSettings({ openLinksInNewTab: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.openLinksInNewTab ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>

                        <div className={`h-px ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Confirm before closing multiple tabs</h4>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.confirmClose ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.confirmClose || false}
                                    onChange={(e) => updateSettings({ confirmClose: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.confirmClose ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TabsSettings;
