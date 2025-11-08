import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EmotionDataPoint } from '../types';

interface EmotionGraphProps {
  activeEmotion: 'calm' | 'anxious' | 'happy' | 'distracted';
}

const data: EmotionDataPoint[] = [
  { time: '10:00', calm: 40, anxious: 24, happy: 10, distracted: 15 },
  { time: '10:05', calm: 30, anxious: 13, happy: 22, distracted: 25 },
  { time: '10:10', calm: 20, anxious: 48, happy: 13, distracted: 30 },
  { time: '10:15', calm: 27, anxious: 39, happy: 20, distracted: 20 },
  { time: '10:20', calm: 18, anxious: 28, happy: 38, distracted: 10 },
  { time: '10:25', calm: 23, anxious: 24, happy: 40, distracted: 5 },
  { time: '10:30', calm: 34, anxious: 14, happy: 33, distracted: 12 },
];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism rounded-md p-2 text-sm">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}%`}</p>
          ))}
        </div>
      );
    }
  
    return null;
};


const EmotionGraph: React.FC<EmotionGraphProps> = ({ activeEmotion }) => {
  return (
    <div className="w-full h-full solid-bg-2 rounded-xl p-4 flex flex-col">
       <h3 className="text-lg font-semibold text-white mb-4 text-glow-blue">Live Emotion Graph</h3>
       <div className="flex-grow">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorCalm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAnxious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
            </linearGradient>
             <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDistracted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="var(--text-muted-color)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted-color)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Area type="monotone" dataKey="calm" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCalm)" strokeWidth={activeEmotion === 'calm' ? 3 : 1.5} animationDuration={1500} />
          <Area type="monotone" dataKey="anxious" stroke="#ec4899" fillOpacity={1} fill="url(#colorAnxious)" strokeWidth={activeEmotion === 'anxious' ? 3 : 1.5} animationDuration={1500} />
          <Area type="monotone" dataKey="happy" stroke="#84cc16" fillOpacity={1} fill="url(#colorHappy)" strokeWidth={activeEmotion === 'happy' ? 3 : 1.5} animationDuration={1500} />
          <Area type="monotone" dataKey="distracted" stroke="#f97316" fillOpacity={1} fill="url(#colorDistracted)" strokeWidth={activeEmotion === 'distracted' ? 3 : 1.5} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionGraph;