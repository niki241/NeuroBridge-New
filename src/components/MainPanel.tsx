import React, { useState, useEffect } from 'react';
import VideoDisplay from './VideoDisplay';
// Fix: Import ChatWindow as a named import to resolve module loading issue.
import { ChatWindow } from './ChatWindow';
import InsightsDashboard from './InsightsDashboard';
import Gamification from './Gamification';
import { MicIcon, StarIcon } from './icons';
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
        case 'api':
            newTooltipText = 'Displaying raw data output.';
            break;
        case 'insights':
            newTooltipText = 'Viewing user insights dashboard.';
            break;
        case 'video':
        default:
            newTooltipText = currentEmotion.tooltip;
            break;
    }
    setTooltip({ text: newTooltipText, show: true });
    const timer = setTimeout(() => setTooltip(prev => ({ ...prev, show: false })), 4000);
    return () => clearTimeout(timer);
  }, [currentEmotion, activeMode, isListening]);
  
  const VoiceModeDisplay = () => (
    <div className="w-full h-full solid-bg-2 rounded-xl flex flex-col items-center justify-center text-center p-4">
        <MicIcon className={`w-24 h-24 text-purple-400 ${isListening ? 'animate-pulse' : ''}`} />
        <h2 className="text-2xl font-bold mt-4 text-white">Voice Mode Active</h2>
        <p className="text-gray-300 mt-2">{isListening ? "I'm listening..." : "Toggle the mic to speak."}</p>
    </div>
  );

  const ApiModeDisplay = () => (
    <div className="w-full h-full bg-black/50 rounded-xl flex flex-col items-start justify-start text-left p-6 font-mono text-sm overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-300 font-sans">API Mode: Data Output</h2>
        <pre className="text-lime-300 whitespace-pre-wrap w-full">
            {JSON.stringify({
                timestamp: new Date().toISOString(),
                currentEmotion: {
                    label: currentEmotion.name,
                    score: currentEmotion.score / 100,
                    confidence: 0.91
                },
                analysis: {
                    text: "I understand. Let's explore that a bit more.",
                    sentiment: "neutral",
                    vocalTone: activeMode === 'voice' || activeMode === 'video' ? "calm" : null,
                    facialExpression: activeMode === 'video' ? currentEmotion.name : null,
                },
                ui_suggestion: {
                    tooltip: currentEmotion.tooltip,
                    highlight_color: currentEmotion.color,
                }
            }, null, 2)}
        </pre>
    </div>
  );

  return (
    <div className="glassmorphism rounded-2xl p-4 h-full flex flex-col gap-4 relative">
      {showRewardAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-glow-and-fade">
                  <StarIcon 
                      className="w-24 h-24 text-yellow-300" 
                      style={{ filter: 'drop-shadow(0 0 15px rgba(252, 211, 77, 0.8))' }}
                  />
              </div>
          </div>
      )}
      {activeMode === 'insights' ? (
        <InsightsDashboard />
      ) : (
        <>
          <div className={`relative flex-grow rounded-xl overflow-hidden min-h-0 ${activeMode === 'chat' ? 'hidden' : 'flex'}`}>
            {activeMode === 'video' && <VideoDisplay isCamOn={isCamOn} isMirrored={isMirrorMode} currentEmotion={currentEmotion} />}
            {activeMode === 'voice' && <VoiceModeDisplay />}
            {activeMode === 'api' && <ApiModeDisplay />}
            <div 
              className={`absolute top-4 left-4 glassmorphism rounded-lg px-4 py-2 text-sm transition-all duration-500 ease-in-out z-10 ${tooltip.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
              {tooltip.text}
            </div>
          </div>
          <div className={`flex-shrink-0 relative ${activeMode === 'chat' ? 'h-full' : 'h-2/5'}`}>
            <ChatWindow 
                messages={messages} 
                onSendMessage={onSendMessage} 
                currentEmotion={currentEmotion}
                isTtsEnabled={isTtsEnabled}
                onReplayMessage={onReplayMessage}
                isAiTyping={isAiTyping}
                isListening={isListening}
                interimTranscript={interimTranscript}
            />
            <Gamification starCount={starCount} />
          </div>
        </>
      )}
    </div>
  );
};

export default MainPanel;
