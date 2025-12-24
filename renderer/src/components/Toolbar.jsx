import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
    ArrowLeft, ArrowRight, RotateCw, X as StopIcon, Home, Star, Download,
    Clock, Puzzle, Sparkles, Sun, Moon, Shield, MoreVertical, Settings, Info, Eye, EyeOff, Search, Trash2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Toolbar = memo(function Toolbar({ url, onNavigate, onGoBack, onGoForward, onReload, onStop, isLoading, closePopoversRef }) {
    const { theme, toggleTheme } = useTheme();
    const [inputValue, setInputValue] = useState(url);
    const [isFocused, setIsFocused] = useState(false);
    const [activePopover, setActivePopover] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const popoverRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);

    const [bookmarks, setBookmarks] = useState([]);
    const [history, setHistory] = useState([]);
    const [historySearch, setHistorySearch] = useState('');
    const [aiInput, setAiInput] = useState('');

    useEffect(() => {
        if (!isFocused) {
            setInputValue(url);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [url, isFocused]);

    // Fetch Google suggestions
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Skip if it looks like a URL
        if (query.includes('.') && !query.includes(' ')) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            if (data && data[1]) {
                setSuggestions(data[1].slice(0, 6));
                setShowSuggestions(true);
            }
        } catch (e) {
            setSuggestions([]);
        }
    }, []);

    // Debounced input handler
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 150);
    };

    useEffect(() => {
        if (activePopover === 'bookmarks' && window.electronAPI) {
            window.electronAPI.getBookmarks().then(setBookmarks);
        } else if (activePopover === 'history' && window.electronAPI) {
            window.electronAPI.getHistory().then(setHistory);
        }
    }, [activePopover]);

    // Expose close function to parent
    useEffect(() => {
        if (closePopoversRef) {
            closePopoversRef.current = () => {
                setActivePopover(null);
                setShowSuggestions(false);
            };
        }
    }, [closePopoversRef]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Close popover if clicking outside toolbar area
            if (activePopover && popoverRef.current && !popoverRef.current.contains(e.target)) {
                setActivePopover(null);
            }
            // Close suggestions if clicking outside
            if (showSuggestions && suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activePopover, showSuggestions]);

    const navigateTo = useCallback((input) => {
        let navigateUrl = input.trim();
        if (!navigateUrl) return;

        const urlPattern = /^(https?:\/\/|www\.)/i;
        const domainPattern = /^[\w-]+(\.[\w-]+)+/;

        if (urlPattern.test(navigateUrl)) {
            if (!navigateUrl.startsWith('http')) navigateUrl = 'https://' + navigateUrl;
        } else if (domainPattern.test(navigateUrl)) {
            navigateUrl = 'https://' + navigateUrl;
        } else {
            navigateUrl = `https://www.google.com/search?q=${encodeURIComponent(navigateUrl)}`;
        }

        setShowSuggestions(false);
        setSuggestions([]);
        onNavigate(navigateUrl);
    }, [onNavigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigateTo(inputValue);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        navigateTo(suggestion);
    };

    const handleHome = useCallback(() => {
        onStop?.();
        onNavigate('');
    }, [onStop, onNavigate]);

    const handleClearHistory = async () => {
        if (window.electronAPI) {
            await window.electronAPI.clearHistory();
            setHistory([]);
        }
    };

    const togglePopover = (name) => {
        setActivePopover(prev => prev === name ? null : name);
        setShowSuggestions(false);
    };

    const filteredHistory = history.filter(entry =>
        !historySearch ||
        entry.title?.toLowerCase().includes(historySearch.toLowerCase()) ||
        entry.url?.toLowerCase().includes(historySearch.toLowerCase())
    );

    const btnClass = `p-2 rounded-full transition-colors cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/60 hover:text-black'
        }`;

    const activeBtnClass = (name) => `${btnClass} ${activePopover === name ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black') : ''}`;

    const popoverClass = `absolute right-0 bottom-full mb-4 w-80 max-h-96 rounded-2xl border shadow-2xl overflow-hidden z-[100] ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'
        }`;

    const itemClass = `w-full text-left px-4 py-3 transition-colors cursor-default ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'
        }`;

    const menuItemClass = `w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white/80' : 'hover:bg-black/10 text-black/80'
        }`;

    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 mx-3 my-2 rounded-full border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`} ref={popoverRef}>
            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
                <button onClick={onGoBack} className={btnClass} title="Back"><ArrowLeft size={18} /></button>
                <button onClick={onGoForward} className={btnClass} title="Forward"><ArrowRight size={18} /></button>
                {isLoading ? (
                    <button onClick={onStop} className={btnClass} title="Stop"><StopIcon size={18} /></button>
                ) : (
                    <button onClick={onReload} className={btnClass} title="Reload"><RotateCw size={18} /></button>
                )}
                <button onClick={handleHome} className={btnClass} title="Home"><Home size={18} /></button>
            </div>

            {/* Omnibox with Autocomplete */}
            <form onSubmit={handleSubmit} className="flex-1 mx-2 relative" ref={suggestionsRef}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors border ${isFocused
                    ? theme === 'dark' ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/20'
                    : theme === 'dark' ? 'bg-white/5 border-transparent' : 'bg-black/5 border-transparent'
                    }`}>
                    <Shield size={14} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => { setIsFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search or enter URL..."
                        className={`flex-1 bg-transparent outline-none text-sm cursor-text ${theme === 'dark' ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'}`}
                    />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 bottom-full mb-2 rounded-xl border shadow-xl overflow-hidden z-[100] ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'
                        }`}>
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'
                                    }`}
                            >
                                <Search size={14} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </form>

            {/* Toolbar Buttons with Popovers */}
            <div className="flex items-center gap-1">
                {/* Bookmarks */}
                <div className="relative">
                    <button onClick={() => togglePopover('bookmarks')} className={activeBtnClass('bookmarks')} title="Bookmarks">
                        <Star size={18} />
                    </button>
                    {activePopover === 'bookmarks' && (
                        <div className={popoverClass}>
                            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Bookmarks</h3>
                            </div>
                            <div className="overflow-auto max-h-72">
                                {bookmarks.length === 0 ? (
                                    <div className={`py-8 text-center ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                        <Star size={32} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">No bookmarks yet</p>
                                    </div>
                                ) : (
                                    bookmarks.map((b, i) => (
                                        <button key={i} onClick={() => { onNavigate(b.url); setActivePopover(null); }} className={itemClass}>
                                            <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{b.title}</div>
                                            <div className={`text-xs truncate ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{b.url}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="relative">
                    <button onClick={() => togglePopover('history')} className={activeBtnClass('history')} title="History">
                        <Clock size={18} />
                    </button>
                    {activePopover === 'history' && (
                        <div className={popoverClass}>
                            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>History</h3>
                                    {history.length > 0 && (
                                        <button onClick={handleClearHistory} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'text-white/50 hover:text-red-400' : 'text-black/50 hover:text-red-500'}`}>
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                                    <Search size={14} className={theme === 'dark' ? 'text-white/30' : 'text-black/30'} />
                                    <input
                                        type="text"
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        placeholder="Search..."
                                        className={`flex-1 bg-transparent outline-none text-xs ${theme === 'dark' ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'}`}
                                    />
                                </div>
                            </div>
                            <div className="overflow-auto max-h-64">
                                {filteredHistory.length === 0 ? (
                                    <div className={`py-8 text-center ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                        <Clock size={32} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">{historySearch ? 'No results' : 'No history'}</p>
                                    </div>
                                ) : (
                                    filteredHistory.slice(0, 20).map((h, i) => (
                                        <div key={i} className={`group flex items-center gap-2 px-3 py-2 transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                                            <button
                                                onClick={() => { onNavigate(h.url); setActivePopover(null); }}
                                                className="flex-1 text-left min-w-0"
                                            >
                                                <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{h.title || 'Untitled'}</div>
                                                <div className={`text-xs truncate ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>{h.url}</div>
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (window.electronAPI) {
                                                        const updated = await window.electronAPI.removeHistoryItem(h.url);
                                                        setHistory(updated);
                                                    }
                                                }}
                                                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white/40 hover:text-red-400' : 'hover:bg-black/10 text-black/40 hover:text-red-500'
                                                    }`}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Downloads */}
                <div className="relative">
                    <button onClick={() => togglePopover('downloads')} className={activeBtnClass('downloads')} title="Downloads">
                        <Download size={18} />
                    </button>
                    {activePopover === 'downloads' && (
                        <div className={popoverClass}>
                            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Downloads</h3>
                            </div>
                            <div className={`py-8 text-center ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                <Download size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No downloads</p>
                            </div>
                        </div>
                    )}
                </div>

                <button className={btnClass} title="Extensions"><Puzzle size={18} /></button>

                {/* AI */}
                <div className="relative">
                    <button onClick={() => togglePopover('ai')} className={activeBtnClass('ai')} title="AI Assistant">
                        <Sparkles size={18} />
                    </button>
                    {activePopover === 'ai' && (
                        <div className={popoverClass}>
                            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>AI Assistant</h3>
                            </div>
                            <div className="p-4">
                                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>Ask about the current page</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        placeholder="Ask something..."
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'
                                            }`}
                                    />
                                    <button className={`px-3 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>Ask</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`w-px h-5 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />

                <button onClick={toggleTheme} className={btnClass} title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="relative">
                    <button onClick={() => togglePopover('menu')} className={activeBtnClass('menu')} title="More">
                        <MoreVertical size={18} />
                    </button>
                    {activePopover === 'menu' && (
                        <div className={`${popoverClass} w-56`}>
                            <div className="py-2">
                                <button className={menuItemClass}><Eye size={16} />Developer Tools</button>
                                <button className={menuItemClass}><EyeOff size={16} />New Incognito Window</button>
                                <div className={`my-1 h-px mx-3 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                                <button className={menuItemClass}><Settings size={16} />Settings</button>
                                <button className={menuItemClass}><Info size={16} />About One Browser</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Toolbar;
