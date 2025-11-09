import React, { useState, useCallback } from 'react';
import { addXP } from '../utils/rewardEngine';

interface PuzzleGameProps {
  onComplete: (xpEarned: number) => void;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onComplete }) => {
  const [topic, setTopic] = useState('');
  const [puzzle, setPuzzle] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const generatePuzzle = useCallback(async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setFeedback('');
    
    try {
      // This is a mock implementation. In a real app, you would call an AI service here.
      // For now, we'll use a simple pattern-based puzzle generator
      const puzzles = [
        `What is the capital of ${topic}?`,
        `Name a famous person from ${topic}.`,
        `What is the main language spoken in ${topic}?`,
        `When was ${topic} founded?`,
        `What is a key fact about ${topic}?`
      ];
      
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      setPuzzle(randomPuzzle);
      setUserAnswer('');
      setCompleted(false);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      setFeedback('Failed to generate puzzle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const checkAnswer = useCallback(() => {
    if (!userAnswer.trim()) return;
    
    // In a real app, you would validate the answer with an AI service
    // For now, we'll just give XP for any answer
    const xpEarned = 10;
    setFeedback('Great job! You earned 10 XP!');
    setCompleted(true);
    onComplete(xpEarned);
  }, [userAnswer, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={generatePuzzle}
          disabled={!topic.trim() || isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Puzzle'}
        </button>
      </div>

      {puzzle && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-white font-medium mb-3">Puzzle:</h3>
          <p className="text-gray-200 mb-4">{puzzle}</p>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={completed || isLoading}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            />
            <button
              onClick={checkAnswer}
              disabled={!userAnswer.trim() || completed || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="text-sm p-3 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
