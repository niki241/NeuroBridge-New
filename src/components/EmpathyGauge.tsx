import React, { useState, useEffect } from 'react';

interface EmpathyGaugeProps {
  value: number;
}

const EmpathyGauge: React.FC<EmpathyGaugeProps> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate the number counting up/down
    const frameDuration = 1000 / 60; // 60fps
    const totalDuration = 1000; // 1 second animation
    const totalFrames = totalDuration / frameDuration;
    const valueIncrement = (value - displayValue) / totalFrames;

    let currentFrame = 0;
    const animate = () => {
      if (currentFrame < totalFrames) {
        setDisplayValue(prev => prev + valueIncrement);
        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [value]);

  const circumference = 2 * Math.PI * 45; // 2 * pi * r
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="text-center p-4 solid-bg-2 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-2 text-glow-blue">Empathy Index</h3>
      <div className="relative inline-block">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="var(--solid-bg-1)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Foreground circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#empathyGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            transform="rotate(-90 50 50)"
          />
          <defs>
            <linearGradient id="empathyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white">
          {Math.round(displayValue)}
        </span>
      </div>
    </div>
  );
};

export default EmpathyGauge;