'use client';
import { BookOpen, Clock, AlignLeft, TrendingUp } from 'lucide-react';

export default function SummaryCards({ logs }: { logs: any[] }) {
  const totalLogs = logs.length;
  
  const totalDuration = logs.reduce((acc, log) => acc + (log.duration || 0), 0);
  const avgDuration = totalLogs > 0 ? Math.round(totalDuration / totalLogs) : 0;

  const totalChars = logs.reduce((acc, log) => acc + (log.content?.length || 0), 0);
  const avgChars = totalLogs > 0 ? Math.round(totalChars / totalLogs) : 0;

  const cpm = avgDuration > 0 ? Math.round(avgChars / avgDuration) : 0;

  const cards = [
    { label: 'Total Sesi', value: totalLogs, unit: 'Sesi', icon: BookOpen, color: 'text-white', border: 'border-zinc-700' },
    { label: 'Rata-rata Durasi', value: avgDuration, unit: 'Menit', icon: Clock, color: 'text-indigo-400', border: 'border-indigo-500/20' },
    { label: 'Rata-rata Karakter', value: avgChars, unit: 'Chars', icon: AlignLeft, color: 'text-emerald-400', border: 'border-emerald-500/20' },
    { label: 'Kecepatan', value: cpm, unit: 'Char/Min', icon: TrendingUp, color: 'text-orange-400', border: 'border-orange-500/20' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`relative overflow-hidden rounded-2xl border bg-zinc-900/50 p-5 ${card.border}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{card.label}</p>
              <h3 className="mt-1 text-3xl font-black tracking-tight text-white">
                {card.value} <span className="text-xs font-medium text-zinc-500">{card.unit}</span>
              </h3>
            </div>
            <div className={`rounded-xl bg-zinc-950 p-2 ${card.color}`}>
               <card.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}