// Reward Engine for NeuroBridge Gamification

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  dateEarned: number | null;
};

export type UserProgress = {
  xp: number;
  streak: number;
  lastActiveDate: string;
  badges: Badge[];
  _activity?: {
    completedActivities: number;
    focusedMinutes: number;
    activityTypes: Set<string>;
    lastActivityTime: number | null;
  };
};

const BADGES: Badge[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Complete your first activity',
    icon: '🚀',
    earned: false,
    dateEarned: null,
  },
  {
    id: 'focus_10',
    name: 'Focused Mind',
    description: 'Spend 10+ minutes in focus mode',
    icon: '🎯',
    earned: false,
    dateEarned: null,
  },
  {
    id: 'streak_3',
    name: 'Streak x3',
    description: '3-day streak',
    icon: '🔥',
    earned: false,
    dateEarned: null,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Complete all 3 activity types: puzzle, story, and math',
    icon: '🌍',
    earned: false,
    dateEarned: null,
  }
];

const STORAGE_KEY = 'nb_rewards_v1';

type ActivityType = 'puzzle' | 'story' | 'math';

type UserActivity = {
  completedActivities: number;
  focusedMinutes: number;
  activityTypes: Set<ActivityType>;
  lastActivityTime: number | null;
};

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  badges: BADGES.map(badge => ({ ...badge })),
  _activity: {
    completedActivities: 0,
    focusedMinutes: 0,
    activityTypes: new Set(),
    lastActivityTime: null,
  },
};

export const initializeProgress = (): UserProgress => {
  if (typeof window === 'undefined') return defaultProgress;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProgress;
    
    const parsed = JSON.parse(saved);
    // Merge with default to ensure all badges are included
    const progress = {
      ...defaultProgress,
      ...parsed,
      badges: BADGES.map(badge => ({
        ...badge,
        ...(parsed.badges?.find((b: Badge) => b.id === badge.id) || {}),
      })),
      _activity: {
        ...defaultProgress._activity,
        ...(parsed._activity || {}),
        activityTypes: new Set(parsed._activity?.activityTypes || []),
      },
    };
    
    // Check for badges that should be awarded
    return checkForNewBadges(progress);
  } catch (error) {
    console.error('Error loading progress:', error);
    return defaultProgress;
  }
};

const checkForNewBadges = (progress: UserProgress): UserProgress => {
  const { _activity } = progress;
  const updatedProgress = { ...progress };
  
  // Check for Starter badge (first completed activity)
  if (_activity?.completedActivities > 0) {
    updatedProgress.badges = updatedProgress.badges.map(badge => 
      badge.id === 'starter' && !badge.earned 
        ? { ...badge, earned: true, dateEarned: Date.now() } 
        : badge
    );
  }
  
  // Check for Focus 10 badge
  if ((_activity?.focusedMinutes || 0) >= 10) {
    updatedProgress.badges = updatedProgress.badges.map(badge => 
      badge.id === 'focus_10' && !badge.earned 
        ? { ...badge, earned: true, dateEarned: Date.now() } 
        : badge
    );
  }
  
  // Check for Explorer badge (completed all activity types)
  if (_activity?.activityTypes instanceof Set && _activity.activityTypes.size >= 3) {
    updatedProgress.badges = updatedProgress.badges.map(badge => 
      badge.id === 'explorer' && !badge.earned 
        ? { ...badge, earned: true, dateEarned: Date.now() } 
        : badge
    );
  }
  
  // Check for Streak x3 badge
  if (progress.streak >= 3) {
    updatedProgress.badges = updatedProgress.badges.map(badge => 
      badge.id === 'streak_3' && !badge.earned 
        ? { ...badge, earned: true, dateEarned: Date.now() } 
        : badge
    );
  }
  
  return updatedProgress;
};

export const saveProgress = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export const updateStreak = (progress: UserProgress): UserProgress => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let newStreak = progress.streak;
  
  if (progress.lastActiveDate === today) {
    // Already updated today
    return progress;
  } else if (progress.lastActiveDate === yesterdayStr) {
    // Increment streak if last active was yesterday
    newStreak++;
  } else if (progress.lastActiveDate < yesterdayStr) {
    // Reset streak if more than one day has passed
    newStreak = 1;
  }
  
  // Check for streak badges
  const updatedBadges = [...progress.badges];
  if (newStreak >= 3 && !progress.badges.some(b => b.id === 'streak_3' && b.earned)) {
    const badgeIndex = updatedBadges.findIndex(b => b.id === 'streak_3');
    if (badgeIndex !== -1) {
      updatedBadges[badgeIndex] = {
        ...updatedBadges[badgeIndex],
        earned: true,
        dateEarned: Date.now(),
      };
    }
  }
  
  if (newStreak >= 7 && !progress.badges.some(b => b.id === 'streak_7' && b.earned)) {
    const badgeIndex = updatedBadges.findIndex(b => b.id === 'streak_7');
    if (badgeIndex !== -1) {
      updatedBadges[badgeIndex] = {
        ...updatedBadges[badgeIndex],
        earned: true,
        dateEarned: Date.now(),
      };
    }
  }
  
  return {
    ...progress,
    streak: newStreak,
    lastActiveDate: today,
    badges: updatedBadges,
  };
};

export const addXP = (progress: UserProgress, amount: number): UserProgress => {
  const newXP = progress.xp + amount;
  const updated = {
    ...progress,
    xp: newXP,
  };
  return checkForNewBadges(updated);
};

export const completeActivity = (
  progress: UserProgress, 
  activityType: string
): UserProgress => {
  // Update activity tracking
  const activityTypes = progress._activity?.activityTypes || new Set();
  activityTypes.add(activityType);

  const updated = {
    ...progress,
    _activity: {
      completedActivities: (progress._activity?.completedActivities || 0) + 1,
      focusedMinutes: progress._activity?.focusedMinutes || 0,
      activityTypes,
      lastActivityTime: Date.now(),
    },
  };

  // Add XP for completing an activity
  return addXP(updated, 10);
};

export const addFocusTime = (
  progress: UserProgress, 
  minutes: number
): UserProgress => {
  const currentMinutes = progress._activity?.focusedMinutes || 0;
  const updated: UserProgress = {
    ...progress,
    _activity: {
      ...progress._activity!,
      focusedMinutes: currentMinutes + minutes,
      lastActivityTime: Date.now()
    }
  };
  
  // Add XP for focused time (1 XP per 2 minutes)
  const xpEarned = Math.floor(minutes / 2);
  if (xpEarned > 0) {
    updated.xp += xpEarned;
  }
  
  return checkForNewBadges(updated);
};

export const awardBadge = (progress: UserProgress, badgeId: string): UserProgress => {
  const badgeIndex = progress.badges.findIndex(b => b.id === badgeId);
  if (badgeIndex === -1 || progress.badges[badgeIndex].earned) return progress;
  
  const updatedBadges = [...progress.badges];
  updatedBadges[badgeIndex] = {
    ...updatedBadges[badgeIndex],
    earned: true,
    dateEarned: Date.now(),
  };
  
  return {
    ...progress,
    badges: updatedBadges,
  };
};

export const getLevel = (xp: number) => {
  const level = Math.floor(Math.sqrt(xp / 100));
  const xpForCurrentLevel = Math.pow(level, 2) * 100;
  const xpForNextLevel = Math.pow(level + 1, 2) * 100;
  const xpToNext = xpForNextLevel - xp;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  
  return {
    level: level + 1, // Start at level 1
    xpToNext,
    progress: Math.min(100, Math.max(0, progress)) // Clamp between 0-100
  };
};
