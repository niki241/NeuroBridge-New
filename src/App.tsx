
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import MainPanel from './components/MainPanel';
import SidePanel from './components/SidePanel';
import BottomControls from './components/BottomControls';
import SummaryModal from './components/SummaryModal';
import { EmotionState, AppMode, ChatMessage, TonePack } from './types';
import { getGeminiResponse } from './services/gemini';

const emotionCycle: EmotionState[] = [
  { name: 'calm', emoji: '😊', tooltip: 'User seems calm and focused.', score: 82, color: '#3b82f6', regulationPrompt: 'Maintain this calm state. Notice your steady breath.' },
  { name: 'happy', emoji: '😄', tooltip: 'High levels of happiness detected!', score: 95, color: '#84cc16', regulationPrompt: 'Embrace this feeling. Let your smile reach your eyes.' },
  { name: 'anxious', emoji: '😟', tooltip: 'User seems slightly stressed — maybe slow down.', score: 45, color: '#ec4899', regulationPrompt: 'Try relaxing your shoulders and taking a slow, deep breath.' },
  { name: 'distracted', emoji: '🤔', tooltip: 'User may be distracted. Try re-engaging.', score: 60, color: '#f97316', regulationPrompt: 'Gently bring your focus back to the present moment.' },
  { name: 'bored', emoji: '😑', tooltip: 'User seems bored. A new challenge might help!', score: 55, color: '#6366f1', regulationPrompt: 'Let\'s find something more engaging to do.' },
];

const tonePacks: TonePack[] = [
    {
        id: 'global', name: 'Global (Default)', flag: '🌍',
        responses: {
            calm: "It's great that you're feeling calm. What's on your mind?",
            happy: "I can sense the happiness in your message! What's making you smile?",
            anxious: "It sounds like you might be a bit anxious. Remember to breathe. We can talk through it.",
            distracted: "It seems like your focus might be elsewhere. Is everything alright?",
            bored: "Feeling a bit bored? We can talk about something new and exciting if you'd like."
        },
        learningResponses: {
            calm: "You seem calm and focused, which is fantastic for learning! Let's tackle our next topic.",
            happy: "It's wonderful that you're happy! Let's channel that positive energy into a fun quiz.",
            anxious: "I notice you might be feeling a bit stressed. Let's take a short break and look at some calming images.",
            distracted: "It seems like your focus is drifting. How about a quick, fun logic puzzle to re-energize your mind?",
            bored: "I sense some boredom. Let's make things more exciting with a creative challenge!"
        }
    },
    {
        id: 'usa', name: 'USA', flag: '🇺🇸',
        responses: {
            calm: "Awesome that you're feeling calm. What's up?",
            happy: "Great to hear you're happy! Keep that positive vibe going. What's the good news?",
            anxious: "Hey, it looks like you might be a bit stressed. Let's tackle this. Take a deep breath.",
            distracted: "Seems like you're a bit distracted. Need a minute to refocus?",
            bored: "Feeling bored? Let's switch it up and find something more engaging to do."
        },
        learningResponses: {
            calm: "You're in the zone! Perfect time to dive into the next lesson. Ready?",
            happy: "Love the enthusiasm! Let's use that energy to knock out this next learning module.",
            anxious: "No worries if you're feeling anxious. How about a quick, calming video before we continue?",
            distracted: "Let's get back on track. A quick 1-minute puzzle should help sharpen your focus!",
            bored: "Boredom alert! Time for a pop quiz with a fun twist to make this interesting."
        }
    },
    {
        id: 'japan', name: 'Japan', flag: '🇯🇵',
        responses: {
            calm: "Your calm heart is admirable. Please, feel free to share what you are thinking.",
            happy: "It is a pleasure to see you are happy. May this pleasant feeling continue.",
            anxious: "It appears there may be some worry. It is alright. Please breathe slowly.",
            distracted: "Perhaps your attention has shifted. Would you like a moment of quiet?",
            bored: "It seems you may be feeling unengaged. Shall we try a different kind of activity?"
        },
        learningResponses: {
            calm: "With such a calm spirit, learning becomes very effective. Let us proceed with the next topic.",
            happy: "A happy heart is a wonderful companion for learning. Let us enjoy this study time together.",
            anxious: "If you are feeling anxious, that is understandable. Let us pause for a moment of peace before we continue.",
            distracted: "Let us gently guide our focus back. A simple, mindful task might be helpful.",
            bored: "To address this feeling of boredom, perhaps a beautiful and interesting story would be better."
        }
    },
     {
        id: 'india', name: 'India', flag: '🇮🇳',
        responses: {
            calm: "It is very good you are feeling calm. Please tell me, what is on your mind?",
            happy: "What a joyous feeling! I am happy to know you are feeling this way. What is the reason for this happiness?",
            anxious: "It seems there is some tension. No need to worry, we are here together. Let's just take a gentle breath.",
            distracted: "Is your mind wandering a little? That can happen. Shall we try to focus again?",
            bored: "Are you feeling a bit bored? Come, let's find a topic that is more lively and interesting for you."
        },
        learningResponses: {
            calm: "Your mind is calm, like a still lake. This is the best time for learning. Shall we begin the next chapter?",
            happy: "Excellent, you are happy! Learning will be a joy now. Let's try a fun new puzzle together.",
            anxious: "There is no need for stress. Learning should be a peaceful journey. Let's listen to some calming music for a moment.",
            distracted: "Let's bring our attention back. A quick, interesting fact might help us refocus our energy.",
            bored: "This is not very exciting, is it? Let's switch to a colorful story or a creative task. That will be more fun!"
        }
    }
];

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>(emotionCycle[0]);
  const [activeMode, setActiveMode] = useState<AppMode>('video');
  const [isListening, setIsListening] = useState(false);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMirrorMode, setIsMirrorMode] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: "Hello! I'm NeuroBridge. How are you feeling today?", emotionEmoji: '😊' },
  ]);
  const [currentTonePack, setCurrentTonePack] = useState<TonePack>(tonePacks[0]);
  const [starCount, setStarCount] = useState(0);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  // Apply high contrast class to body
  useEffect(() => {
    document.body.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  // Simulate real-time emotion changes
  useEffect(() => {
    let emotionIndex = 0;
    const interval = setInterval(() => {
      emotionIndex = (emotionIndex + 1) % emotionCycle.length;
      setCurrentEmotion(emotionCycle[emotionIndex]);
    }, 5000); // Change emotion every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Logic to turn off cam when switching away from video mode
  useEffect(() => {
    if (activeMode !== 'video') {
      setIsCamOn(false);
    } else {
      setIsCamOn(true);
    }
  }, [activeMode]);
  
  const speakMessage = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleVoiceInput = useCallback(async (transcript: string) => {
    const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text: transcript };
    setMessages(prev => [...prev, newUserMessage]);

    // In a real scenario, you'd analyze the voice for emotion. Here we simulate it.
    const randomEmotionIndex = Math.floor(Math.random() * emotionCycle.length);
    const detectedEmotion = emotionCycle[randomEmotionIndex];
    setCurrentEmotion(detectedEmotion);

    await processUserMessage(transcript, detectedEmotion);
  }, [currentEmotion, currentTonePack, isLearningMode, isTtsEnabled, speakMessage]);

  // Setup Speech Recognition
  useEffect(() => {
      // Fix: Cast window to `any` to access non-standard SpeechRecognition properties, resolving TypeScript errors.
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          console.warn("Speech recognition not supported in this browser.");
          return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
      };
      recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
      };

      recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  finalTranscript += event.results[i][0].transcript;
              } else {
                  interim += event.results[i][0].transcript;
              }
          }
          setInterimTranscript(interim);
          if (finalTranscript.trim()) {
              handleVoiceInput(finalTranscript.trim());
          }
      };

      recognitionRef.current = recognition;

      return () => {
          recognition.stop();
      };
  }, [handleVoiceInput]);

  const toggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          recognitionRef.current.start();
      }
  };
  
  const handleReward = (emotion: EmotionState) => {
     if (emotion.name === 'calm' || emotion.name === 'happy') {
        setStarCount(prev => prev + 1);
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 1500);
    }
  }

  const processUserMessage = async (text: string, emotion: EmotionState) => {
    setIsAiTyping(true);
    const typingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingMessageId, sender: 'ai', text: '', isTyping: true }]);

    try {
        const aiText = await getGeminiResponse(text, emotion, currentTonePack, isLearningMode);
        handleReward(emotion);
        const newAiMessage: ChatMessage = { 
            id: Date.now() + 2, 
            sender: 'ai', 
            text: aiText,
            emotionEmoji: emotion.emoji 
        };
        
        setMessages(prev => prev.filter(m => m.id !== typingMessageId)); // Remove typing indicator
        setMessages(prev => [...prev, newAiMessage]);

        if (isTtsEnabled) {
            speakMessage(aiText);
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        const errorMessage: ChatMessage = {
            id: Date.now() + 2,
            sender: 'error',
            text: "Sorry, I'm having trouble connecting. Please check the API key and try again."
        };
        setMessages(prev => prev.filter(m => m.id !== typingMessageId));
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsAiTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, newUserMessage]);
    await processUserMessage(text, currentEmotion);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{backgroundImage: "url('https://picsum.photos/seed/neuro/1920/1080')"}}>
      <div className="min-h-screen bg-black/50 backdrop-blur-sm flex flex-col p-4 gap-4 overflow-hidden">
        <TopBar 
            tonePacks={tonePacks}
            currentTonePack={currentTonePack}
            onTonePackChange={setCurrentTonePack}
        />
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
          <div className="lg:col-span-2 h-full">
            <MainPanel 
              currentEmotion={currentEmotion}
              activeMode={activeMode}
              isCamOn={isCamOn}
              isMirrorMode={isMirrorMode}
              messages={messages}
              onSendMessage={handleSendMessage}
              starCount={starCount}
              showRewardAnimation={showRewardAnimation}
              isTtsEnabled={isTtsEnabled}
              onReplayMessage={speakMessage}
              isAiTyping={isAiTyping}
              isListening={isListening}
              interimTranscript={interimTranscript}
            />
          </div>
          <div className="lg:col-span-1 h-full">
            <SidePanel 
              currentEmotion={currentEmotion} 
              activeMode={activeMode}
              setActiveMode={setActiveMode}
            />
          </div>
        </main>
        <BottomControls 
            onEndConversation={() => setIsModalOpen(true)}
            isMicOn={isListening}
            onMicToggle={toggleListening}
            isCamOn={isCamOn}
            setIsCamOn={setIsCamOn}
            isMirrorMode={isMirrorMode}
            setIsMirrorMode={setIsMirrorMode}
            isLearningMode={isLearningMode}
            setIsLearningMode={setIsLearningMode}
            isTtsEnabled={isTtsEnabled}
            setIsTtsEnabled={setIsTtsEnabled}
            isHighContrast={isHighContrast}
            setIsHighContrast={setIsHighContrast}
            activeMode={activeMode}
        />
        <SummaryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default App;
