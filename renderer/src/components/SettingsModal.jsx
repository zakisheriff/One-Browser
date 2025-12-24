import React, { useState } from 'react';
import { X, Settings, Shield, Monitor, Layout, Search, Download, Box, Code, Cpu, Accessibility, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const SettingsSidebar = ({ activeSection, setActiveSection }) => {
    const { theme } = useTheme();

    const sections = [
        { id: 'general', icon: Settings, label: 'General' },
        { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
        { id: 'appearance', icon: Monitor, label: 'Appearance' },
        { id: 'tabs', icon: Layout, label: 'Tabs & Windows' },
        { id: 'search', icon: Search, label: 'Search Engine' },
        { id: 'downloads', icon: Download, label: 'Downloads' },
        { id: 'extensions', icon: Box, label: 'Extensions' },
        { id: 'ai', icon: Cpu, label: 'AI & Sidebar' },
        { id: 'accessibility', icon: Accessibility, label: 'Accessibility' },
        { id: 'developer', icon: Code, label: 'Developer' },
    ];

    return (
        <div className={`w-64 h-full flex flex-col border-r ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
            <div className="p-6">
                <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Settings</h2>
                <div className="space-y-2">
                    {sections.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === id
                                ? (theme === 'dark' ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'bg-black/5 text-black shadow-lg shadow-black/5')
                                : (theme === 'dark' ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-black/60 hover:bg-black/5 hover:text-black')
                                }`}
                        >
                            <Icon size={18} />
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... (Sub-components like GeneralSettings, PrivacySettings will go here)

import GeneralSettings from './settings/GeneralSettings';
import PrivacySettings from './settings/PrivacySettings';
import AppearanceSettings from './settings/AppearanceSettings';
import TabsSettings from './settings/TabsSettings';
import SearchSettings from './settings/SearchSettings';
import DownloadsSettings from './settings/DownloadsSettings';
import ExtensionsSettings from './settings/ExtensionsSettings';
import AISettings from './settings/AISettings';
import AccessibilitySettings from './settings/AccessibilitySettings';
import DeveloperSettings from './settings/DeveloperSettings';

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const [activeSection, setActiveSection] = useState('general');

    if (window.electronAPI?.log) window.electronAPI.log('SettingsModal Render. isOpen:', isOpen);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeSection) {
            case 'general': return <GeneralSettings />;
            case 'privacy': return <PrivacySettings />;
            case 'appearance': return <AppearanceSettings />;
            case 'tabs': return <TabsSettings />;
            case 'search': return <SearchSettings />;
            case 'downloads': return <DownloadsSettings />;
            case 'extensions': return <ExtensionsSettings />;
            case 'ai': return <AISettings />;
            case 'accessibility': return <AccessibilitySettings />;
            case 'developer': return <DeveloperSettings />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-8 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-5xl h-full max-h-[800px] flex rounded-3xl overflow-hidden shadow-2xl relative ${theme === 'dark' ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/10'
                }`}>
                <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

                <div className="flex-1 h-full overflow-y-auto relative">
                    {/* Close button absolute top-right */}
                    <div className="absolute top-6 right-6 z-10">
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-black/10 text-black/60 hover:text-black'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 pb-20">
                        <h1 className={`text-2xl font-bold mb-8 capitalize ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {activeSection} Settings
                        </h1>

                        {/* Content */}
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
