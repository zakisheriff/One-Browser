import React, { memo } from 'react';
import { EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Check if running in incognito mode
const urlParams = new URLSearchParams(window.location.search);
const isIncognito = urlParams.get('incognito') === 'true';

const Titlebar = memo(function Titlebar() {
    const { theme } = useTheme();

    return (
        <div
            className={`titlebar-drag h-10 flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'
                }`}
        >
            {/* Spacer for native traffic lights */}
            <div className="absolute left-4 w-16" />

            <div className="flex items-center gap-2">
                {isIncognito ? (
                    <>
                        <EyeOff size={14} className={theme === 'dark' ? 'text-white/70' : 'text-black/70'} />
                        <span
                            className={theme === 'dark' ? 'text-white/70' : 'text-black/70'}
                            style={{
                                fontFamily: "'SF Pro Display', 'Inter', 'Geist', -apple-system, sans-serif",
                                fontWeight: 700,
                                fontSize: '13px',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Incognito
                        </span>
                    </>
                ) : (
                    <span
                        className={theme === 'dark' ? 'text-white/70' : 'text-black/70'}
                        style={{
                            fontFamily: "'SF Pro Display', 'Inter', 'Geist', -apple-system, sans-serif",
                            fontWeight: 800,
                            fontSize: '13px',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        One Browser
                    </span>
                )}
            </div>

            <div className="absolute right-4 w-16" />
        </div>
    );
});

export default Titlebar;
