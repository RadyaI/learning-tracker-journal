'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { Loader2, LogIn } from 'lucide-react';

const auth = getAuth(app);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-zinc-950 p-4 text-center">
                <div className="relative h-40 w-40">
                    <img src="/images/cats/cat1.png" alt="Welcome Cat" className="object-contain" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter">
                    CATATAN <span className="text-indigo-500">BELAJAR</span>
                </h1>
                <p className="max-w-md text-zinc-400">
                    Belajar bang, biar jago
                </p>
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:scale-105 active:scale-95"
                >
                    <LogIn className="h-5 w-5" />
                    Login Google
                </button>
            </div>
        );
    }

    return <>{children}</>;
}