import React, { useState, useEffect } from 'react';
import VideoDisplay from './VideoDisplay';
import { ChatWindow } from './ChatWindow';
import InsightsDashboard from './InsightsDashboard';
import Gamification from './Gamification';
import { MicIcon, StarIcon, ActivityIcon } from './icons';
import { ChatMessage, EmotionState, AppMode } from '../types';

interface MainPanelProps {
  currentEmotion: EmotionState;
  activeMode: AppMode;
  isCamOn: boolean;
  isMirrorMode: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  starCount: number;
  showRewardAnimation: boolean;
  isTtsEnabled: boolean;
  onReplayMessage: (text: string) => void;
  isAiTyping: boolean;
  isListening: boolean;
  interimTranscript: string;
}

type TabType = 'main';

const MainPanel: React.FC<MainPanelProps> = ({ 
    currentEmotion, 
    activeMode, 
    isCamOn, 
    isMirrorMode,
    messages,
    onSendMessage,
    starCount,
    showRewardAnimation,
    isTtsEnabled,
    onReplayMessage,
    isAiTyping,
    isListening,
    interimTranscript
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [tooltip, setTooltip] = useState<{ text: string; show: boolean }>({ text: '', show: false });

  useEffect(() => {
    let newTooltipText = currentEmotion.tooltip;
    switch(activeMode) {
        case 'chat':
            newTooltipText = 'Analyzing text sentiment...';
            break;
        case 'voice':
            newTooltipText = isListening ? 'Listening...' : 'Ready to listen...';
            break;
        case 'video':
            newTooltipText = isCamOn ? 'Analyzing video feed...' : 'Video is off';
            break;
        default:
            newTooltipText = currentEmotion.tooltip;
    }
    setTooltip(prev => ({ ...prev, text: newTooltipText }));
  }, [currentEmotion, activeMode, isListening, isCamOn]);
  
  const VoiceModeDisplay = () => (
    <div className="w-full h-full solid-bg-2 rounded-xl flex flex-col items-center justify-center text-center p-4">
        <MicIcon className={`w-24 h-24 text-purple-400 ${isListening ? 'animate-pulse' : ''}`} />
        <h2 className="text-2xl font-bold mt-4 text-white">Voice Mode Active</h2>
        <p className="text-gray-300 mt-2">{isListening ? "I'm listening..." : "Toggle the mic to speak."}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top bar with emotion indicator */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: currentEmotion.color }}
              onMouseEnter={() => setTooltip({ text: currentEmotion.tooltip, show: true })}
              onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
            />
            <span className="text-sm font-medium">{currentEmotion.emoji} {currentEmotion.name}</span>
            {tooltip.show && (
              <div className="absolute bg-gray-900 text-white text-xs p-2 rounded shadow-lg mt-8 z-10">
                {tooltip.text}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">{starCount}</span>
            </div>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="flex items-center space-x-1">
              <MicIcon className={`w-5 h-5 ${isListening ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm">{isListening ? 'Listening...' : 'Voice'}</span>
            </div>
          </div>
        </div>
        
        {/* No tabs - simplified interface */}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {activeMode === 'voice' ? (
          <VoiceModeDisplay />
        ) : (
          <ChatWindow 
            messages={messages}
            onSendMessage={onSendMessage}
            isAiTyping={isAiTyping}
            isTtsEnabled={isTtsEnabled}
            onReplayMessage={onReplayMessage}
            interimTranscript={interimTranscript}
          />
        )}
        {activeMode === 'video' && (
          <VideoDisplay isCamOn={isCamOn} isMirrorMode={isMirrorMode} />
        )}
        {activeMode === 'insights' && <InsightsDashboard />}
        {activeMode === 'learn' && <Gamification />}
      </div>
      
      {showRewardAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce text-6xl">🌟</div>
        </div>
      )}
    </div>
  );
};

export default MainPanel;
