import React, { memo, useState } from 'react';
import { X, Plus, Globe } from 'lucide-react';
import { useTabs } from '../context/TabContext';
import { useTheme } from '../context/ThemeContext';

const TabBar = memo(function TabBar() {
    const { tabs, activeTabId, addTab, removeTab, setActiveTab, reorderTabs } = useTabs();
    const { theme } = useTheme();
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Make drag smoother
        e.target.style.opacity = '0.5';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, toIndex) => {
        e.preventDefault();
        const fromIndex = draggedIndex;
        if (fromIndex !== null && fromIndex !== toIndex) {
            reorderTabs(fromIndex, toIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 overflow-x-auto rounded-[28px] mx-1 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'
            }`}>
            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        transform: dragOverIndex === index
                            ? (draggedIndex !== null && draggedIndex < index ? 'translateX(-8px)' : 'translateX(8px)')
                            : 'translateX(0)',
                        transition: 'transform 150ms ease, opacity 150ms ease, background-color 150ms ease',
                    }}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full cursor-grab active:cursor-grabbing min-w-[100px] max-w-[180px] ${draggedIndex === index ? 'opacity-50' : 'opacity-100'
                        } ${activeTabId === tab.id
                            ? theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                            : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'
                        }`}
                >
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                        {tab.loading ? (
                            <div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-white/60' : 'border-black/60'
                                }`} />
                        ) : tab.favicon ? (
                            <img src={tab.favicon} alt="" className="w-4 h-4 rounded-full" />
                        ) : (
                            <Globe size={14} className={theme === 'dark' ? 'text-white/50' : 'text-black/50'} />
                        )}
                    </div>
                    <span className={`text-xs truncate flex-1 ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
                        {tab.title || 'New Tab'}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
                        className={`w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-default ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                            }`}
                    >
                        <X size={10} className={theme === 'dark' ? 'text-white/60' : 'text-black/60'} />
                    </button>
                </div>
            ))}
            <button
                onClick={() => addTab()}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 cursor-default ${theme === 'dark' ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/60 hover:text-black'
                    }`}
            >
                <Plus size={16} />
            </button>
        </div>
    );
});

export default TabBar;
