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

       
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-5 text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02] duration-300">
        <div className="absolute -right-4 -top-4 opacity-20 rotate-12 animate-pulse">
          <Flame size={80} />
        </div>
        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Streak</p>
        <h2 className="text-4xl font-black tracking-tighter">{streak}</h2>
        <p className="text-xs font-medium text-indigo-100">Hari Berturut</p>
      </div>

       
      <div className="group cursor-pointer relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-5 text-white transition hover:border-zinc-700 hover:bg-zinc-800/50">
        
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
          Total Fokus
        </p>

        <h2 className="text-4xl font-black tracking-tighter flex items-baseline gap-1">
          <span className="hidden group-hover:inline transition-all duration-300">
            {totalHours}
          </span>
          <span className="group-hover:hidden transition-all duration-300">
            {totalHours}
          </span>
          <span className="text-sm font-medium text-zinc-500">JAM</span>
        </h2>

        <div className="mt-2 flex items-center gap-1 rounded-full bg-zinc-800/80 w-fit px-2 py-1 border border-zinc-700/50">
          <Medal size={12} className="text-yellow-500" />
          <span className="text-[10px] text-zinc-400 font-bold">
            Investasi Leher ke Atas
          </span>
        </div>
      </div>

    </div>
  );
}