'use client';

import { useState } from 'react';
import AuthGuard from '@/components/features/AuthGuard';
import LogForm from '@/components/features/LogForm';
import LogList from '@/components/features/LogList';
import StreakHero from '@/components/features/StreakHero';
import ExportData from '@/components/features/ExportData';
import { LogOut, Link2, ChartArea } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { LogEntry } from '@/types';

export default function Home() {
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);

  return (
    <AuthGuard>

      <main className="flex flex-col bg-zinc-950 text-zinc-100 min-h-screen lg:h-screen lg:overflow-hidden">

        <nav className="shrink-0 border-b border-zinc-800/50 bg-zinc-950/80 p-4 backdrop-blur-md z-50">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <img src="/images/cats/cat2.png" alt="Logo" className="object-cover" />
              </div>
              <div>
                <h1 className="font-black tracking-tighter text-lg leading-none">DailyGrind</h1>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Personal Growth</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/resources" className="hidden md:flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
                <Link2 size={16} />
                Link Saver
              </Link>
              <Link href="/stats" className="hidden md:flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
                <ChartArea size={16} />
                Stats
              </Link>
              <button
                onClick={() => getAuth(app).signOut()}
                className="rounded-lg p-2 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="flex-1 lg:overflow-hidden">
          <div className="mx-auto max-w-7xl h-full px-4 lg:pt-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:h-full">

              <div className="space-y-6 lg:col-span-5 xl:col-span-4 lg:h-full lg:overflow-y-auto lg:pr-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-10 pt-6 lg:pt-0">

                <StreakHero />

                <div id="log-form" className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 shadow-2xl transition-all duration-300">
                  <div className={`absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-3xl transition-colors ${editingLog ? 'bg-yellow-500/20' : 'bg-indigo-500/20'}`}></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl"></div>

                  <LogForm
                    editingLog={editingLog}
                    onCancel={() => setEditingLog(null)}
                  />
                </div>

                <ExportData />

                <div className="lg:hidden text-center pt-4 pb-8">
                  <Link href="/resources" className="text-sm font-bold text-zinc-500 underline underline-offset-4">
                    Link Saver
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 xl:col-span-8 lg:h-full lg:overflow-y-auto lg:pb-20 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="mb-6 flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur z-40 py-4 border-b border-zinc-900 lg:border-none">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    Life Logging
                    <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">All Time</span>
                  </h2>
                </div>

                <div className="pb-20">
                  <LogList
                    isGrid={true}
                    onEdit={(log) => {
                      setEditingLog(log);
                      document.getElementById('log-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}