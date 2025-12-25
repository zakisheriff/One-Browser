import React, { memo, useState, useEffect, useCallback } from 'react';
import { X, Puzzle, Plus, Trash2, RefreshCw, Download, Link, FolderOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ExtensionsModal = memo(function ExtensionsModal({ isOpen, onClose }) {
    const { theme } = useTheme();
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [installError, setInstallError] = useState('');

    const loadExtensions = useCallback(async () => {
        if (window.electronAPI?.getExtensions) {
            const exts = await window.electronAPI.getExtensions();
            setExtensions(exts || []);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadExtensions();
            setUrlInput('');
            setInstallError('');
        }
    }, [isOpen, loadExtensions]);

    const handleLoadExtension = async () => {
        setLoading(true);
        setInstallError('');
        try {
            if (window.electronAPI?.loadExtension) {
                const result = await window.electronAPI.loadExtension();
                if (result.success) {
                    await loadExtensions();
                } else if (!result.canceled) {
                    setInstallError(result.error || 'Failed to load extension');
                }
            }
        } catch (error) {
            setInstallError(error.message);
        }
        setLoading(false);
    };

    const handleInstallFromUrl = async () => {
        if (!urlInput.trim()) return;

        setLoading(true);
        setInstallError('');
        try {
            if (window.electronAPI?.downloadExtensionFromUrl) {
                const result = await window.electronAPI.downloadExtensionFromUrl(urlInput.trim());
                if (result.success) {
                    await loadExtensions();
                    setUrlInput('');
                } else {
                    setInstallError(result.error || 'Failed to install extension');
                }
            }
        } catch (error) {
            setInstallError(error.message);
        }
        setLoading(false);
    };

    const handleRemoveExtension = async (extensionId) => {
        if (window.electronAPI?.removeExtension) {
            const result = await window.electronAPI.removeExtension(extensionId);
            if (result.success) {
                await loadExtensions();
            } else {
                setInstallError(result.error || 'Failed to remove extension');
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
            <div className={`relative w-[520px] max-h-[650px] rounded-3xl overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
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

                {/* Install from URL */}
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                    <label className={`text-xs font-medium mb-2 block ${theme === 'dark' ? 'text-white/60' : 'text-black/60'
                        }`}>
                        Install from Chrome Web Store
                    </label>
                    <div className="flex gap-2">
                        <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
                            }`}>
                            <Link size={16} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInstallFromUrl()}
                                placeholder="Paste Chrome Web Store URL..."
                                className={`flex-1 bg-transparent outline-none text-sm ${theme === 'dark' ? 'text-white placeholder-white/30' : 'text-black placeholder-black/30'
                                    }`}
                            />
                        </div>
                        <button
                            onClick={handleInstallFromUrl}
                            disabled={loading || !urlInput.trim()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${theme === 'dark'
                                    ? 'bg-white text-black hover:bg-white/90'
                                    : 'bg-black text-white hover:bg-black/90'
                                } ${(loading || !urlInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Download size={16} />
                            {loading ? 'Installing...' : 'Install'}
                        </button>
                    </div>

                    {/* Error message */}
                    {installError && (
                        <p className="text-xs text-red-500 mt-2">{installError}</p>
                    )}

                    {/* OR divider */}
                    <div className="flex items-center gap-3 my-3">
                        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                        <span className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>or</span>
                        <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                    </div>

                    {/* Load unpacked */}
                    <button
                        onClick={handleLoadExtension}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${theme === 'dark'
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-black/10 text-black hover:bg-black/20'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FolderOpen size={16} />
                        Load Unpacked Extension
                    </button>
                </div>

                {/* Extensions List */}
                <div className="flex-1 overflow-auto">
                    {/* List header */}
                    <div className={`flex items-center justify-between px-6 py-2 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'
                        }`}>
                        <span className="text-xs font-medium">Installed Extensions ({extensions.length})</span>
                        <button
                            onClick={loadExtensions}
                            className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                                }`}
                            title="Refresh"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        {extensions.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-8 ${theme === 'dark' ? 'text-white/40' : 'text-black/40'
                                }`}>
                                <Puzzle size={40} className="mb-3 opacity-50" />
                                <p className="text-sm font-medium">No extensions installed</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {extensions.map((ext) => (
                                    <div
                                        key={ext.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
                                            }`}
                                    >
                                        {/* Extension Icon */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                                            }`}>
                                            {ext.icon ? (
                                                <img
                                                    src={`file://${ext.icon}`}
                                                    alt={ext.name}
                                                    className="w-6 h-6"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <Puzzle size={18} className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} />
                                            )}
                                        </div>

                                        {/* Extension Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-black'
                                                }`}>
                                                {ext.name}
                                            </h3>
                                            <p className={`text-xs truncate ${theme === 'dark' ? 'text-white/50' : 'text-black/50'
                                                }`}>
                                                v{ext.version}
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
                </div>
            </div>
        </div>
    );
});

export default ExtensionsModal;
