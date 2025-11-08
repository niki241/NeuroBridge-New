import React, { useEffect, useRef } from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis } from 'recharts';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const summaryData = [
  { name: 'Calm', value: 65, fill: '#3b82f6' },
  { name: 'Focused', value: 20, fill: '#84cc16' },
  { name: 'Anxious', value: 15, fill: '#ec4899' },
];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glassmorphism rounded-md p-2 text-sm">
          <p style={{ color: data.fill }}>{`${data.name}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
};

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.querySelector('button')?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-modal-title"
    >
      <div 
        ref={modalRef}
        className="glassmorphism rounded-2xl w-full max-w-lg p-8 m-4 transform transition-all duration-300 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="summary-modal-title" className="text-2xl font-bold text-white mb-2 text-glow-purple">Post-Conversation Summary</h2>
        <p className="text-gray-300 mb-6">Here is the emotional breakdown of your session.</p>

        <div className="w-full h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="100%" 
                barSize={20} 
                data={summaryData}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    dataKey="value"
                    angleAxisId={0}
                    animationDuration={1500}
                />
                 <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "14px", bottom: '10px' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-300 bg-white/10 hover:bg-white/20 text-white"
          >
            Start New Session
          </button>
          <button className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white neon-glow-purple">
            Save to Therapy Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;