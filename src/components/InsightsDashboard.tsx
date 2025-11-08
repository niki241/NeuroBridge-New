import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const weeklyTrendsData = [
  { day: 'Mon', calm: 60, anxious: 15, happy: 25 },
  { day: 'Tue', calm: 50, anxious: 25, happy: 25 },
  { day: 'Wed', calm: 70, anxious: 10, happy: 20 },
  { day: 'Thu', calm: 65, anxious: 15, happy: 20 },
  { day: 'Fri', calm: 75, anxious: 5, happy: 20 },
  { day: 'Sat', calm: 80, anxious: 10, happy: 10 },
  { day: 'Sun', calm: 70, anxious: 10, happy: 20 },
];

const focusTimesData = [
  { time: '9am', focus: 75 },
  { time: '11am', focus: 85 },
  { time: '1pm', focus: 60 },
  { time: '3pm', focus: 70 },
  { time: '5pm', focus: 50 },
];

const recommendedActivities = [
    { title: "Puzzles for Engagement", description: "Logical puzzles can boost focus when boredom is high.", icon: "🧩" },
    { title: "Calming Music", description: "Listen to soft, instrumental music during anxious periods.", icon: "🎵" },
    { title: "Creative Drawing", description: "A great way to express happiness and creativity.", icon: "🎨" },
]

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism rounded-md p-2 text-sm">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} style={{ color: pld.stroke || pld.fill }}>{`${pld.name}: ${pld.value}%`}</p>
          ))}
        </div>
      );
    }
    return null;
};

const InsightCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="glassmorphism rounded-xl p-4 flex flex-col transition-all duration-300 h-full border border-transparent hover:border-purple-400/50 transform hover:scale-[1.02]">
        <h3 className="text-lg font-semibold text-white mb-4 text-glow-blue">{title}</h3>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const InsightsDashboard: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-white text-glow-purple flex-shrink-0">Insights Dashboard</h2>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
                <InsightCard title="Weekly Emotional Trends">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weeklyTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Line type="monotone" dataKey="calm" stroke="#3b82f6" strokeWidth={2} name="Calm" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="anxious" stroke="#ec4899" strokeWidth={2} name="Anxious" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="happy" stroke="#84cc16" strokeWidth={2} name="Happy" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </InsightCard>
            </div>
            <div>
                 <InsightCard title="Best Focus Times">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={focusTimesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.1)'}} />
                            <Bar dataKey="focus" name="Focus Level" fill="url(#colorFocus)" barSize={30} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </InsightCard>
            </div>
            <div>
                 <InsightCard title="Recommended Activity Types">
                    <div className="flex flex-col gap-3 h-full justify-center">
                        {recommendedActivities.map(activity => (
                             <div key={activity.title} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                                <div className="text-2xl">{activity.icon}</div>
                                <div>
                                    <h4 className="font-semibold text-white">{activity.title}</h4>
                                    <p className="text-sm text-gray-300">{activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </InsightCard>
            </div>
        </div>
    </div>
  );
};

export default InsightsDashboard;