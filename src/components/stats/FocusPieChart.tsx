'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const LEVEL_COLORS: Record<string, string> = {
  'Quick Note': '#52525b',  
  'Short Focus': '#3b82f6', 
  'Deep Learning': '#10b981',   
  'Mantap Ini Mah': '#a855f7',    
};

export default function FocusPieChart({ logs }: { logs: any[] }) {
  
  const dataMap = logs.reduce((acc: Record<string, number>, log) => {
    let category = log.category;

    if (!category) {
      if ((log.duration || 0) <= 5) category = 'Quick Note';
      else if ((log.duration || 0) <= 20) category = 'Short Focus';
      else if ((log.duration || 0) <= 60) category = 'Deep Learning';
      else category = 'Mantap Ini Mah';
    }

    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
    color: LEVEL_COLORS[key] || '#71717a' 
  }));

  if (logs.length === 0) {
    return (
       <div className="flex h-[350px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-500">
          Belum ada data cukup.
       </div>
    )
  }

  return (
    <div className="h-[350px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Focus Quality Tiers</h3>
        <p className="text-xs text-zinc-500">Distribusi level fokus sesi belajarmu</p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60} 
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                className="stroke-zinc-900 stroke-2"
              />
            ))}
          </Pie>
          
          <Tooltip
             contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
             itemStyle={{ color: '#fff', fontSize: '12px' }}
             formatter={(value: any) => [`${value} Sesi`, 'Jumlah']}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-zinc-400 ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}