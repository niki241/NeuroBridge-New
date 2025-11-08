import { ReactNode } from 'react';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai' | 'error';
  text: string;
  emotionEmoji?: string;
  isTyping?: boolean;
}

export interface EmotionDataPoint {
  time: string;
  calm: number;
  anxious: number;
  happy: number;
  distracted: number;
}

export type EmotionName = 'calm' | 'anxious' | 'happy' | 'distracted' | 'bored';

export interface EmotionState {
  name: EmotionName;
  emoji: string;
  tooltip: string;
  score: number;
  color: string;
  regulationPrompt: string;
}

export type AppMode = 'chat' | 'video' | 'voice' | 'api' | 'insights';

export interface TonePack {
  id: 'global' | 'usa' | 'japan' | 'india';
  name: string;
  flag: string;
  responses: { [key in EmotionName]: string };
  learningResponses: { [key in EmotionName]: string };
}
