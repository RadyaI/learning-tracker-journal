'use client';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DeepWorkChart({ logs }: { logs: any[] }) {
  const data = logs
    .slice()
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    .slice(-14) 
    .map(log => ({
      date: log.dateString.split('-').slice(1).join('/'), 
      duration: log.duration,
      length: log.content?.length || 0
    }));

  return (
    <div className="h-[400px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Deep Work Correlation</h3>
        <p className="text-xs text-zinc-500">Durasi belajar vs panjang catatan</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
          <YAxis yAxisId="left" stroke="#6366f1" tick={{fontSize: 12}} tickLine={false} axisLine={false} width={40} />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 12}} tickLine={false} axisLine={false} width={40} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
            cursor={{ fill: '#27272a', opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar yAxisId="left" dataKey="duration" name="Durasi (Menit)" fill="url(#barGradient)" barSize={30} radius={[6, 6, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="length" name="Karakter" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#09090b', strokeWidth: 2}} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}