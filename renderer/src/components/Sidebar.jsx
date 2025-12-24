import React, { useState, useEffect, memo } from 'react';
import { X, Star, Clock, Download, Sparkles, Trash2, ExternalLink, Folder, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = memo(function Sidebar({ isOpen, onClose, content, onNavigate }) {
    const { theme } = useTheme();
    const [bookmarks, setBookmarks] = useState([]);
    const [history, setHistory] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && window.electronAPI) {
            if (content === 'bookmarks') {
                window.electronAPI.getBookmarks().then(setBookmarks);
            } else if (content === 'history') {
                window.electronAPI.getHistory().then(setHistory);
            }
        }
    }, [isOpen, content]);

    const handleClearHistory = async () => {
        if (window.electronAPI) {
            await window.electronAPI.clearHistory();
            setHistory([]);
        }
    };

    const filteredHistory = history.filter(entry =>
        !searchQuery ||
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const headingClass = `text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`;
    const mutedClass = `text-sm ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`;
    const itemClass = `w-full text-left p-4 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
        }`;

    const renderContent = () => {
        switch (content) {
            case 'bookmarks':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                                <Star className={theme === 'dark' ? 'text-white' : 'text-black'} size={20} />
                            </div>
                            <h2 className={headingClass}>Bookmarks</h2>
                        </div>
                        <div className="flex-1 overflow-auto space-y-3">
                            {bookmarks.length === 0 ? (
                                <div className={`text-center py-12 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                    <Star size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No bookmarks yet</p>
                                    <p className="text-sm mt-1">Click the star icon to save pages</p>
                                </div>
                            ) : (
                                bookmarks.map((bookmark, i) => (
                                    <button key={i} onClick={() => { onNavigate(bookmark.url); onClose(); }} className={itemClass}>
                                        <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            {bookmark.title}
                                        </div>
                                        <div className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                            {bookmark.url}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                                    <Clock className={theme === 'dark' ? 'text-white' : 'text-black'} size={20} />
                                </div>
                                <h2 className={headingClass}>History</h2>
                            </div>
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400' : 'bg-black/10 hover:bg-red-100 text-black/70 hover:text-red-600'
                                        }`}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                            <Search size={16} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search history..."
                                className={`flex-1 bg-transparent outline-none text-sm ${theme === 'dark' ? 'text-white placeholder-white/40' : 'text-black placeholder-black/40'}`}
                            />
                        </div>

                        <div className="flex-1 overflow-auto space-y-2">
                            {filteredHistory.length === 0 ? (
                                <div className={`text-center py-12 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                    <Clock size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>{searchQuery ? 'No results found' : 'No browsing history'}</p>
                                </div>
                            ) : (
                                filteredHistory.slice(0, 50).map((entry, i) => (
                                    <button key={i} onClick={() => { onNavigate(entry.url); onClose(); }} className={itemClass}>
                                        <div className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            {entry.title || 'Untitled'}
                                        </div>
                                        <div className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
                                            {entry.url}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'downloads':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                                <Download className={theme === 'dark' ? 'text-white' : 'text-black'} size={20} />
                            </div>
                            <h2 className={headingClass}>Downloads</h2>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Download size={48} className={`mb-4 ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`} />
                            <p className={mutedClass}>No downloads yet</p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Downloaded files will appear here</p>
                        </div>
                    </div>
                );

            case 'ai':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>
                                <Sparkles className={theme === 'dark' ? 'text-white' : 'text-black'} size={20} />
                            </div>
                            <h2 className={headingClass}>AI Assistant</h2>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className={`flex-1 p-5 rounded-2xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                                    Ask me anything about the current page. I can help you:
                                </p>
                                <ul className={`mt-3 space-y-2 text-sm ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                                    <li>• Summarize page content</li>
                                    <li>• Answer questions</li>
                                    <li>• Rewrite or explain text</li>
                                    <li>• Generate content ideas</li>
                                </ul>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); setAiInput(''); }} className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    placeholder="Ask something..."
                                    className={`flex-1 px-4 py-3 rounded-xl outline-none text-sm border ${theme === 'dark'
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-white/20'
                                            : 'bg-black/5 border-black/10 text-black placeholder-black/40 focus:border-black/20'
                                        }`}
                                />
                                <button
                                    type="submit"
                                    className={`px-5 py-3 rounded-xl font-medium transition-colors ${theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'
                                        }`}
                                >
                                    Ask
                                </button>
                            </form>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className={`fixed inset-0 z-40 transition-opacity ${theme === 'dark' ? 'bg-black/60' : 'bg-black/30'}`}
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 ease-out p-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } ${theme === 'dark' ? 'bg-[#0a0a0a] border-l border-white/10' : 'bg-white border-l border-black/10'}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-black/60'
                        }`}
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="h-full pt-8">{renderContent()}</div>
            </div>
        </>
    );
});

export default Sidebar;
