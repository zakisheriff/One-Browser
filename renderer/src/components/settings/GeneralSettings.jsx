import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Monitor, Search, Globe, Home } from 'lucide-react';

const GeneralSettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme, toggleTheme } = useTheme();
    const [searchEngine, setSearchEngine] = useState('google');
    const [startupPage, setStartupPage] = useState('newtab');

    // Sync with settings context
    useEffect(() => {
        if (settings) {
            setSearchEngine(settings.searchEngine || 'google');
            setStartupPage(settings.startupPage || 'newtab');
        }
    }, [settings]);

    const handleSearchEngineChange = (e) => {
        const value = e.target.value;
        setSearchEngine(value);
        updateSettings({ searchEngine: value });
    };

    const handleStartupPageChange = (value) => {
        setStartupPage(value);
        updateSettings({ startupPage: value });
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Startup Section */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Home size={20} />
                    On Startup
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="startup"
                                checked={startupPage === 'newtab'}
                                onChange={() => handleStartupPageChange('newtab')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span className={theme === 'dark' ? 'text-white/80' : 'text-black/80'}>Open the New Tab page</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="startup"
                                checked={startupPage === 'continue'}
                                onChange={() => handleStartupPageChange('continue')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span className={theme === 'dark' ? 'text-white/80' : 'text-black/80'}>Continue where you left off</span>
                        </label>
                    </div>
                </div>
            </section>

            {/* Search Engine Section */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Search size={20} />
                    Search Engine
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="flex flex-col gap-3">
                        <label className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                            Search engine used in the address bar
                        </label>
                        <select
                            value={searchEngine}
                            onChange={handleSearchEngineChange}
                            className={`p-2 rounded-lg border outline-none ${theme === 'dark'
                                ? 'bg-[#1a1a1a] border-white/10 text-white focus:border-white/30'
                                : 'bg-white border-black/10 text-black focus:border-black/30'
                                }`}
                        >
                            <option value="google">Google</option>
                            <option value="bing">Bing</option>
                            <option value="duckduckgo">DuckDuckGo</option>
                            <option value="yahoo">Yahoo!</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Appearance Preview (Theme) */}
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Monitor size={20} />
                    Appearance
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-black/80'}>App Theme</span>
                        <button
                            onClick={toggleTheme}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GeneralSettings;
