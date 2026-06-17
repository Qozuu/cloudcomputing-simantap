import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; 
import { CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Beranda() {
  const navigate = useNavigate();
  
  // Ambil data dinamis dari context induk
  const { userProfile } = useOutletContext();

  const [loading, setLoading] = useState(true);
  const [tagihan, setTagihan] = useState(null);
  const [laporan, setLaporan] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Ambil data penghuni berdasarkan user_id
        const { data: penghuniData, error: penghuniError } = await supabase
          .from('penghuni')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (penghuniError) {
          console.error("Gagal memuat data penghuni di beranda:", penghuniError.message);
        }

        if (penghuniData && penghuniData.id) {
          const currentPenghuniId = penghuniData.id;
          
          // 2. Ambil tagihan terbaru berdasarkan penghuni_id
          const { data: tagihanData } = await supabase
            .from('tagihan')
            .select('*')
            .eq('penghuni_id', currentPenghuniId)
            .order('created_at', { ascending: false });

          const targetTagihan = Array.isArray(tagihanData) ? tagihanData[0] : tagihanData;
          if (targetTagihan) {
            setTagihan(targetTagihan);
          }
        }

        // 3. Menggunakan filter pencarian laporan aktif milik penghuni yang sedang login
        const { data: laporanData, error: laporanError } = await supabase
          .from('laporan')
          .select('*')
          .eq('pelapor_id', user.id);

        if (!laporanError && laporanData) {
          // Filter data status non-selesai dan non-ditolak di sisi client
          const laporanAktif = laporanData.filter(
            item => item.status?.toLowerCase() !== 'selesai' && item.status?.toLowerCase() !== 'ditolak'
          );
          setLaporan(laporanAktif);
        }

        // 4. 🔥 PERBAIKAN: Mengambil data pengumuman dinamis dari tabel broadcast_pesan
        const { data: broadcastData, error: broadcastError } = await supabase
          .from('broadcast_pesan')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (broadcastError) {
          console.error("Gagal memuat data broadcast pesan:", broadcastError.message);
        } else {
          setPengumuman(broadcastData || []);
        }

      } catch (error) {
        console.error('Gagal memuat data beranda:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDynamicData();
  }, []);

  const handleQuickRedirect = (path) => {
    navigate(path);
  };

  // Fungsi pembantu styling badge berdasarkan tingkat prioritas broadcast
  const getPriorityStyle = (prioritas) => {
    switch (prioritas?.toLowerCase()) {
      case 'darurat':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'peringatan':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  // Loading Guard
  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6 text-zinc-500 text-sm font-semibold bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <span className="w-4 h-4 mr-2 rounded-full bg-zinc-400 animate-ping"></span>
        Menyinkronkan Data Unit Kamar SiManTap...
      </div>
    );
  }

  // Format tanggal periode tagihan
  const formatPeriode = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-up text-zinc-800">
      {/* Welcome Row */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-1.5">
            <span>Halo, {userProfile?.nama || 'Penghuni'}!</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Unit {userProfile?.nomor_unit || 'Belum Diatur'} · Lantai {userProfile?.lantai || 'Belum Diatur'} — Selamat datang di SiManTap
          </p>
        </div>
      </div>

      {/* 2x2 Grid of Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status Tagihan */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/billing')}
          className="bg-red-50/40 border border-red-100 p-4 rounded-2xl hover:scale-[1.02] hover:shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              {tagihan ? `Tagihan ${formatPeriode(tagihan.periode)}` : 'Status Billing'}
            </p>
            <div className="mt-2.5">
              <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                tagihan?.status === 'sudah_bayar'
                  ? 'bg-emerald-100 text-emerald-700'
                  : tagihan?.status === 'terlambat'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {tagihan 
                  ? (tagihan.status === 'sudah_bayar' ? 'Lunas' : tagihan.status === 'terlambat' ? 'Terlambat' : 'Belum Bayar') 
                  : 'Kosong'}
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-semibold">
            {tagihan?.jatuh_tempo 
              ? `Jatuh Tempo: ${new Date(tagihan.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
              : '-'}
          </p>
        </div>

        {/* Card 2: Laporan Aktif */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/laporan')}
          className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl hover:scale-[1.02] hover:shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Laporan Aktif</p>
            <p className="text-lg font-black text-zinc-900 mt-1.5">{laporan.length} tiket</p>
          </div>
          <p className="text-xs text-amber-800 font-semibold flex items-center gap-1">
            {laporan.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>}
            <span className="truncate max-w-[150px]">
              {laporan.length > 0 
                ? `${laporan[0].judul} → ${laporan[0].status}` 
                : 'Tidak ada laporan aktif'}
            </span>
          </p>
        </div>

        {/* Card 3: Pengumuman */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
          className="bg-purple-50/40 border border-purple-100 p-4 rounded-2xl hover:scale-[1.02] hover:shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Pengumuman</p>
            <p className="text-lg font-black text-zinc-900 mt-1.5">{pengumuman.length} pesan</p>
          </div>
          <p className="text-xs text-purple-700 font-semibold">Lihat informasi apartemen</p>
        </div>

        {/* Card 4: Customer Service */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/cs')}
          className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl hover:scale-[1.02] hover:shadow-sm cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Customer Service</p>
            <p className="text-lg font-black text-zinc-900 mt-1.5">Live Chat</p>
          </div>
          <p className="text-xs text-emerald-700 font-semibold">Hubungi pengelola</p>
        </div>
      </div>

      {/* Bagian Pengumuman Terbaru (Broadcast Pesan) */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <Info size={16} />
          <span>Pengumuman Broadcast Terbaru</span>
        </h3>

        <div className="space-y-4">
          {pengumuman.map((item) => (
            <div
              key={item.id}
              onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
              className="group flex flex-col sm:flex-row items-start gap-4 p-4 hover:bg-zinc-50 rounded-xl transition duration-150 cursor-pointer border border-transparent hover:border-zinc-100"
            >
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(item.prioritas)}`}>
                {item.prioritas || 'Info'}
              </span>
              <div className="space-y-1-w-full">
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
                  {item.judul}
                </h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2">
                  {item.isi}
                </p>
                <p className="text-[10px] text-zinc-400 font-normal pt-1">
                  Diterbitkan pada: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
          {pengumuman.length === 0 && (
            <div className="text-center py-6 text-xs font-semibold text-zinc-400 flex flex-col items-center justify-center gap-2">
              <BellRing size={24} className="text-zinc-300 animate-bounce" />
              <span>Belum ada pesan broadcast pengumuman untuk saat ini.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}