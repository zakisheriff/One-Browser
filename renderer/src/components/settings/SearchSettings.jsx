import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, List } from 'lucide-react';

const SearchSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    const engines = [
        { id: 'google', name: 'Google', url: 'google.com' },
        { id: 'bing', name: 'Bing', url: 'bing.com' },
        { id: 'duckduckgo', name: 'DuckDuckGo', url: 'duckduckgo.com' },
        { id: 'brave', name: 'Brave Search', url: 'search.brave.com' }
    ];

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Search size={20} />
                    Default Search Engine
                </h3>
                <div className={`p-1 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    {engines.map((engine) => (
                        <label key={engine.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${settings?.searchEngine === engine.id ? (theme === 'dark' ? 'bg-white/10' : 'bg-black/5') : 'hover:bg-white/5'}`}>
                            <input
                                type="radio"
                                name="searchEngine"
                                checked={settings?.searchEngine === engine.id}
                                onChange={() => {
                                    console.log('SearchSettings: Changing engine to', engine.id);
                                    updateSettings({ searchEngine: engine.id });
                                }}
                                className="w-4 h-4 text-blue-500"
                            />
                            <div className="flex flex-col">
                                <span className={theme === 'dark' ? 'text-white' : 'text-black'}>{engine.name}</span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>{engine.url}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <List size={20} />
                    Search Suggestions
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Show search suggestions</h4>
                            <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Predict queries in the address bar</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.searchSuggestions ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                            <input
                                type="checkbox"
                                className="opacity-0 absolute inset-0 cursor-pointer"
                                checked={settings?.searchSuggestions || false}
                                onChange={(e) => updateSettings({ searchSuggestions: e.target.checked })}
                            />
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.searchSuggestions ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </label>
                </div>
            </section>
        </div>
    );
};

export default SearchSettings;
