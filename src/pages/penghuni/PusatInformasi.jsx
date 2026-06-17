import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Clock,
  BookOpen,
  Wrench,
  Wallet,
  Car,
  Info,
  CalendarDays,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PusatInformasi() {
  const [loading, setLoading] = useState(true);
  const [panduanList, setPanduanList] = useState([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);

  // Fungsi pembantu untuk memberikan ikon yang sesuai berdasarkan judul/keyword panduan
  const getIconComponent = (judul) => {
    const title = judul.toLowerCase();
    if (title.includes('kontak') || title.includes('darurat')) return PhoneCall;
    if (title.includes('operasional') || title.includes('jam')) return Clock;
    if (title.includes('tertib') || title.includes('peraturan')) return BookOpen;
    if (title.includes('klaim') || title.includes('kerusakan') || title.includes('teknisi')) return Wrench;
    if (title.includes('pembayaran') || title.includes('ipl') || title.includes('rekening')) return Wallet;
    if (title.includes('parkir') || title.includes('kendaraan')) return Car;
    return HelpCircle; // Ikon default jika tidak ada keyword yang cocok
  };

  // Fungsi pembantu untuk memberikan warna card secara variatif berdasarkan index
  const getCardStyle = (index) => {
    const styles = [
      { bgClass: 'bg-red-50/60 border-red-100', iconClass: 'bg-red-500 text-white' },
      { bgClass: 'bg-amber-50/60 border-amber-100', iconClass: 'bg-amber-500 text-white' },
      { bgClass: 'bg-zinc-50 border-zinc-200/70', iconClass: 'bg-zinc-900 text-white' },
      { bgClass: 'bg-blue-50/60 border-blue-100', iconClass: 'bg-blue-500 text-white' },
      { bgClass: 'bg-emerald-50/60 border-emerald-100', iconClass: 'bg-emerald-500 text-white' },
      { bgClass: 'bg-indigo-50/60 border-indigo-100', iconClass: 'bg-indigo-500 text-white' },
    ];
    return styles[index % styles.length];
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Ambil semua data informasi yang sudah dipublikasikan
        const { data, error } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // PISAHKAN DATA BERDASARKAN TARGET_ROLE ATAU KEYWORD
        // Memanfaatkan kolom 'target_role' sebagai pembeda tipe informasi
        const dataPanduan = data.filter(item => item.target_role?.toLowerCase() === 'panduan');
        const dataWarta = data.filter(item => item.target_role?.toLowerCase() !== 'panduan');

        setPanduanList(dataPanduan);
        // Batasi warta terbaru maksimal 3 item agar layout tetap rapi
        setLatestAnnouncements(dataWarta.slice(0, 3));

      } catch (err) {
        console.error('Gagal memuat data pusat informasi:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] p-6 text-zinc-500 text-sm font-semibold bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <span className="w-3 h-3 mr-2 rounded-full bg-zinc-400 animate-ping"></span>
        Memuat Pusat Informasi...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up text-zinc-800">
      
      {/* SECTION 1: KARTU PANDUAN UTAMA (DINAMIS DARI TABEL INFORMASI) */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm space-y-5">
        <div className="border-b border-zinc-100 pb-3.5 flex items-center gap-1.5">
          <Info className="text-zinc-400" size={16} />
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            Panduan & Prosedur Operasional Apartemen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {panduanList.map((card, idx) => {
            const IconComponent = getIconComponent(card.judul);
            const style = getCardStyle(idx);
            
            return (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border ${style.bgClass} flex flex-col gap-3.5 transition hover:scale-[1.01] duration-150`}
              >
                {/* Lingkaran Ikon */}
                <div className={`w-8 h-8 rounded-xl ${style.iconClass} flex items-center justify-center shadow-sm shrink-0`}>
                  <IconComponent size={15} className="stroke-[2.5]" />
                </div>
                
                {/* Judul & Isi Konten */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-zinc-900 tracking-wide">
                    {card.judul}
                  </h4>
                  <div className="text-[11px] text-zinc-600 leading-relaxed whitespace-pre-line font-medium">
                    {card.isi}
                  </div>
                </div>
              </div>
            );
          })}

          {panduanList.length === 0 && (
            <div className="col-span-3 text-center py-6 text-zinc-400 font-medium text-[11px] border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              Belum ada data panduan operasional tetapan gedung di database. (Gunakan target_role: 'panduan')
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: RINGKASAN PENGUMUMAN TERBARU (DYNAMIC NEWS FEED) */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-3.5">
          <CalendarDays className="text-zinc-400" size={16} />
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            Warta & Maklumat Terbaru Pengelola
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestAnnouncements.map((ann) => (
            <div 
              key={ann.id} 
              className="p-4 rounded-xl border border-zinc-150 bg-zinc-50/40 flex flex-col justify-between gap-3 text-xs hover:border-zinc-200 transition duration-150"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-black text-zinc-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block"></span>
                  <span>{new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  <span>•</span>
                  <span className="text-zinc-600">Target: {ann.target_role || 'All'}</span>
                </div>
                <h4 className="font-bold text-zinc-900 leading-snug tracking-wide line-clamp-1">
                  {ann.judul}
                </h4>
                <p className="text-zinc-500 font-medium leading-relaxed line-clamp-2 text-[11px] whitespace-pre-line">
                  {ann.isi}
                </p>
              </div>
            </div>
          ))}

          {latestAnnouncements.length === 0 && (
            <div className="col-span-3 text-center py-6 text-zinc-400 font-medium text-[11px] border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              Belum ada maklumat pengumuman terbaru yang diterbitkan.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}