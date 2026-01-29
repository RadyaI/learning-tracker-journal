'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import AuthGuard from '@/components/features/AuthGuard';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import SummaryCards from '@/components/stats/SummaryCards';
import DeepWorkChart from '@/components/stats/DeepWorkChart';
import ProductivityChart from '@/components/stats/ProductivityChart';
import FocusPieChart from '@/components/stats/FocusPieChart';

const db = getFirestore(app);
const auth = getAuth(app);

export default function StatisticsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, 'logs'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'asc')
          );

          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLogs(data);
        } catch (error) {
          console.error("Gagal ambil data stats:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">

        <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-6xl flex items-center gap-4">
            <Link
              href="/"
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-500" />
                Stats
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                Analisis & Statistik Performamu
              </p>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-4 pt-8 space-y-6">

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-zinc-900" />)}
              </div>
              <div className="h-80 rounded-3xl bg-zinc-900" />
            </div>
          ) : (
            <>

              {logs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center">
                  <p className="text-zinc-500 font-medium">Belum ada data visualisasi.</p>
                  <p className="text-xs text-zinc-600 mt-1">Mulai nulis jurnal dulu gih!</p>
                </div>
              ) : (
                <>
                  <SummaryCards logs={logs} />
                  <DeepWorkChart logs={logs} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProductivityChart logs={logs} />
                    <FocusPieChart logs={logs} />
                  </div>
                </>
              )}

              <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                DATA DIUPDATE SECARA REALTIME DARI DATABASE
              </div>
            </>
          )}

        </div>
      </main>
    </AuthGuard>
  );
}