import React from 'react';
import { StarIcon } from './icons';

interface GamificationProps {
    starCount: number;
}

const Gamification: React.FC<GamificationProps> = ({ starCount }) => {
    return (
        <div 
            key={starCount} // Re-trigger animation on change
            className="absolute top-2 right-2 glassmorphism rounded-full px-4 py-2 flex items-center gap-2 text-white font-semibold animate-scale-in"
            style={{ textShadow: '0 0 5px rgba(252, 211, 77, 0.7)'}}
        >
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span>{starCount}</span>
        </div>
    );
};

export default Gamification;