'use client';

import { useState, useEffect, useRef } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { X, PenTool, Play, Pause, RotateCcw, Timer, Trophy } from 'lucide-react';
import { LogEntry } from '@/types';
import { toast } from 'react-hot-toast';

const db = getFirestore(app);
const auth = getAuth(app);

const getCategoryStatus = (totalSeconds: number) => {
    const minutes = Math.round(totalSeconds / 60);

    if (minutes <= 5) {
        return {
            label: 'Quick Note',
            desc: 'Sebentar Doang',
            color: 'text-zinc-400 border-zinc-600 bg-zinc-800',
            icon: '⚡'
        };
    }
    if (minutes <= 20) {
        return {
            label: 'Short Focus',
            desc: 'Sesi Pendek',
            color: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
            icon: '🧠'
        };
    }
    if (minutes <= 60) {
        return {
            label: 'Deep Learning',
            desc: 'Fokus',
            color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
            icon: '🔥'
        };
    }
    return {
        label: 'Mantap Ini Mah',
        desc: 'Grind Master',
        color: 'text-purple-400 border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
        icon: '🚀'
    };
};

export default function LogForm({ editingLog, onCancel }: { editingLog: LogEntry | null, onCancel: () => void }) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentStatus = getCategoryStatus(seconds);

    useEffect(() => {
        if (editingLog) {
            setContent(editingLog.content);
            setSeconds((editingLog.duration || 0) * 60);
            setIsActive(true);
            setIsPaused(true);
        } else {
            resetForm();
        }
    }, [editingLog]);

    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, isPaused]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
        toast.success("Start");
    };

    const handlePause = () => {
        setIsPaused(true);
        toast("Pause.");
    };

    const handleReset = () => {
        setIsActive(false);
        setIsPaused(false);
        setSeconds(0);
        toast("Reset.");
    };

    const resetForm = () => {
        setContent('');
        setSeconds(0);
        setIsActive(false);
        setIsPaused(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (seconds < 60) {
            toast.error("Minimal 1 menit lah bro! 😂");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const finalDurationMinutes = Math.round(seconds / 60);
            const finalStatus = getCategoryStatus(seconds);

            const isEmergency = finalDurationMinutes <= 5;

            if (editingLog) {
                const logRef = doc(db, 'logs', editingLog.id);
                await updateDoc(logRef, {
                    content: content,
                    duration: finalDurationMinutes,
                    isEmergency,
                    category: finalStatus.label,
                });
                toast.success("Updated");
                onCancel();
            } else {
                const randomCat = Math.floor(Math.random() * 5) + 1;
                await addDoc(collection(db, 'logs'), {
                    userId: user.uid,
                    content: content,
                    duration: finalDurationMinutes,
                    createdAt: serverTimestamp(),
                    dateString: new Date().toISOString().split('T')[0],
                    mood: `cat${randomCat}`,
                    isEmergency,
                    category: finalStatus.label,
                });
                toast.success("Mantap");
                resetForm();
            }
        } catch (error) {
            toast.error("Gagal save.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5 p-5">



            <div className="flex items-center justify-between">
                <label className={`text-lg font-bold flex items-center gap-2 ${editingLog ? 'text-yellow-400' : 'text-white'}`}>
                    {editingLog ? <><PenTool size={18} /> Edit Sesi</> : "Fokus Tracker"}
                </label>

                {editingLog ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                ) : (
                    <img src={`/images/cats/cat${Math.floor(Math.random() * 5) + 1}.png`} className="w-8 h-8 object-contain opacity-80" alt="Mood" />
                )}
            </div>

            <div className="relative group">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isActive ? "Tulis progresmu..." : "Tekan START dulu..."}
                    className={`w-full min-h-[150px] resize-y rounded-xl border bg-zinc-950 p-4 text-sm leading-relaxed text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent ${editingLog
                        ? 'border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500'
                        : isActive && !isPaused
                            ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500'
                            : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                />
            </div>


            <div className="flex flex-col items-center justify-center rounded-2xl bg-black/40 border border-zinc-800 p-6 space-y-4 shadow-inner relative overflow-hidden">


                <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${currentStatus.color.split(' ')[0].replace('text', 'bg')}`} />


                <div className={`text-5xl font-mono font-black tracking-widest tabular-nums z-10 transition-colors duration-300 ${isActive && !isPaused ? 'text-white' : 'text-zinc-500'}`}>
                    {formatTime(seconds)}
                </div>


                <div className={`z-10 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-500 ${currentStatus.color}`}>
                    <span className="text-base">{currentStatus.icon}</span>
                    {currentStatus.label}
                </div>


                <div className="flex items-center gap-3 z-10 pt-2">
                    {!isActive || isPaused ? (
                        <button
                            type="button"
                            onClick={handleStart}
                            className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-bold text-black hover:bg-emerald-400 transition hover:scale-105 active:scale-95"
                        >
                            <Play size={16} fill="currentColor" /> {isActive ? "RESUME" : "START"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePause}
                            className="flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-2 text-sm font-bold text-black hover:bg-yellow-400 transition hover:scale-105 active:scale-95"
                        >
                            <Pause size={16} fill="currentColor" /> PAUSE
                        </button>
                    )}

                    {(isActive || seconds > 0) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-red-400 transition"
                            title="Reset Timer"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>

            <button
                disabled={loading || !content || (!isActive && seconds === 0)}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-black transition disabled:opacity-50 disabled:cursor-not-allowed ${editingLog
                    ? 'bg-yellow-400 hover:bg-yellow-500'
                    : isActive && !isPaused
                        ? 'bg-emerald-400 hover:bg-emerald-500'
                        : 'bg-white hover:bg-zinc-200'
                    }`}
            >
                {loading ? 'Menyimpan...' : (
                    <>
                        {editingLog ? <PenTool size={18} /> : <Trophy size={18} />}
                        {editingLog ? 'Update' : 'Save'}
                    </>
                )}
            </button>
        </form>
    );
}