'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function BackgroundMusic() {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = 0.3;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log("Autoplay ditahan browser, user harus klik manual.");
                    setIsMuted(true);
                });
            }
        }
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.play();
                setIsMuted(false);
            } else {
                audioRef.current.pause();
                setIsMuted(true);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">

            <audio
                ref={audioRef}
                loop
                src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3"
            />

            <button
                onClick={toggleMute}
                className={`group flex items-center gap-2 rounded-full border border-zinc-800 p-3 shadow-2xl transition-all hover:scale-105 active:scale-95 ${isMuted
                        ? 'bg-zinc-900 text-zinc-500'
                        : 'bg-indigo-600 text-white shadow-indigo-500/20'
                    }`}
            >
                {isMuted ? (
                    <VolumeX size={20} />
                ) : (
                    <div className="relative">
                        <Volume2 size={20} />
                        <span className="absolute -right-2 -top-2 animate-ping opacity-75">
                            <Music size={10} />
                        </span>
                    </div>
                )}

            </button>
        </div>
    );
}