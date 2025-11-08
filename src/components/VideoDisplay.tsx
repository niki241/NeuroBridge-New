import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon, CameraOffIcon } from './icons';
import { EmotionState } from '../types';

interface VideoDisplayProps {
    isCamOn: boolean;
    isMirrored: boolean;
    currentEmotion: EmotionState;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ isCamOn, isMirrored, currentEmotion }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied. Please enable camera permissions in your browser settings.");
      }
    };
    
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }

    if (isCamOn) {
      getCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, [isCamOn]);

  return (
    <div className="w-full h-full bg-black rounded-xl flex items-center justify-center relative">
      {!isCamOn && !error && (
         <div className="text-center text-gray-400 p-4">
            <CameraOffIcon className="w-12 h-12 mx-auto mb-2"/>
            <p>Camera is off</p>
        </div>
      )}
      {error && (
        <div className="text-center text-gray-400 p-4">
            <CameraIcon className="w-12 h-12 mx-auto mb-2"/>
            <p>{error}</p>
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ${isMirrored ? 'transform -scale-x-100' : ''} ${isCamOn && !error ? 'block' : 'hidden'}`}
      />
       {isCamOn && isMirrored && !error && (
            <div 
                key={currentEmotion.name} // Force re-render on emotion change to re-trigger animation
                className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-sm text-center animate-fade-in-up"
            >
                <p className="font-bold text-lg text-white capitalize text-glow-purple">{currentEmotion.name}</p>
                <p className="text-sm text-gray-200 mt-1">{currentEmotion.regulationPrompt}</p>
            </div>
        )}
    </div>
  );
};

export default VideoDisplay;