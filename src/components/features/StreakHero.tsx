'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Flame, Medal, Loader2 } from 'lucide-react';

const db = getFirestore(app);
const auth = getAuth(app);

export default function StreakHero() {
  const [streak, setStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'logs'),
      where('userId', '==', user.uid),
      orderBy('dateString', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const totalMinutes = snapshot.docs.reduce((acc, doc) => {
        return acc + (doc.data().duration || 0);
      }, 0);

      setTotalHours(Math.floor(totalMinutes / 60));

      const uniqueDates = Array.from(new Set(snapshot.docs.map(doc => doc.data().dateString)));

      if (uniqueDates.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const lastLogDate = uniqueDates[0];

      if (lastLogDate !== today && lastLogDate !== yesterday) {
        setStreak(0);
        setLoading(false);
        return;
      }

      let currentStreak = 1;

      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const prevDate = new Date(uniqueDates[i + 1]);

        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 h-[140px]">
        <div className="animate-pulse rounded-3xl bg-zinc-900/50 border border-zinc-800" />
        <div className="animate-pulse rounded-3xl bg-zinc-900/50 border border-zinc-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">


      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-500/20 transition  flex flex-col justify-between min-h-[160px]">
        <div className="absolute -right-6 -bottom-6 opacity-20 rotate-12 animate-pulse pointer-events-none">
          <Flame size={140} />
        </div>

        <div>
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Current Streak</p>
          <h2 className="text-6xl font-black leading-none relative z-10">
            {streak}
            <span className="text-lg font-medium text-indigo-300 ml-2">Days</span>
          </h2>
        </div>

      </div>


      <div className="group cursor-pointer relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-white transition hover:border-zinc-600 hover:bg-zinc-800 flex flex-col justify-between min-h-[160px]">

        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">
            Total Fokus
          </p>
          <Medal size={20} className="text-zinc-700 group-hover:text-yellow-500 transition-colors duration-500" />
        </div>

        <div className="relative h-16 flex items-center">
          <span className="text-5xl font-black text-zinc-700 tracking-widest group-hover:hidden transition-all duration-300 select-none">
            ****
          </span>

          <h2 className="hidden group-hover:flex text-5xl font-black tracking-tighter items-baseline gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {totalHours}
            <span className="text-sm font-bold text-zinc-500">JAM</span>
          </h2>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-zinc-600 w-0 group-hover:w-full transition-all duration-1000 ease-out" />
          </div>
          <span className="text-[10px] text-zinc-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity delay-100">
            Investasi Isi Otak
          </span>
        </div>
      </div>

    </div>
  );
}