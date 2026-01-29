'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Send, Clock, Zap, X, PenTool } from 'lucide-react';
import { LogEntry } from '@/types';
import { toast } from 'react-hot-toast';

const db = getFirestore(app);
const auth = getAuth(app);

export default function LogForm({ editingLog, onCancel }: { editingLog: LogEntry | null, onCancel: () => void }) {
    const [content, setContent] = useState('');
    const [duration, setDuration] = useState(30);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingLog) {
            setContent(editingLog.content);
            setDuration(editingLog.duration);
        } else {
            setContent('');
            setDuration(30);
        }
    }, [editingLog]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const isEmergency = duration <= 5;

            if (editingLog) {
                const logRef = doc(db, 'logs', editingLog.id);
                await updateDoc(logRef, {
                    content: content,
                    duration: duration,
                    isEmergency,
                });
                toast.success("Mantap")
                onCancel();
            } else {
                const randomCat = Math.floor(Math.random() * 5) + 1;
                await addDoc(collection(db, 'logs'), {
                    userId: user.uid,
                    content: content,
                    duration: duration,
                    createdAt: serverTimestamp(),
                    dateString: new Date().toISOString().split('T')[0],
                    mood: `cat${randomCat}`,
                    isEmergency
                });
                toast.success("Yosshh")
                setContent('');
                setDuration(30);
            }

        } catch (error) {
            toast.error("Yah gagal")
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
                <label className={`text-lg font-bold flex items-center gap-2 ${editingLog ? 'text-yellow-400' : 'text-white'}`}>
                    {editingLog ? <><PenTool size={18} /> Edit Catatan</> : "Hari ini belajar apa?"}
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
                    <img src={`/images/cats/cat${Math.floor(Math.random() * 5) + 1}.png`} className="w-10 h-10 object-contain" alt="Mood" />
                )}
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis aja, apapun yang kamu pelajari hari ini..."
                className={`h-24 w-full resize-none rounded-xl border bg-zinc-950 p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-offset-0 transition-colors ${editingLog
                    ? 'border-yellow-500/50 focus:border-yellow-500 focus:ring-yellow-500'
                    : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
            />

            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {[5, 15, 30, 60, 120].map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setDuration(m)}
                        className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-4 py-2 text-xs font-bold transition ${duration === m
                            ? m <= 5
                                ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                                : editingLog
                                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                                    : 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                            }`}
                    >
                        {m <= 5 ? <Zap size={12} /> : <Clock size={12} />}
                        {m} Menit
                    </button>
                ))}
            </div>

            <button
                disabled={loading || !content}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-black transition disabled:opacity-50 ${editingLog
                    ? 'bg-yellow-400 hover:bg-yellow-500'
                    : 'bg-white hover:bg-zinc-200'
                    }`}
            >
                {loading ? 'Menyimpan...' : (
                    <>
                        {editingLog ? <PenTool size={18} /> : <Send size={18} />}
                        {editingLog ? 'Update Catatan' : 'Simpan Progres'}
                    </>
                )}
            </button>
        </form>
    );
}