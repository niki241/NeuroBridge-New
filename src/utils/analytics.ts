import { EmotionName } from '../types';

type AnalyticsData = {
  date: string;
  xpEarned: number;
  activitiesCompleted: number;
  focusTime: number; // in minutes
  moodScore: number; // 0-100 scale
  dominantEmotion: EmotionName;
};

const STORAGE_KEY = 'neurobridge_analytics_v1';

/**
 * Get analytics data for a date range (default: last 7 days)
 */
export const getAnalyticsData = (days = 7): AnalyticsData[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return [];
    
    const allData: Record<string, AnalyticsData> = JSON.parse(savedData);
    const result: AnalyticsData[] = [];
    const today = new Date();
    
    // Generate data for the last 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push(allData[dateStr] || {
        date: dateStr,
        xpEarned: 0,
        activitiesCompleted: 0,
        focusTime: 0,
        moodScore: 0,
        dominantEmotion: 'calm' as EmotionName
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return [];
  }
};

/**
 * Record daily analytics data
 */
export const recordDailyAnalytics = (data: Omit<AnalyticsData, 'date'>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const date = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(STORAGE_KEY);
    const allData = savedData ? JSON.parse(savedData) : {};
    
    allData[date] = {
      ...data,
      date,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving analytics data:', error);
  }
};

/**
 * Get weekly summary
 */
export const getWeeklySummary = () => {
  const weeklyData = getAnalyticsData(7);
  
  return {
    totalXp: weeklyData.reduce((sum, day) => sum + day.xpEarned, 0),
    totalActivities: weeklyData.reduce((sum, day) => sum + day.activitiesCompleted, 0),
    totalFocusTime: weeklyData.reduce((sum, day) => sum + day.focusTime, 0),
    averageMood: weeklyData.length > 0 
      ? weeklyData.reduce((sum, day) => sum + day.moodScore, 0) / weeklyData.length 
      : 0,
    moodTrend: calculateMoodTrend(weeklyData),
    activityTrend: calculateActivityTrend(weeklyData),
  };
};

/**
 * Calculate mood trend (improving, declining, or stable)
 */
const calculateMoodTrend = (data: AnalyticsData[]): 'improving' | 'declining' | 'stable' => {
  if (data.length < 2) return 'stable';
  
  const firstHalf = data.slice(0, Math.ceil(data.length / 2));
  const secondHalf = data.slice(Math.ceil(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, day) => sum + day.moodScore, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, day) => sum + day.moodScore, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (Math.abs(difference) < 5) return 'stable';
  return difference > 0 ? 'improving' : 'declining';
};

/**
 * Calculate activity trend (increasing, decreasing, or stable)
 */
const calculateActivityTrend = (data: AnalyticsData[]): 'increasing' | 'decreasing' | 'stable' => {
  if (data.length < 2) return 'stable';
  
  const firstHalf = data.slice(0, Math.ceil(data.length / 2));
  const secondHalf = data.slice(Math.ceil(data.length / 2));
  
  const firstTotal = firstHalf.reduce((sum, day) => sum + day.activitiesCompleted, 0);
  const secondTotal = secondHalf.reduce((sum, day) => sum + day.activitiesCompleted, 0);
  
  const firstAvg = firstTotal / firstHalf.length;
  const secondAvg = secondTotal / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (Math.abs(difference) < 0.5) return 'stable';
  return difference > 0 ? 'increasing' : 'decreasing';
};

/**
 * Get mood distribution for the week
 */
export const getMoodDistribution = (data: AnalyticsData[]) => {
  const emotionCount: Record<EmotionName, number> = {
    calm: 0,
    anxious: 0,
    happy: 0,
    distracted: 0,
    bored: 0
  };
  
  data.forEach(day => {
    if (day.dominantEmotion) {
      emotionCount[day.dominantEmotion]++;
    }
  });
  
  return Object.entries(emotionCount)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionName,
      count,
      percentage: (count / data.length) * 100 || 0
    }))
    .filter(item => item.count > 0);
};

/**
 * Get peak activity times
 */
export const getPeakActivityTimes = (): { hour: number; count: number }[] => {
  // In a real app, this would analyze timestamps of activities
  // For now, return mock data
  return Array(24).fill(0).map((_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 5) // Random count 0-4
  }));
};

/**
 * Get weekly effort data (XP earned per day)
 * @returns Array of {date, xp} objects for the last 7 days
 */
export const getWeeklyEffort = (): Array<{date: string; xp: number}> => {
  const data = getAnalyticsData(7);
  return data.map(day => ({
    date: day.date,
    xp: day.xpEarned
  }));
};

/**
 * Get weekly emotion data (mood scores per day)
 * @returns Array of {date, score} objects for the last 7 days
 *         where score is normalized to -2 (very negative) to +2 (very positive)
 */
export const getWeeklyEmotion = (): Array<{date: string; score: number}> => {
  const data = getAnalyticsData(7);
  return data.map(day => ({
    date: day.date,
    // Convert 0-100 scale to -2 to +2 scale
    score: Math.round((day.moodScore / 25) - 2)
  }));
};

/**
 * Get summary statistics
 * @returns Object containing total XP, active days, and top activity
 */
export const getSummary = (): {
  totalXP: number;
  activeDays: number;
  topActivity: string;
} => {
  const data = getAnalyticsData(30); // Last 30 days
  
  // Calculate total XP
  const totalXP = data.reduce((sum, day) => sum + day.xpEarned, 0);
  
  // Count active days (days with at least one activity)
  const activeDays = data.filter(day => day.activitiesCompleted > 0).length;
  
  // In a real app, track activity types to determine top activity
  // For now, return a mock value
  const activities = ['Puzzles', 'Stories', 'Math', 'Meditation'];
  const topActivity = activities[Math.floor(Math.random() * activities.length)];
  
  return {
    totalXP,
    activeDays,
    topActivity
  };
};
