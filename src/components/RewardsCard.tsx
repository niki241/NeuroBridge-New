import React, { useEffect, useState, useCallback } from 'react';
import { 
  initializeProgress, 
  updateStreak, 
  saveProgress, 
  getLevel, 
  awardBadge, 
  UserProgress, 
  addXP, 
  completeActivity, 
  addFocusTime 
} from '../utils/rewardEngine';
import { StarIcon } from './icons';

const RewardsCard: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(initializeProgress());
  const [showBadges, setShowBadges] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  
  // Initialize and update streak on component mount
  useEffect(() => {
    const updated = updateStreak(progress);
    if (updated.streak !== progress.streak || updated.lastActiveDate !== progress.lastActiveDate) {
      const savedProgress = { ...updated };
      setProgress(savedProgress);
      saveProgress(savedProgress);
    }
  }, []);
  
  // Handle activity completion
  const handleActivityComplete = useCallback((activityType: 'puzzle' | 'story' | 'math') => {
    const updated = completeActivity(progress, activityType);
    setProgress(updated);
    saveProgress(updated);
    
    // Show badge notification if earned
    const newBadgeId = updated.badges.find(
      b => b.earned && !progress.badges.some(pb => pb.id === b.id && pb.earned)
    )?.id;
    
    if (newBadgeId) {
      setNewBadge(newBadgeId);
      setTimeout(() => setNewBadge(null), 3000);
    }
  }, [progress]);
  
  // Dev-only: Add test XP
  const addTestXP = useCallback(() => {
    const updated = addXP(progress, 10);
    setProgress(updated);
    saveProgress(updated);
  }, [progress]);
  
  const { level, xpToNext, progress: levelProgress } = getLevel(progress.xp);
  const earnedBadges = progress.badges.filter(badge => badge.earned);
  const recentBadges = earnedBadges.slice(-5); // Show max 5 most recent badges
  const hasNewBadges = earnedBadges.some(badge => 
    badge.dateEarned && Date.now() - badge.dateEarned < 24 * 60 * 60 * 1000
  );
  
  // Check if in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <div className="glassmorphism rounded-2xl p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-white flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <span>Progress</span>
        </h3>
        <span className="text-xs text-purple-300">Lv. {level}</span>
      </div>
      
      {/* XP Bar */}
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${levelProgress}%` }}
        ></div>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-300">{progress.xp} XP</div>
        <div className="text-gray-400">
          <span className="text-yellow-400">🔥 {progress.streak}</span> day{progress.streak !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Badges Row */}
      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {recentBadges.map((badge) => (
          <div 
            key={badge.id}
            className="relative group"
            title={`${badge.name}: ${badge.description}`}
          >
            <div className="text-2xl">
              {badge.icon}
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {badge.name}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          </div>
        ))}
        {earnedBadges.length === 0 && (
          <span className="text-xs text-gray-400">Complete activities to earn badges</span>
        )}
      </div>
      
      {/* Dev-only XP Button */}
      {isDev && (
        <button 
          onClick={addTestXP}
          className="mt-2 w-full text-xs bg-purple-900/50 hover:bg-purple-800/50 text-purple-200 py-1 px-2 rounded transition-colors"
        >
          +10 XP (Dev)
        </button>
      )}
      
      {/* New badge notification */}
      {newBadge && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-bounce text-sm">
          <StarIcon className="w-4 h-4" />
          <span>New badge!</span>
        </div>
      )}
    </div>
  );
};

export default RewardsCard;
