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
  addFocusTime,
  Badge
} from '../utils/rewardEngine';
import { StarIcon, TrophyIcon, FireIcon, LightningBoltIcon } from './icons';

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
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = Math.min(100, Math.max(0, levelProgress));
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-yellow-400" />
          <span>Learning Progress</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full">
            Level {level}
          </span>
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{progress.xp} XP</span>
          <span>{xpToNext} to next level</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs">
            <FireIcon className="w-3.5 h-3.5" />
            <span>Current Streak</span>
          </div>
          <div className="text-white font-medium text-sm mt-0.5">
            {progress.streak} day{progress.streak !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="bg-white/5 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs">
            <LightningBoltIcon className="w-3.5 h-3.5" />
            <span>Total XP</span>
          </div>
          <div className="text-white font-medium text-sm mt-0.5">
            {progress.xp} XP
          </div>
        </div>
      </div>
      
      {/* Badges Section */}
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gray-300">Recent Badges</h4>
          {earnedBadges.length > 0 && (
            <span className="text-2xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
              {earnedBadges.length} earned
            </span>
          )}
        </div>
        
        {recentBadges.length > 0 ? (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {recentBadges.map((badge: Badge) => (
              <div 
                key={badge.id}
                className="relative group flex flex-col items-center"
                title={`${badge.name}: ${badge.description}`}
              >
                <div className="text-3xl transform transition-transform duration-300 group-hover:scale-110">
                  {badge.icon}
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-800 text-white text-2xs px-2 py-1 rounded whitespace-nowrap">
                    {badge.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">Complete activities to earn badges!</p>
          </div>
        )}
      </div>
      
      {/* New Badge Notification */}
      {newBadge && (
        <div className="mt-3 bg-green-500/20 border border-green-500/30 text-green-300 text-xs p-2 rounded-lg flex items-center justify-between">
          <span>✨ New badge earned!</span>
          <button 
            onClick={() => setNewBadge(null)}
            className="text-green-300 hover:text-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Dev Controls - Only visible in development */}
      {isDev && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleActivityComplete('puzzle')}
              className="text-xs bg-blue-600/50 hover:bg-blue-500/70 text-white py-1.5 px-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1"
            >
              <span>🧩</span>
              <span>Puzzle</span>
            </button>
            <button 
              onClick={addTestXP}
              className="text-xs bg-purple-600/50 hover:bg-purple-500/70 text-white py-1.5 px-2 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-1"
            >
              <span>⚡</span>
              <span>Add XP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsCard;
