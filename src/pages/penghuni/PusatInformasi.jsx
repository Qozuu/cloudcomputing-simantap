import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Clock,
  BookOpen,
  Wrench,
  Wallet,
  Car,
  Info,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PusatInformasi() {
  const [loading, setLoading] = useState(true);
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Membatasi hanya mengambil maksimal 3 pengumuman terbaru (.limit(3))
        // agar layout grid tidak rusak/panjang ke bawah saat data bertambah
        const { data, error } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setLatestAnnouncements(data || []);
      } catch (err) {
        console.error('Gagal memuat berita/informasi ringkas:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Kartu Informasi Prosedur & Operasional Tetap Apartemen
  const staticCards = [
    {
      icon: PhoneCall,
      title: 'Kontak Darurat Gedung',
      bgClass: 'bg-red-50/60 border-red-100',
      iconClass: 'bg-red-500 text-white',
      content: (
        <ul className="space-y-1 font-medium">
          <li><span className="font-bold text-zinc-900">Pos Satpam:</span> ext. 100 / 101</li>
          <li><span className="font-bold text-zinc-900">Damkar (PMK):</span> 113</li>
          <li><span className="font-bold text-zinc-900">Ambulans Medis:</span> 118</li>
          <li><span className="font-bold text-zinc-900">Hotline Pengelola:</span> 081-1234-5678</li>
        </ul>
      )
    },
    {
      icon: Clock,
      title: 'Operasional Fasilitas',
      bgClass: 'bg-amber-50/60 border-amber-100',
      iconClass: 'bg-amber-500 text-white',
      content: (
        <ul className="space-y-1 font-medium">
          <li><span className="font-bold text-zinc-900">Kolam Renang:</span> 06:00 - 21:00</li>
          <li><span className="font-bold text-zinc-900">Pusat Kebugaran / Gym:</span> 05:00 - 22:00</li>
          <li><span className="font-bold text-zinc-900">Ruang Serbaguna:</span> 08:00 - 22:00</li>
        </ul>
      )
    },
    {
      icon: BookOpen,
      title: 'Tata Tertib Hunian',
      bgClass: 'bg-zinc-50 border-zinc-200/70',
      iconClass: 'bg-zinc-900 text-white',
      content: (
        <ul className="space-y-1 font-medium">
          <li>⚠️ <span className="font-bold text-zinc-900">Jam Tenang:</span> 22:00 - 06:00 WIB</li>
          <li>🚫 Larangan merokok di lorong & area dalam</li>
          <li>🗑️ Pembuangan sampah wajib di TPS Lantai 1</li>
        </ul>
      )
    },
    {
      icon: Wrench,
      title: 'Prosedur Klaim Kerusakan',
      bgClass: 'bg-blue-50/60 border-blue-100',
      iconClass: 'bg-blue-500 text-white',
      content: (
        <p className="leading-relaxed font-medium">
          Gunakan menu <span className="font-bold text-zinc-900">E-Reporting</span> pada aplikasi untuk pelaporan kerusakan fasilitas unit, atau hubungi teknisi via <span className="font-bold text-zinc-900">ext. 102</span>.
        </p>
      )
    },
    {
      icon: Wallet,
      title: 'Metode Pembayaran IPL',
      bgClass: 'bg-emerald-50/60 border-emerald-100',
      iconClass: 'bg-emerald-500 text-white',
      content: (
        <p className="leading-relaxed font-medium">
          Transfer ke VA Rekening <span className="font-bold text-zinc-900">BCA 1234567890</span> a.n PT Manajemen Apartemen, atau scan kode QRIS resmi pengelola di loket keuangan.
        </p>
      )
    },
    {
      icon: Car,
      title: 'Ketentuan Perparkiran',
      bgClass: 'bg-indigo-50/60 border-indigo-100',
      iconClass: 'bg-indigo-500 text-white',
      content: (
        <ul className="space-y-1 font-medium">
          <li>🚗 <span className="font-bold text-zinc-900">Kapasitas Slot:</span> 260 Unit Kendaraan</li>
          <li>💵 <span className="font-bold text-zinc-900">Tarif Tamu/Visitor:</span> Rp 10.000 / Jam</li>
          <li>📄 Registrasi stiker parkir tahunan di kantor pengelola</li>
        </ul>
      )
    }
  ];

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat Pusat Informasi...</div>;
  }

  return (
    <div className="space-y-6 Lauren animate-fade-up text-zinc-800">
      
      {/* SECTION 1: KARTU PANDUAN UTAMA (STATIC GUIDE) */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm space-y-5">
        <div className="border-b border-zinc-100 pb-3.5 flex items-center gap-1.5">
          <Info className="text-zinc-400" size={16} />
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            Panduan & Prosedur Operasional Apartemen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staticCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${card.bgClass} flex flex-col gap-3.5 transition shadow-200`}
              >
                {/* Lingkaran Ikon */}
                <div className={`w-8 h-8 rounded-xl ${card.iconClass} flex items-center justify-center shadow-sm shrink-0`}>
                  <IconComponent size={15} className="stroke-[2.5]" />
                </div>
                
                {/* Judul & Isi Konten */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-zinc-900 tracking-wide">
                    {card.title}
                  </h4>
                  <div className="text-[11px] text-zinc-600 leading-relaxed">
                    {card.content}
                  </div>
                </div>
              </div>
            );
          })}
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
              className="p-4 rounded-xl border border-zinc-150/80 bg-zinc-50/40 flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] uppercase font-black text-zinc-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block"></span>
                  <span>{new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  <span>•</span>
                  <span className="text-zinc-600">{ann.kategori || 'Info'}</span>
                </div>
                <h4 className="font-bold text-zinc-900 leading-snug tracking-wide line-clamp-1">
                  {ann.judul}
                </h4>
                <p className="text-zinc-500 font-medium leading-relaxed line-clamp-2 text-[11px]">
                  {ann.deskripsi}
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