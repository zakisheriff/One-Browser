import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Cpu, Sparkles } from 'lucide-react';

const AISettings = () => {
    const { settings, updateSettings } = useSettings();
    const { theme } = useTheme();

    return (
        <div className="space-y-8 max-w-2xl">
            <section className="space-y-4">
                <h3 className={`text-lg font-medium flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <Cpu size={20} />
                    Artificial Intelligence
                </h3>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Enable AI Sidebar</h4>
                                <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>Access AI assistant from the side panel</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings?.enableAISidebar ? 'bg-blue-500' : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')}`}>
                                <input
                                    type="checkbox"
                                    className="opacity-0 absolute inset-0 cursor-pointer"
                                    checked={settings?.enableAISidebar || false}
                                    onChange={(e) => updateSettings({ enableAISidebar: e.target.checked })}
                                />
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.enableAISidebar ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </label>

                        <div className={`h-px ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />

                        <div className="space-y-2">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>AI Model</h4>
                            <select
                                className={`w-full p-2 rounded-lg outline-none ${theme === 'dark' ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'}`}
                                value={settings?.aiModel || 'gemini-pro'}
                                onChange={(e) => updateSettings({ aiModel: e.target.value })}
                            >
                                <option value="gemini-pro">Gemini Pro (Default)</option>
                                <option value="gpt-3.5">GPT 3.5 Turbo</option>
                                <option value="claude-3">Claude 3 Haiku</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AISettings;
