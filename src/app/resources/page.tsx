'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import AuthGuard from '@/components/features/AuthGuard';
import { ArrowLeft, Link2, Plus, Trash2, ExternalLink, Youtube, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const db = getFirestore(app);
const auth = getAuth(app);

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'tool';
  createdAt: any;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'video' | 'article' | 'tool'>('article');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'resources'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Resource[];
      setResources(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title && !url) {
      toast.error("Title sama URL diisi dulu")
      return
    } else if (!title) {
      toast.error("Title diisi dulu")
      return
    } else if (!url) {
      toast.error("URL diisi dulu")
      return
    }
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'resources'), {
        userId: user.uid,
        title,
        url,
        type,
        createdAt: serverTimestamp()
      });

      setTitle('');
      setUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    let confirm: boolean = await swal({
      title: "Mau dihapus?",
      icon: "warning",
      buttons: ["Engga", "Iya"],
      dangerMode: true
    })
    if (confirm) {
      await deleteDoc(doc(db, 'resources', id));
      toast.success("Berhasil dihapus")
    }
  };

  const getIcon = (t: string) => {
    if (t === 'video') return <Youtube size={16} />;
    if (t === 'tool') return <PenTool size={16} />;
    return <BookOpen size={16} />;
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
        <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-4xl flex items-center gap-4">
            <Link href="/" className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white hover:border-zinc-700">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Link2 size={20} className="text-emerald-500" />
                Resource Library
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                Simpan Link & Referensi
              </p>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl px-4 pt-8 space-y-8">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Judul Link</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Tutorial React"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">URL / Link</label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="w-full md:w-auto space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500">Tipe</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="cursor-pointer w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="article">Artikel</option>
                  <option value="video">Video</option>
                  <option value="tool">Web Tools</option>
                </select>
              </div>
              <button disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-zinc-200 disabled:opacity-50">
                <Plus size={18} /> Simpan
              </button>
            </form>
          </div>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {resources.map(res => (
              <div key={res.id} className="group relative flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:bg-zinc-900 hover:border-zinc-700">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-zinc-300 ${res.type === 'video' ? 'bg-red-500/10 text-red-500' :
                  res.type === 'tool' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                  {getIcon(res.type)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-zinc-200 truncate">{res.title}</h3>
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 truncate">
                    <Link2 size={10} />
                    {res.url}
                  </a>
                </div>

                <a href={res.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:bg-emerald-500 hover:text-white transition">
                  <ExternalLink size={16} />
                </a>

                <button onClick={() => handleDelete(res.id)} className="absolute -top-2 -right-2 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg group-hover:flex hover:bg-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {resources.length === 0 && (
              <div className="col-span-full py-10 text-center text-zinc-500">
                Belum ada link yang disimpen.
              </div>
            )}
          </div>

        </div>
      </main>
    </AuthGuard>
  );
}