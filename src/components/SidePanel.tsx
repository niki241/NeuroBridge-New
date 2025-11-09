import React from 'react';
import EmotionGraph from './EmotionGraph';
import EmpathyGauge from './EmpathyGauge';
import RewardsCard from './RewardsCard';
import { EmotionState, AppMode } from '../types';

const modes: { id: AppMode, label: string, icon: string }[] = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'video', label: 'Video', icon: '🎥' },
    { id: 'voice', label: 'Voice', icon: '🎧' },
    { id: 'api', label: 'API', icon: '🧩' },
    { id: 'insights', label: 'Insights', icon: '📊' },
];

interface SidePanelProps {
    currentEmotion: EmotionState;
    activeMode: AppMode;
    setActiveMode: (mode: AppMode) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ currentEmotion, activeMode, setActiveMode }) => {
    return (
        <div className="glassmorphism rounded-2xl p-4 h-full flex flex-col gap-4">
            <div className="flex-shrink-0">
                <EmpathyGauge value={currentEmotion.score} />
            </div>
            <div className="flex-grow min-h-0 overflow-y-auto">
                <EmotionGraph activeEmotion={currentEmotion.name} />
                <div className="mt-4">
                    <RewardsCard />
                </div>
            </div>
            <div className="flex-shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                     {modes.map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                activeMode === mode.id 
                                ? 'bg-white/20 text-white neon-glow-purple' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            {mode.icon} {mode.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SidePanel;