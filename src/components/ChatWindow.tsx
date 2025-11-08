import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmotionState } from '../types';
import { SendIcon, SpeakerIcon } from './icons';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentEmotion: EmotionState;
  isTtsEnabled: boolean;
  onReplayMessage: (text: string) => void;
  isAiTyping: boolean;
  isListening: boolean;
  interimTranscript: string;
}

const AiTypingIndicator: React.FC = () => (
    <div className="flex gap-3 items-start justify-start">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
            {'🧠'}
        </div>
        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-white/10 text-gray-200 rounded-bl-none">
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '-0.3s' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '-0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
            </div>
        </div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, currentEmotion, isTtsEnabled, onReplayMessage, isAiTyping, isListening, interimTranscript }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, interimTranscript]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full solid-bg-2 rounded-xl p-4">
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            if (message.isTyping) {
              return <AiTypingIndicator key={message.id} />;
            }
            if (message.sender === 'error') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="text-xs text-red-400 bg-red-900/50 rounded-md px-3 py-1">
                    {message.text}
                  </div>
                </div>
              );
            }
            return (
              <div
                key={message.id}
                className={`flex gap-3 items-start ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                    {message.emotionEmoji || '😊'}
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl relative group ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white/10 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  {message.sender === 'ai' && isTtsEnabled && message.text && (
                    <button
                      onClick={() => onReplayMessage(message.text)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/20 hover:bg-white/30"
                      aria-label="Replay message"
                    >
                      <SpeakerIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isListening && interimTranscript && (
            <div className="flex gap-3 items-start justify-end animate-fade-in">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl rounded-br-none bg-blue-600/50 text-white/80 italic">
                    {interimTranscript}
                </div>
            </div>
           )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex-shrink-0 pt-4 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isAiTyping ? "AI is responding..." : isListening ? "Listening..." : "Type your message..."}
          disabled={isAiTyping || isListening}
          className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-70"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
          disabled={!inputText.trim() || isAiTyping || isListening}
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};
