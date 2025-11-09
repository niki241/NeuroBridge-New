import React, { useState, useEffect, useCallback } from 'react';
import { addXP } from '../utils/rewardEngine';
import { getGeminiResponse } from '../services/gemini';
import { getChatbotResponse } from '../services/chatbot';
import { EmotionState, TonePack } from '../types';

interface QuizQuestion {
  question: string;
  answer: string;
  options: string[];
}

type ChatMessage = {
  id: number;
  sender: string;
  text: string;
  isTyping?: boolean;
};

interface QuizBotProps {
  onComplete: (xpEarned: number) => void;
  onSendMessage: (text: string) => void;
  messages: Array<{ id: number; sender: string; text: string; isTyping?: boolean }>;
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
}

const QuizBot: React.FC<QuizBotProps> = ({
  onComplete,
  onSendMessage,
  messages,
  currentQuestion,
  setCurrentQuestion,
  isQuizActive,
  setIsQuizActive
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [xpGained, setXpGained] = useState(0);

  // Questions for the quiz
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // State for questions and answers
  const [questionBank, setQuestionBank] = useState<QuizQuestion[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  // Generate quiz questions using the Gemini API
  const generateQuestions = useCallback(async (topic: string) => {
    setIsLoading(true);
    setFeedback('Creating your special quiz...');
    
    try {
      const prompt = `Create 5 very simple multiple-choice questions about ${topic} for autistic children. 
        - Use clear, simple language
        - Each question should have 3 options (a, b, c)
        - The answer should be one of those letters (a, b, or c)
        - Format as JSON array: [{"question": "...", "answer": "a", "options": ["a) ...", "b) ...", "c) ..."]}]`;
      
      // Create a complete EmotionState object
      const emotionState: EmotionState = {
        name: 'happy',
        emoji: '😊',
        tooltip: 'Feeling happy and engaged',
        score: 0.8,
        color: '#FFD700',
        regulationPrompt: 'Take a deep breath and think about what makes you happy.'
      };

      // Create a complete TonePack object
      const tonePack: TonePack = {
        id: 'global',
        name: 'Global',
        flag: '🌐',
        responses: {
          happy: 'Great!',
          calm: 'I see you\'re feeling calm.',
          anxious: 'I notice you might be feeling anxious.',
          distracted: 'You seem a bit distracted.',
          bored: 'Let\'s make this more interesting!'
        },
        learningResponses: {
          happy: 'I\'m glad you\'re enjoying learning!',
          calm: 'You\'re doing great staying focused.',
          anxious: 'Take your time, there\'s no rush.',
          distracted: 'Would you like to try a different approach?',
          bored: 'Let\'s try something more challenging!'
        }
      };

      const response = await getGeminiResponse(
        prompt,
        emotionState,
        tonePack,
        true
      );
      
      // Try to parse the response as JSON
      try {
        const jsonMatch = response.match(/```(?:json)?\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : response;
        const questions = JSON.parse(jsonString);
        
        if (Array.isArray(questions) && questions.length > 0) {
          setQuestionBank(questions);
          setCurrentOptions(questions[0]?.options || []);
          setFeedback('');
          return questions;
        }
        throw new Error('Invalid question format');
      } catch (e) {
        console.error('Failed to parse questions:', e);
        throw new Error('Could not create questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setFeedback('Using a simple quiz instead.');
      // Fallback to default questions
      const defaultQuestions = [
        {
          question: "What color is the sky on a sunny day?",
          answer: "a",
          options: ["a) Blue", "b) Red", "c) Green"]
        },
        {
          question: "Which animal says 'meow'?",
          answer: "b",
          options: ["a) Dog", "b) Cat", "c) Cow"]
        },
        {
          question: "How many legs does a dog have?",
          answer: "c",
          options: ["a) 2", "b) 6", "c) 4"]
        }
      ];
      setQuestionBank(defaultQuestions);
      setCurrentOptions(defaultQuestions[0]?.options || []);
      return defaultQuestions;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start the quiz
  const startQuiz = useCallback(async () => {
    if (!quizTopic.trim()) return;
    
    setIsLoading(true);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuizComplete(false);
    setFeedback('Preparing your quiz...');
    
    try {
      // Generate questions using the Gemini API
      const questions = await generateQuestions(quizTopic);
      setQuestions(questions.map((q: any) => q.question));
      
      if (questions.length > 0) {
        setCurrentQuestion(questions[0].question);
        setIsQuizActive(true);
        setFeedback('');
        onSendMessage(questions[0].question);
      } else {
        setFeedback('Could not generate questions. Please try a different topic.');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setFeedback('Failed to start quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [quizTopic, generateQuestions, onSendMessage]);

  // Move to the next question
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questionBank.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questionBank[nextIndex].question);
      onSendMessage(questionBank[nextIndex].question);
    } else {
      // Quiz complete
      setQuizComplete(true);
      const finalXP = Math.max(0, score * 3); // 3 XP per correct answer, minimum 0
      onComplete(finalXP);
      setFeedback(`Quiz complete! You scored ${score}/${questionBank.length}. You earned ${finalXP} XP!`);
      
      // Reset after showing results
      setTimeout(() => {
        setIsQuizActive(false);
      }, 3000);
    }
  }, [currentQuestionIndex, questionBank, score, onComplete, onSendMessage, setCurrentQuestion, setIsQuizActive]);

  // Evaluate the user's answer
  const evaluateAnswer = useCallback(async (userAnswer: string) => {
    if (!userAnswer.trim() || !currentQuestion || quizComplete) return;
    
    setIsEvaluating(true);
    setFeedback('Checking your answer...');
    
    try {
      const currentQ = questionBank.find(q => q.question === currentQuestion);
      const isCorrect = currentQ && userAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase();
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        setFeedback('✅ Great job! That\'s correct!');
      } else {
        const correctOption = currentQ?.options.find(opt => 
          opt.startsWith(currentQ.answer + ')')
        ) || 'the correct answer';
        setFeedback(`❌ Almost! The right answer is: ${correctOption}`);
      }
      
      // Move to next question after a delay
      setTimeout(() => {
        setFeedback('');
        nextQuestion();
        setIsEvaluating(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setFeedback('Let\'s try the next question!');
      setTimeout(() => {
        setFeedback('');
        nextQuestion();
        setIsEvaluating(false);
      }, 1500);
    }
  }, [currentQuestion, questionBank, quizComplete, nextQuestion]);

  // Handle message submission
  const handleMessageSubmit = useCallback((text: string) => {
    if (!isQuizActive) {
      // If quiz isn't active, just send the message normally
      onSendMessage(text);
      return;
    }
    
    // If quiz is active, evaluate the answer
    evaluateAnswer(text);
    onSendMessage(text);
    evaluateAnswer(text);
  }, [isQuizActive, onSendMessage, evaluateAnswer]);

  // Handle input change
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && isQuizActive && !quizComplete) {
      handleMessageSubmit(answer);
      setAnswer('');
    }
  };

  // Start quiz handler
  const handleStartQuiz = () => {
    if (quizTopic.trim() && !isLoading) {
      startQuiz();
    }
  };

  // Update options when question changes
  useEffect(() => {
    if (currentQuestion && questionBank.length > 0) {
      const currentQ = questionBank.find(q => q.question === currentQuestion);
      if (currentQ) {
        setCurrentOptions(currentQ.options);
      }
    }
  }, [currentQuestion, questionBank]);

  // Ensure we have a question to display
  const displayQuestion = currentQuestion || (questionBank[0]?.question || 'Loading questions...');
  const displayOptions = currentOptions.length > 0 ? currentOptions : (questionBank[0]?.options || []);

  return (
    <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <h3 className="text-lg font-medium text-white mb-4">Quiz Time! 🎯</h3>
      {!isQuizActive ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-300 mb-2">
            Ready for a fun quiz? Enter a topic you'd like to learn about, and I'll create some questions for you!
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Example: animals, colors, numbers..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && quizTopic.trim() && startQuiz()}
            />
            <button
              onClick={startQuiz}
              disabled={!quizTopic.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">↻</span>
                  <span>Creating Quiz...</span>
                </>
              ) : (
                <>
                  <span>🎮</span>
                  <span>Start Quiz</span>
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Tip: Try topics like "animals", "colors", or "shapes" for a fun quiz!
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-purple-300">
              Quiz: {quizTopic} (Question {Math.min(currentQuestionIndex + 1, questions.length)}/{questions.length || 5})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded">
                Score: {score}
              </span>
              <button
                onClick={() => {
                  setIsQuizActive(false);
                  setFeedback('');
                  setQuizComplete(false);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                End Quiz
              </button>
            </div>
          </div>
          {feedback && (
            <div className={`p-3 rounded-lg text-sm ${
              feedback.includes('✅') ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
            }`}>
              {feedback}
            </div>
          )}
          <div className="space-y-4">
            <div className="bg-white/5 p-5 rounded-lg border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-blue-400">
                  Question {currentQuestionIndex + 1} of {questionBank.length}
                </span>
                <span className="text-sm font-medium text-yellow-400">
                  Score: {score}
                </span>
              </div>
              
              <h3 className="text-xl font-medium text-white mb-6">{displayQuestion}</h3>
              
              <div className="space-y-3">
                {displayOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setAnswer(option[0])} // Set answer to the option letter
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      answer === option[0]
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-blue-400/50 hover:bg-gray-700/50'
                    }`}
                    disabled={isEvaluating || quizComplete}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (answer) {
                      handleMessageSubmit(answer);
                    }
                  }}
                  disabled={!answer || isEvaluating || quizComplete}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <span className="animate-spin">↻</span>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </div>
              
              {feedback && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  feedback.includes('✅') 
                    ? 'bg-green-900/30 text-green-200' 
                    : 'bg-red-900/30 text-red-200'
                }`}>
                  {feedback}
                </div>
              )}
            </div>
          </div>
          {quizComplete && (
            <div className="text-center py-4">
              <p className="text-green-300 mb-2">Quiz Complete!</p>
              <p className="text-sm text-gray-300">You scored {score} out of {questionBank.length}</p>
              <p className="text-xs text-gray-500 mt-2">Starting a new quiz will reset your score</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export the component as default
export default QuizBot;
