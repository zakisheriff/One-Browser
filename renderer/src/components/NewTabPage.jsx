import React from 'react';
import { Clock, Star, Search, Sparkles, Globe, Github, Youtube, Twitter, BookOpen, Code, Briefcase, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const quickLinks = [
    { name: 'Google', url: 'https://www.google.com', icon: Search },
    { name: 'YouTube', url: 'https://www.youtube.com', icon: Youtube },
    { name: 'GitHub', url: 'https://github.com', icon: Github },
    { name: 'Twitter/X', url: 'https://x.com', icon: Twitter },
    { name: 'Reddit', url: 'https://www.reddit.com', icon: MessageCircle },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: BookOpen },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: Code },
    { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: Briefcase },
];

function NewTabPage({ onNavigate }) {
    const { theme } = useTheme();

    return (
        <div
            className={`h-full w-full flex flex-col items-center justify-center p-8 rounded-3xl overflow-auto ${theme === 'dark' ? 'bg-black' : 'bg-white'
                }`}
        >
            {/* Logo */}
            <div className="mb-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center ${theme === 'dark' ? 'border-white/20' : 'border-black/20'
                    }`}>
                    <Globe size={32} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                </div>
                <h1 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    One Browser
                </h1>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                    Privacy-first browsing
                </p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-xl mb-10">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const query = e.target.search.value.trim();
                        if (query) {
                            onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                        }
                    }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-full transition-all border ${theme === 'dark'
                            ? 'bg-white/5 border-white/10 focus-within:border-white/30'
                            : 'bg-black/5 border-black/10 focus-within:border-black/30'
                        }`}
                >
                    <Search size={20} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search the web..."
                        className={`flex-1 bg-transparent outline-none text-base ${theme === 'dark' ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'
                            }`}
                    />
                </form>
            </div>

            {/* Quick Links Grid */}
            <div className="w-full max-w-3xl">
                <h2 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    Quick Links
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                                    {link.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feature Cards */}
            <div className="w-full max-w-3xl mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                    className={`p-5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                        }`}
                >
                    <Star className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Bookmarks</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                        Save your favorites
                    </p>
                </div>
                <div
                    className={`p-5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                        }`}
                >
                    <Clock className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>History</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                        Private & local only
                    </p>
                </div>
                <div
                    className={`p-5 rounded-2xl transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                        }`}
                >
                    <Sparkles className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} size={24} />
                    <h3 className={`font-medium mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>AI Assistant</h3>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                        Summarize, rewrite, explore
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NewTabPage;
