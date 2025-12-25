import React, { memo, useState, useEffect, useCallback } from 'react';
import { X, Puzzle, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ExtensionsModal = memo(function ExtensionsModal({ isOpen, onClose }) {
    const { theme } = useTheme();
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadExtensions = useCallback(async () => {
        if (window.electronAPI?.getExtensions) {
            const exts = await window.electronAPI.getExtensions();
            setExtensions(exts || []);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadExtensions();
        }
    }, [isOpen, loadExtensions]);

    const handleLoadExtension = async () => {
        setLoading(true);
        try {
            if (window.electronAPI?.loadExtension) {
                const result = await window.electronAPI.loadExtension();
                if (result.success) {
                    await loadExtensions();
                } else if (!result.canceled) {
                    alert('Failed to load extension: ' + (result.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error loading extension:', error);
            alert('Failed to load extension: ' + error.message);
        }
        setLoading(false);
    };

    const handleRemoveExtension = async (extensionId) => {
        if (window.electronAPI?.removeExtension) {
            const result = await window.electronAPI.removeExtension(extensionId);
            if (result.success) {
                await loadExtensions();
            } else {
                alert('Failed to remove extension: ' + (result.error || 'Unknown error'));
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-[480px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Puzzle size={20} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                        <h2
                            className={`text-xl ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                            style={{
                                fontFamily: "'SF Pro Display', 'Inter', 'Geist', -apple-system, sans-serif",
                                fontWeight: 700,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Extensions
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-black/60'
                            }`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className={`px-6 py-3 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-black/10'
                    }`}>
                    <button
                        onClick={handleLoadExtension}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${theme === 'dark'
                                ? 'bg-white text-black hover:bg-white/90'
                                : 'bg-black text-white hover:bg-black/90'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus size={16} />
                        Load Unpacked
                    </button>
                    <button
                        onClick={loadExtensions}
                        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-black/60'
                            }`}
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Extensions List */}
                <div className="flex-1 overflow-auto p-4">
                    {extensions.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-12 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'
                            }`}>
                            <Puzzle size={48} className="mb-4 opacity-50" />
                            <p className="text-sm font-medium mb-2">No extensions installed</p>
                            <p className="text-xs text-center max-w-[200px]">
                                Click "Load Unpacked" to install a Chrome extension from a folder
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {extensions.map((ext) => (
                                <div
                                    key={ext.id}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
                                        }`}
                                >
                                    {/* Extension Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                                        }`}>
                                        {ext.icon ? (
                                            <img
                                                src={`file://${ext.icon}`}
                                                alt={ext.name}
                                                className="w-6 h-6"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <Puzzle
                                            size={20}
                                            className={theme === 'dark' ? 'text-white/60' : 'text-black/60'}
                                            style={{ display: ext.icon ? 'none' : 'block' }}
                                        />
                                    </div>

                                    {/* Extension Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-black'
                                            }`}>
                                            {ext.name}
                                        </h3>
                                        <p className={`text-xs truncate ${theme === 'dark' ? 'text-white/50' : 'text-black/50'
                                            }`}>
                                            Version {ext.version}
                                        </p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveExtension(ext.id)}
                                        className={`p-2 rounded-full transition-colors ${theme === 'dark'
                                                ? 'hover:bg-white/10 text-white/40 hover:text-red-400'
                                                : 'hover:bg-black/10 text-black/40 hover:text-red-500'
                                            }`}
                                        title="Remove extension"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-3 border-t text-xs ${theme === 'dark' ? 'border-white/10 text-white/40' : 'border-black/10 text-black/40'
                    }`}>
                    Extensions are loaded from unpacked folders. Download extensions from the Chrome Web Store on your browser, then load the unpacked folder here.
                </div>
            </div>
        </div>
    );
});

export default ExtensionsModal;
