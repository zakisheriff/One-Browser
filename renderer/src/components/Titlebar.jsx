import React, { memo } from 'react';
import { Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Titlebar = memo(function Titlebar() {
    const { theme } = useTheme();

    const handleMinimize = () => window.electronAPI?.minimize();
    const handleMaximize = () => window.electronAPI?.fullscreen();
    const handleClose = () => window.electronAPI?.close();

    const trafficLightBtn = "w-3 h-3 rounded-full transition-all flex items-center justify-center cursor-default select-none";

    return (
        <div
            className={`titlebar-drag h-10 flex items-center justify-between px-4 ${theme === 'dark' ? 'bg-black' : 'bg-white'
                }`}
        >
            <div className="flex items-center gap-2 titlebar-no-drag">
                <button onClick={handleClose} className={`${trafficLightBtn} bg-[#FF5F57] hover:brightness-90 group`} title="Close">
                    <svg className="w-2 h-2 opacity-0 group-hover:opacity-100" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
                <button onClick={handleMinimize} className={`${trafficLightBtn} bg-[#FEBC2E] hover:brightness-90 group`} title="Minimize">
                    <svg className="w-2 h-2 opacity-0 group-hover:opacity-100" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5H9" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
                <button onClick={handleMaximize} className={`${trafficLightBtn} bg-[#28C840] hover:brightness-90 group`} title="Full Screen">
                    <svg className="w-2 h-2 opacity-0 group-hover:opacity-100" viewBox="0 0 10 10" fill="none">
                        <path d="M1 3V1H3M7 1H9V3M9 7V9H7M3 9H1V7" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <Globe size={14} className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    One Browser
                </span>
            </div>

            <div className="w-14" />
        </div>
    );
});

export default Titlebar;
