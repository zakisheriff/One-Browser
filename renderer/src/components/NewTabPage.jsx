import React, { useState, useRef, useCallback } from 'react';
import { Clock, Star, Search, Sparkles, Globe, Youtube, MessageSquare, Gem, Camera } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

// Brand SVG icons
const GoogleIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const YouTubeIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const GeminiIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <defs>
            <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A73E8" />
                <stop offset="50%" stopColor="#8E24AA" />
                <stop offset="100%" stopColor="#EA4335" />
            </linearGradient>
        </defs>
        <path fill="url(#geminiGrad)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

const InstagramIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <defs>
            <linearGradient id="instaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="25%" stopColor="#F77737" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="75%" stopColor="#C13584" />
                <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
        </defs>
        <path fill="url(#instaGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);

const GitHubIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const ChatGPTIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path fill="#10A37F" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
);

// Search Engine Icons
const BingIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path fill="#008373" d="M5 3v16.5l4.5 2.5 8-4.5v-5l-6.5-2-1.5 1v4l-2-1V3z" />
    </svg>
);

const DuckDuckGoIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <circle fill="#DE5833" cx="12" cy="12" r="10" />
        <ellipse fill="#FFF" cx="9" cy="10" rx="2" ry="2.5" />
        <ellipse fill="#FFF" cx="15" cy="10" rx="2" ry="2.5" />
        <circle fill="#222" cx="9" cy="10" r="1" />
        <circle fill="#222" cx="15" cy="10" r="1" />
        <path fill="#FFA" d="M12 14c-2 0-3 1-3 2s1 2 3 2 3-1 3-2-1-2-3-2z" />
    </svg>
);

const BraveIcon = ({ size = 24, className }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
        <path fill="#FB542B" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.5L18.5 8v8L12 19.5 5.5 16V8L12 4.5z" />
        <path fill="#FB542B" d="M12 7l-4 2.5v5L12 17l4-2.5v-5L12 7z" />
    </svg>
);

const quickLinks = [
    { name: 'Google', url: 'https://www.google.com', icon: GoogleIcon },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: YouTubeIcon },
    { name: 'ChatGPT', url: 'https://chatgpt.com', icon: ChatGPTIcon },
    { name: 'Gemini', url: 'https://gemini.google.com', icon: GeminiIcon },
    { name: 'Instagram', url: 'https://www.instagram.com', icon: InstagramIcon },
];

function NewTabPage({ onNavigate, onOpenPanel }) {
    const { theme } = useTheme();
    const [searchValue, setSearchValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);

    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (query.includes('.') && !query.includes(' ')) {
            setSuggestions([]);
            return;
        }

        try {
            if (window.electronAPI?.getSuggestions) {
                const results = await window.electronAPI.getSuggestions(query);
                if (results && results.length > 0) {
                    setSuggestions(results);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }
        } catch (e) {
            setSuggestions([]);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 80);
    };

    const { settings } = useSettings() || {};
    const searchEngine = settings?.searchEngine || 'google';

    // Search engine configuration for dynamic branding
    const searchEngineConfig = {
        google: {
            name: 'Google',
            icon: GoogleIcon,
            placeholder: 'Search Google or type a URL',
            color: '#4285F4'
        },
        bing: {
            name: 'Bing',
            icon: BingIcon,
            placeholder: 'Search Bing or type a URL',
            color: '#008373'
        },
        duckduckgo: {
            name: 'DuckDuckGo',
            icon: DuckDuckGoIcon,
            placeholder: 'Search DuckDuckGo privately',
            color: '#DE5833'
        },
        brave: {
            name: 'Brave',
            icon: BraveIcon,
            placeholder: 'Search Brave privately',
            color: '#FB542B'
        }
    };

    const currentEngine = searchEngineConfig[searchEngine] || searchEngineConfig.google;
    const SearchEngineIcon = currentEngine.icon;

    const handleSearch = (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;

        setShowSuggestions(false);
        setSuggestions([]);

        let searchUrl = 'https://www.google.com/search?q=';
        if (searchEngine === 'bing') searchUrl = 'https://www.bing.com/search?q=';
        if (searchEngine === 'duckduckgo') searchUrl = 'https://duckduckgo.com/?q=';
        if (searchEngine === 'brave') searchUrl = 'https://search.brave.com/search?q=';

        onNavigate(`${searchUrl}${encodeURIComponent(trimmed)}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchValue);
    };

    return (
        <div className={`h-full w-full flex flex-col items-center justify-center p-8 rounded-3xl overflow-auto ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            {/* Dynamic Search Engine Logo */}
            <div className="mb-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <SearchEngineIcon size={64} />
                </div>
                <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {currentEngine.name}
                </h1>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                    Powered by One Browser
                </p>
            </div>

            {/* Search Box with Suggestions */}
            <div className="w-full max-w-xl mb-10 relative">
                <form
                    onSubmit={handleSubmit}
                    className={`flex items-center gap-3 px-5 py-3 rounded-full transition-all border ${theme === 'dark'
                        ? 'bg-white/5 border-white/10 focus-within:border-white/30'
                        : 'bg-black/5 border-black/10 focus-within:border-black/30'
                        }`}
                >
                    <Search size={20} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleInputChange}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder={currentEngine.placeholder}
                        className={`flex-1 bg-transparent outline-none text-base ${theme === 'dark' ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'
                            }`}
                    />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'
                        }`}>
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSearch(suggestion)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'
                                    }`}
                            >
                                <Search size={14} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Links Grid */}
            <div className="w-full max-w-2xl">
                <h2 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    Quick Links
                </h2>
                <div className="grid grid-cols-5 gap-3">
                    {quickLinks.map((link) => {
                        const IconComponent = link.icon;
                        return (
                            <button
                                key={link.url}
                                onClick={() => onNavigate(link.url)}
                                className={`group flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${theme === 'dark'
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                    : 'bg-black/5 border-black/10 hover:bg-black/10'
                                    }`}
                            >
                                <IconComponent size={24} className={theme === 'dark' ? 'text-white/70' : 'text-black/70'} />
                                <span className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                                    {link.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feature Cards - Now Clickable */}
            <div className="w-full max-w-2xl mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                    onClick={() => onOpenPanel?.('bookmarks')}
                    className={`p-5 rounded-2xl transition-all border text-left cursor-default ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                        }`}
                >
                    <Star className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Bookmarks</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Save your favorites</p>
                </button>
                <button
                    onClick={() => onOpenPanel?.('history')}
                    className={`p-5 rounded-2xl transition-all border text-left cursor-default ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                        }`}
                >
                    <Clock className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>History</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Private & local only</p>
                </button>
                <button
                    onClick={() => onOpenPanel?.('ai')}
                    className={`p-5 rounded-2xl transition-all border text-left cursor-default ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
                        }`}
                >
                    <Sparkles className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>AI Assistant</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Summarize, rewrite, explore</p>
                </button>
            </div>
        </div>
    );
}

export default NewTabPage;
