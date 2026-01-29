'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis } from 'recharts';

export default function ProductivityChart({ logs }: { logs: any[] }) {
  const hoursData = Array.from({ length: 24 }, (_, i) => ({ 
    hour: i, 
    label: `${i}:00`,
    count: 0 
  }));
  
  logs.forEach(log => {
    if (log.createdAt) {
      const date = new Date(log.createdAt.seconds * 1000);
      const h = date.getHours();
      hoursData[h].count += 1;
    }
  });

  const maxCount = Math.max(...hoursData.map(d => d.count));

  return (
    <div className="h-[350px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Productivity Clock</h3>
        <p className="text-xs text-zinc-500">Distribusi jam belajar harianmu</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={hoursData}>
          <XAxis dataKey="hour" stroke="#52525b" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={2} />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 shadow-xl">
                      <p className="text-xs font-bold text-white">{payload[0].payload.label}</p>
                      <p className="text-sm text-indigo-400">{payload[0].value} Sesi</p>
                    </div>
                  );
                }
                return null;
             }}
          />
          <Bar dataKey="count" radius={[4, 4, 4, 4]}>
            {hoursData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.count === maxCount && maxCount > 0 ? '#fbbf24' : '#3f3f46'} 
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}