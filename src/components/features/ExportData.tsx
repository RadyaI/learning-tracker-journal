'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import swal from 'sweetalert';
import toast from 'react-hot-toast';

const db = getFirestore(app);
const auth = getAuth(app);

export default function ExportData() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'logs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        swal({
            title: "Datanya engga ada?",
            button: 'Walah oke',
            timer: 2000
        } as any)
        setLoading(false);
        return;
      }

      const dataToExport = snapshot.docs.map(doc => {
        const data = doc.data();
        const dateObj = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();

        return {
          'Tanggal': data.dateString,
          'Jam': dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          'Durasi (Menit)': data.duration,
          'Status': data.isEmergency ? 'Emergency (Cepat)' : 'Fokus (Normal)',
          'Catatan': data.content,
          'Mood (Kucing)': data.mood
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DailyGrind Log");

      XLSX.writeFile(workbook, `Backup_Jurnal_Belajar_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Downloaded")
    } catch (error) {
      console.error("Gagal export:", error);
      toast.error("Gagal download data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-bold text-zinc-400 transition hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <FileSpreadsheet size={16} className="text-emerald-500" />
      )}
      {loading ? 'Menyiapkan Excel...' : 'Backup Data ke Excel'}
    </button>
  );
}