'use client';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';

export default function DeepWorkChart({ logs }: { logs: any[] }) {
  
  const groupedData = logs.reduce((acc: any, log) => {
    const dateKey = log.dateString; 
    if (!acc[dateKey]) {
      acc[dateKey] = {
        fullDate: dateKey,
        date: dateKey.split('-').slice(1).join('/'), 
        duration: 0,
        length: 0,
      };
    }
    acc[dateKey].duration += (log.duration || 0);
    acc[dateKey].length += (log.content?.length || 0);
    return acc;
  }, {});

  const data = Object.values(groupedData)
    .sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .slice(-7);

  return (
    <div className="h-[420px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white">Deep Work Correlation (Daily)</h3>
        <p className="text-xs text-zinc-500">Total durasi vs total karakter per hari</p>
      </div>
      
      <ResponsiveContainer width="100%" height="75%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          
          <XAxis dataKey="date" stroke="#71717a" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
          
          <YAxis 
            yAxisId="left" 
            stroke="#818cf8" 
            tick={{fontSize: 12, fill: '#818cf8'}} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}m`} 
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#34d399" 
            tick={{fontSize: 12, fill: '#34d399'}} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`} 
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
            cursor={{ fill: '#27272a', opacity: 0.4 }}
          />
          
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          
          <Bar 
            yAxisId="left" 
            dataKey="duration" 
            name="Total Durasi (Menit)" 
            fill="url(#barGradientHighlight)" 
            barSize={36} 
            radius={[8, 8, 0, 0]} 
          />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="length" 
            name="Total Karakter" 
            stroke="#34d399" 
            strokeWidth={4} 
            dot={{r: 6, fill: '#09090b', strokeWidth: 3, stroke: '#34d399'}} 
            activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}