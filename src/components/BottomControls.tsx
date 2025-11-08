import React, { useState } from 'react';
import { MicIcon, MicOffIcon, CameraIcon, CameraOffIcon, LightbulbIcon, BookOpenIcon, SpeakerIcon, ContrastIcon } from './icons';
import { AppMode } from '../types';

interface IconButtonProps {
    onClick: () => void;
    isActive?: boolean;
    activeIcon: React.ReactNode;
    inactiveIcon: React.ReactNode;
    label: string;
    disabled?: boolean;
    ariaPressed?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, isActive, activeIcon, inactiveIcon, label, disabled = false, ariaPressed }) => (
    <button 
        onClick={onClick} 
        aria-label={label}
        aria-pressed={ariaPressed}
        disabled={disabled}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 
            ${isActive ? 'bg-white/20 neon-glow-blue' : 'bg-white/10'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-110'}`
        }
    >
        {isActive ? activeIcon : inactiveIcon}
    </button>
);

interface BottomControlsProps {
    onEndConversation: () => void;
    isMicOn: boolean;
    onMicToggle: () => void;
    isCamOn: boolean;
    setIsCamOn: (value: boolean) => void;
    isMirrorMode: boolean;
    setIsMirrorMode: (value: boolean) => void;
    isLearningMode: boolean;
    setIsLearningMode: (value: boolean) => void;
    isTtsEnabled: boolean;
    setIsTtsEnabled: (value: boolean) => void;
    isHighContrast: boolean;
    setIsHighContrast: (value: boolean) => void;
    activeMode: AppMode;
}

const BottomControls: React.FC<BottomControlsProps> = ({ 
    onEndConversation,
    isMicOn, onMicToggle,
    isCamOn, setIsCamOn,
    isMirrorMode, setIsMirrorMode,
    isLearningMode, setIsLearningMode,
    isTtsEnabled, setIsTtsEnabled,
    isHighContrast, setIsHighContrast,
    activeMode
}) => {
  const [showTip, setShowTip] = useState(false);

  const handleShowTip = () => {
    setShowTip(true);
    setTimeout(() => setShowTip(false), 3000);
  };

  const isMicDisabled = activeMode !== 'video' && activeMode !== 'voice';
  const isCamDisabled = activeMode !== 'video';

  return (
    <footer className="glassmorphism rounded-2xl p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
            <IconButton 
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                isActive={isTtsEnabled}
                ariaPressed={isTtsEnabled}
                activeIcon={<SpeakerIcon className="w-6 h-6 text-white"/>}
                inactiveIcon={<SpeakerIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle Text-to-Speech"
            />
             <IconButton 
                onClick={() => setIsHighContrast(!isHighContrast)}
                isActive={isHighContrast}
                ariaPressed={isHighContrast}
                activeIcon={<ContrastIcon className="w-6 h-6 text-white"/>}
                inactiveIcon={<ContrastIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle High Contrast Mode"
            />
        </div>

        <div className="flex items-center gap-4">
            <IconButton 
                onClick={onMicToggle}
                isActive={isMicOn}
                ariaPressed={isMicOn}
                activeIcon={<MicIcon className="w-6 h-6 text-white"/>}
                inactiveIcon={<MicOffIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle Microphone"
                disabled={isMicDisabled}
            />
            <IconButton 
                onClick={() => setIsCamOn(!isCamOn)}
                isActive={isCamOn}
                ariaPressed={isCamOn}
                activeIcon={<CameraIcon className="w-6 h-6 text-white"/>}
                inactiveIcon={<CameraOffIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle Camera"
                disabled={isCamDisabled}
            />
             <IconButton 
                onClick={() => setIsMirrorMode(!isMirrorMode)}
                isActive={isMirrorMode}
                ariaPressed={isMirrorMode}
                activeIcon={<LightbulbIcon className="w-6 h-6 text-yellow-300"/>}
                inactiveIcon={<LightbulbIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle Mirror Mode"
            />
            <IconButton 
                onClick={() => setIsLearningMode(!isLearningMode)}
                isActive={isLearningMode}
                ariaPressed={isLearningMode}
                activeIcon={<BookOpenIcon className="w-6 h-6 text-yellow-300"/>}
                inactiveIcon={<BookOpenIcon className="w-6 h-6 text-gray-400"/>}
                label="Toggle Learning Mode"
            />
        </div>

       <div className="flex items-center gap-4">
            <button
                onClick={onEndConversation} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/30">
                End Session
            </button>
       </div>

       {showTip && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 glassmorphism p-3 rounded-lg text-center text-sm animate-fade-in-up">
                Tip: When you feel anxious, try focusing on your breath for 60 seconds.
            </div>
        )}
    </footer>
  );
};

export default BottomControls;
