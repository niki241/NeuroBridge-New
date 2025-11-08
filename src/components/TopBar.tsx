import React, { useState, useEffect, useRef } from 'react';
import { BrainIcon, ChevronDownIcon } from './icons';
import { TonePack } from '../types';

interface TopBarProps {
    tonePacks: TonePack[];
    currentTonePack: TonePack;
    onTonePackChange: (pack: TonePack) => void;
}

const TopBar: React.FC<TopBarProps> = ({ tonePacks, currentTonePack, onTonePackChange }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsDropdownOpen(false);
            buttonRef.current?.focus();
        }
    };

    if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSelectPack = (pack: TonePack) => {
    onTonePackChange(pack);
    setIsDropdownOpen(false);
    buttonRef.current?.focus();
  };
  
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLUListElement>) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        (dropdownRef.current?.querySelector('li:first-child button') as HTMLElement)?.focus();
    }
  };
  
  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % tonePacks.length;
        (dropdownRef.current?.querySelectorAll('li button')[nextIndex] as HTMLElement)?.focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + tonePacks.length) % tonePacks.length;
        (dropdownRef.current?.querySelectorAll('li button')[prevIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <header className="glassmorphism rounded-2xl p-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow-blue">
            <BrainIcon className="w-6 h-6 text-white"/>
        </div>
        <h1 className="text-2xl font-bold text-white text-glow-purple">NeuroBridge</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            ref={buttonRef}
            id="tone-pack-button"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={handleDropdownKeyDown}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-300 glassmorphism px-4 py-2 rounded-lg w-40 justify-between"
          >
            <span className="flex items-center gap-2">
                <span>{currentTonePack.flag}</span>
                <span>{currentTonePack.name}</span>
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`absolute top-full right-0 mt-2 w-48 glassmorphism rounded-lg shadow-lg overflow-hidden z-20 transition-all duration-300 ease-in-out ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
             <ul role="menu" aria-orientation="vertical" aria-labelledby="tone-pack-button" onKeyDown={handleDropdownKeyDown}>
                {tonePacks.map((pack, index) => (
                    <li key={pack.id} role="presentation">
                        <button 
                            onClick={() => handleSelectPack(pack)}
                            onKeyDown={(e) => handleItemKeyDown(e, index)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 focus:bg-white/20 transition-colors duration-200 flex items-center gap-2"
                            role="menuitem"
                        >
                           <span>{pack.flag}</span> 
                           <span>{pack.name}</span>
                        </button>
                    </li>
                ))}
             </ul>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isOnline ? 'bg-blue-400 animate-pulse neon-glow-blue' : 'bg-gray-500'}`}></div>
          <span className={`text-sm font-medium ${isOnline ? 'text-blue-300' : 'text-gray-400'}`}>{isOnline ? 'AI Connected' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;