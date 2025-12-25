import React, { memo } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AboutModal = memo(function AboutModal({ isOpen, onClose }) {
    const { theme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-80 rounded-3xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white/60' : 'hover:bg-black/10 text-black/60'
                        }`}
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    {/* App Name - Bold with tight letter-spacing */}
                    <h2
                        className={`text-3xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                        style={{
                            fontFamily: "'SF Pro Display', 'Inter', 'Geist', -apple-system, sans-serif",
                            fontWeight: 800,
                            letterSpacing: '-0.03em'
                        }}
                    >
                        One Browser
                    </h2>

                    {/* Version */}
                    <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'
                        }`}>
                        Version 1.0.0
                    </p>

                    {/* Description */}
                    <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-white/70' : 'text-black/70'
                        }`}>
                        A privacy-first, aesthetic browser designed for the modern web.
                    </p>

                    {/* Divider */}
                    <div className={`h-px mb-6 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                        }`} />

                    {/* Creator */}
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-black/40'
                        }`}>
                        Created by
                    </p>
                    <p
                        className={`text-base mb-4 ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}
                        style={{
                            fontFamily: "'SF Pro Display', 'Inter', 'Geist', -apple-system, sans-serif",
                            fontWeight: 700,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        The One Atom
                    </p>

                    {/* Copyright */}
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-black/30'
                        }`}>
                        © 2025 All rights reserved
                    </p>
                </div>
            </div>
        </div>
    );
});

export default AboutModal;
