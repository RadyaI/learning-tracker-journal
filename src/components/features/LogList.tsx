'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit as fireLimit, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Clock, Zap, Trash2, Calendar, Edit2, Search } from 'lucide-react';
import { LogEntry } from '@/types';
import swal from 'sweetalert';
import toast from 'react-hot-toast';

const db = getFirestore(app);
const auth = getAuth(app);

export default function LogList({ limit, isGrid = false, onEdit }: { limit?: number, isGrid?: boolean, onEdit?: (log: LogEntry) => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let q = query(
      collection(db, 'logs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    if (limit) {
      q = query(q, fireLimit(limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LogEntry[];
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limit]);

  const handleDelete = async (id: string) => {
    const confirm: boolean = await swal({
      title: "Yakin mau dihapus?",
      icon: "warning",
      buttons: ["Tidak", "Iya Hapus aja"],
      dangerMode: true
    })

    if (confirm) {
      await deleteDoc(doc(db, 'logs', id));
      toast.success("byee...")
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return 'Barusan';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredLogs = logs.filter(log =>
    log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`grid gap-4 ${isGrid ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-zinc-900" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center">
        <img src="/images/cats/cat4.png" className="w-25 h-25 mb-4" alt="Empty" />
        <p className="text-zinc-500 font-medium">Belum ada jejak hari ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!limit && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Cari catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      )}

      <div className={`${isGrid ? 'columns-1 md:columns-2 gap-4 space-y-4' : 'space-y-3'}`}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="break-inside-avoid group relative flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:bg-zinc-900 hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-full overflow-hidden shadow-sm border ${log.isEmergency ? 'border-orange-500/30 bg-orange-500/10' : 'border-indigo-500/30 bg-indigo-500/10'}`}>
                    <img
                      src={`/images/cats/${log.mood || 'cat1'}.png`}
                      className="h-full w-full object-cover"
                      alt="mood"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {(log as any).dateString} • {formatTime(log.createdAt)}
                    </span>
                    <span className={`text-xs font-bold ${log.isEmergency ? 'text-orange-400' : 'text-indigo-400'}`}>
                      {log.isEmergency ? 'Emergency Mode' : 'Normal Session'}
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold border ${log.isEmergency
                    ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                    : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                  }`}>
                  {log.isEmergency ? <Zap size={10} /> : <Clock size={10} />}
                  {log.duration}m
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed font-light whitespace-pre-wrap break-words">
                {log.content}
              </p>

              <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                {onEdit && (
                  <button
                    onClick={() => onEdit(log)}
                    className="bg-zinc-900/80 text-zinc-400 hover:text-yellow-400 p-1.5 rounded-lg backdrop-blur-sm border border-zinc-800 transition hover:bg-zinc-800"
                    title="Edit Catatan"
                  >
                    <Edit2 size={14} />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(log.id)}
                  className="bg-zinc-900/80 text-zinc-400 hover:text-red-500 p-1.5 rounded-lg backdrop-blur-sm border border-zinc-800 transition hover:bg-zinc-800"
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-zinc-500">
            <p>Gak nemu catatan yang dicari, Bro.</p>
          </div>
        )}
      </div>
    </div>
  );
}