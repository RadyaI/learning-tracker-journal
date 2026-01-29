'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Flame, Trophy, Hourglass, Medal } from 'lucide-react';

const db = getFirestore(app);
const auth = getAuth(app);

export default function StreakHero() {
  const [streak, setStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'logs'),
        where('userId', '==', user.uid),
        orderBy('dateString', 'desc')
      );

      const snapshot = await getDocs(q);
      
      let totalMinutes = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalMinutes += data.duration || 0;
      });
      setTotalHours(Math.floor(totalMinutes / 60));

      const uniqueDates = Array.from(new Set(snapshot.docs.map(doc => doc.data().dateString)));

      if (uniqueDates.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        setStreak(0);
        setLoading(false);
        return;
      }

      let currentStreak = 1;
      let checkDate = new Date(uniqueDates[0]);

      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDate = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates[i] === expectedDate) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
      setLoading(false);
    };

    calculateStats();
  }, []);

  if (loading) return <div className="h-40 animate-pulse rounded-3xl bg-zinc-900" />;

  return (
    <div className="grid grid-cols-2 gap-3">
        
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-5 text-white shadow-lg shadow-indigo-500/20">
        <div className="absolute -right-4 -top-4 opacity-20 rotate-12">
           <Flame size={80} />
        </div>
        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Streak</p>
        <h2 className="text-4xl font-black tracking-tighter">{streak}</h2>
        <p className="text-xs font-medium text-indigo-100">Hari</p>
      </div>

        
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-5 text-white">
        <div className="absolute -right-4 -top-4 opacity-10 rotate-12 text-emerald-500">
           <Hourglass size={80} />
        </div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Jam</p>
        <h2 className="text-4xl font-black tracking-tighter flex items-baseline gap-1">
          {totalHours}<span className="text-sm font-medium text-zinc-500">JAM</span>
        </h2>
        <div className="mt-2 flex items-center gap-1 rounded-full bg-zinc-800 w-fit px-2 py-0.5">
           <Medal size={10} className="text-yellow-500" />
           <span className="text-[10px] text-zinc-400">Investasi Isi Otak</span>
        </div>
      </div>
    </div>
  );
}