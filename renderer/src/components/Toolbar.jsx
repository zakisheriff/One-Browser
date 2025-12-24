import React, { useState, useEffect, useRef, memo, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
    ArrowLeft, ArrowRight, RotateCw, X as StopIcon, Home, Star, Download,
    Clock, Puzzle, Sparkles, Sun, Moon, Shield, MoreVertical, Settings, Info, Eye, EyeOff, Search, Trash2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const Toolbar = memo(forwardRef(function Toolbar({ url, onNavigate, onGoBack, onGoForward, onReload, onStop, isLoading, closePopoversRef, onOpenSettings }, ref) {
    const { theme, toggleTheme } = useTheme();
    const { settings } = useSettings() || {};
    const searchEngine = settings?.searchEngine || 'google';

    // Debug logging removed

    const [inputValue, setInputValue] = useState(url);
    const [isFocused, setIsFocused] = useState(false);
    const [activePopover, setActivePopover] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [downloads, setDownloads] = useState([]);
    const [history, setHistory] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [aiInput, setAiInput] = useState(''); // Added missing AI input state
    const [historySearch, setHistorySearch] = useState(''); // Added missing history search state
    const popoverRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);
    const inputRef = useRef(null); // Added for the new useEffect

    // Ref to track if we just navigated, to prevent late suggestions from popping up
    const isNavigatingRef = useRef(false);

    // Update input value when URL changes, but only if not focused
    useEffect(() => {
        if (!isFocused && url) {
            setInputValue(url);
        }
    }, [url, isFocused]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Google suggestions via main process (bypasses CORS)
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 1 || isNavigatingRef.current) { // Added isNavigatingRef.current check
            setSuggestions([]);
            return;
        }

        // Skip if it looks like a URL
        if (query.includes('.') && !query.includes(' ')) {
            setSuggestions([]);
            return;
        }

        try {
            if (window.electronAPI?.getSuggestions) {
                const results = await window.electronAPI.getSuggestions(query);
                // double check we didn't navigate while waiting
                if (isNavigatingRef.current) return; // Added check after async operation

                if (results && results.length > 0) {
                    setSuggestions(results);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                }
            }
        } catch (e) {
            setSuggestions([]);
        }
    }, []);

    // Debounced input handler
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        isNavigatingRef.current = false; // Reset on new typing

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 100); // Reduced debounce for faster response
    };

    useEffect(() => {
        if (activePopover === 'bookmarks' && window.electronAPI) {
            window.electronAPI.getBookmarks().then(setBookmarks);
        } else if (activePopover === 'history' && window.electronAPI) {
            window.electronAPI.getHistory().then(data => setHistory(Array.isArray(data) ? data : []));
        } else if (activePopover === 'downloads' && window.electronAPI?.getDownloads) {
            window.electronAPI.getDownloads().then(setDownloads);
        }
    }, [activePopover]);

    // Handle blur safely (allow clicks on suggestions to register first)
    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    // Listen for real-time download updates
    useEffect(() => {
        if (window.electronAPI?.onDownloadProgress) {
            const removeListener = window.electronAPI.onDownloadProgress((data) => {
                setDownloads(prev => {
                    const idx = prev.findIndex(d => d.id === data.id);
                    if (idx !== -1) {
                        const newDownloads = [...prev];
                        newDownloads[idx] = { ...newDownloads[idx], ...data };
                        return newDownloads;
                    } else {
                        return [data, ...prev];
                    }
                });
            });
            return () => { };
        }
    }, []);

    // Expose close and open functions to parent
    useImperativeHandle(closePopoversRef, () => ({
        close: () => {
            setActivePopover(null);
            setShowSuggestions(false);
        },
        open: (panel) => {
            setActivePopover(panel);
        }
    }));

    // Fallback in case parent passes a ref object directly not used via useImperativeHandle logic by Parent?
    // Actually, App.jsx uses closePopoversRef.current?.close?().
    // The useImperativeHandle hook handles binding the return object to closePopoversRef.current.
    // However, App.jsx passes it as a PROP "closePopoversRef", NOT as the forwarded ref "ref".
    // Wait, if App.jsx passes it as a prop, then `useImperativeHandle` requires the FIRST argument to be the ref.
    // If I use `ref` from forwardRef, I should access that.
    // BUT App.jsx passes `<Toolbar closePopoversRef={closePopoversRef} ... />`.
    // So `closePopoversRef` IS AVAILABLE AS A PROP.
    // `useImperativeHandle(closePopoversRef, ...)` is correct IF closePopoversRef is a ref object.
    // The `ref` argument from forwardRef is usually for when `<Toolbar ref={myRef} />`.
    // Since App.jsx passes it explicitly as a prop, I don't strictly *need* forwardRef if I just use the prop.
    // BUT `useImperativeHandle` is designed to work with the `ref` passed to `forwardRef`.
    // Can I use it with a prop ref? Yes.
    // So the implementation below is fine: `useImperativeHandle(closePopoversRef, ...)` works.

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
        // Clear any pending suggestion fetches
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Mark navigation as active to block any in-flight requests
        isNavigatingRef.current = true;

        let navigateUrl = input.trim();
        if (!navigateUrl) return;

        if (window.electronAPI?.log) {
            window.electronAPI.log(`[Toolbar] Navigating. Current Engine: ${searchEngine}, Input: ${navigateUrl}`);
        } else {
            console.log(`[Toolbar] Navigating. Current Engine: ${searchEngine}`);
        }

        const urlPattern = /^(https?:\/\/|www\.)/i;
        const domainPattern = /^[\w-]+(\.[\w-]+)+/;

        if (urlPattern.test(navigateUrl)) {
            if (!navigateUrl.startsWith('http')) navigateUrl = 'https://' + navigateUrl;
        } else if (domainPattern.test(navigateUrl)) {
            navigateUrl = 'https://' + navigateUrl;
        } else {
            // Use selected search engine
            let searchUrl = 'https://www.google.com/search?q=';

            if (window.electronAPI?.log) {
                window.electronAPI.log(`[Toolbar] Selecting engine. Value: '${searchEngine}'`);
            }

            if (searchEngine === 'bing') {
                if (window.electronAPI?.log) window.electronAPI.log('[Toolbar] MATCHED BING');
                searchUrl = 'https://www.bing.com/search?q=';
            }
            if (searchEngine === 'duckduckgo') {
                if (window.electronAPI?.log) window.electronAPI.log('[Toolbar] MATCHED DUCKDUCKGO');
                searchUrl = 'https://duckduckgo.com/?q=';
            }
            if (searchEngine === 'brave') {
                if (window.electronAPI?.log) window.electronAPI.log('[Toolbar] MATCHED BRAVE');
                searchUrl = 'https://search.brave.com/search?q=';
            }

            if (window.electronAPI?.log) {
                window.electronAPI.log(`[Toolbar] Final Prefix: ${searchUrl}`);
            }

            if (window.electronAPI?.log) {
                window.electronAPI.log(`[Toolbar] Using Search URL prefix: ${searchUrl}`);
            }

            navigateUrl = `${searchUrl}${encodeURIComponent(navigateUrl)}`;
        }

        // Force close suggestions and clear data immediately
        setShowSuggestions(false);
        setSuggestions([]);

        // Remove focus from input to prevent re-opening on stray events
        const inputElem = document.querySelector('input[type="text"]');
        if (inputElem) inputElem.blur();

        onNavigate(navigateUrl);
    }, [onNavigate, searchEngine]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false); // Explicitly close suggestions
            e.target.blur(); // Remove focus to ensure UI state updates
            navigateTo(inputValue);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestions([]);
        setIsFocused(false);
        e.target.querySelector('input')?.blur();
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

    const filteredHistory = (Array.isArray(history) ? history : []).filter(entry =>
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

    const density = settings?.density || 'comfortable';
    const paddingY = density === 'compact' ? 'py-1.5' : 'py-2.5';

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className={`flex items-center gap-2 px-4 ${paddingY} mx-3 my-2 rounded-full border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`} ref={popoverRef}>
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
                        ref={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={(e) => { setIsFocused(true); e.target.select(); if (suggestions.length > 0) setShowSuggestions(true); }}
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
                                        placeholder={`Search with ${searchEngine}...`}
                                        className={`w-full h-full bg-transparent border-none outline-none text-sm px-10 ${theme === 'dark' ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'}`}
                                        style={{ caretColor: '#3b82f6' }}
                                        onBlur={handleInputBlur}
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

                <div className="relative">
                    <button onClick={() => togglePopover('downloads')} className={activeBtnClass('downloads')} title="Downloads">
                        <div className="relative">
                            <Download size={18} />
                            {downloads.some(d => d.state === 'progressing') && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1e1e1e]" />
                            )}
                        </div>
                    </button>
                    {activePopover === 'downloads' && (
                        <div className={popoverClass}>
                            <div className={`px-4 py-3 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Downloads</h3>
                                {downloads.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            if (window.electronAPI?.clearDownloads) {
                                                const updated = await window.electronAPI.clearDownloads();
                                                setDownloads(updated);
                                            }
                                        }}
                                        className={`text-xs hover:underline ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="overflow-auto max-h-72">
                                {downloads.length === 0 ? (
                                    <div className={`py-8 text-center ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                        <Download size={32} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">No downloads</p>
                                    </div>
                                ) : (
                                    downloads.map((d, i) => {
                                        const percent = d.size > 0 ? Math.round((d.received / d.size) * 100) : 0;
                                        const isProgressing = d.state === 'progressing';

                                        // Calc time remaining
                                        let timeRemaining = '';
                                        if (isProgressing && d.received > 0 && d.startTime) {
                                            const elapsed = (Date.now() - d.startTime) / 1000; // seconds
                                            if (elapsed > 1) {
                                                const speed = d.received / elapsed; // bytes per sec
                                                const remainingBytes = d.size - d.received;
                                                const secondsLeft = remainingBytes / speed;

                                                if (secondsLeft < 60) timeRemaining = `${Math.ceil(secondsLeft)}s left`;
                                                else if (secondsLeft < 3600) timeRemaining = `${Math.ceil(secondsLeft / 60)}m left`;
                                                else timeRemaining = `${Math.ceil(secondsLeft / 3600)}h left`;
                                            }
                                        }

                                        const handleCancel = async (e) => {
                                            e.stopPropagation();
                                            if (window.electronAPI) {
                                                await window.electronAPI.cancelDownload(d.id);
                                            }
                                        };

                                        const handleRemove = async (e) => {
                                            e.stopPropagation();
                                            if (window.electronAPI) {
                                                const updated = await window.electronAPI.removeDownload(d.id);
                                                setDownloads(updated);
                                            }
                                        };

                                        return (
                                            <div key={i} className={`gap-3 px-4 py-3 border-b last:border-0 ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className={`text-sm font-medium truncate max-w-[180px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{d.filename}</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                                            {isProgressing ? `${percent}%` : (d.state === 'completed' ? 'Done' : 'Cancelled')}
                                                        </div>
                                                        {isProgressing ? (
                                                            <button onClick={handleCancel} className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-black/60'}`} title="Cancel">
                                                                <StopIcon size={12} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={handleRemove} className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-white/10 text-white/60 hover:text-red-400' : 'hover:bg-black/10 text-black/60 hover:text-red-500'}`} title="Remove from list">
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {isProgressing && (
                                                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${percent}%` }} />
                                                    </div>
                                                )}
                                                <div className={`text-xs flex justify-between ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                                    <span>
                                                        {isProgressing ?
                                                            `${formatBytes(d.received)} of ${formatBytes(d.size)}` :
                                                            formatBytes(d.size)
                                                        }
                                                    </span>
                                                    {isProgressing && d.speed && <span className="text-blue-500 font-medium">{d.speed}</span>}
                                                    {isProgressing && <span>{timeRemaining}</span>}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
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
                                <button className={menuItemClass} onClick={() => {
                                    if (window.electronAPI?.log) window.electronAPI.log('Toolbar: Settings Clicked');
                                    console.log('Toolbar: Settings Clicked');
                                    onOpenSettings?.();
                                    setActivePopover(null);
                                }}>
                                    <Settings size={16} />Settings
                                </button>
                                <button className={menuItemClass}><Info size={16} />About One Browser</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}));

export default Toolbar;
