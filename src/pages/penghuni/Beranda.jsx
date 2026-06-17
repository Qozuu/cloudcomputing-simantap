import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; 
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Beranda() {
  const navigate = useNavigate();
  
  // 💡 AMBIL DATA DINAMIS DARI CONTEXT INDUK
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

        // 1. Ambil data penghuni menggunakan filter array agar lebih toleran terhadap tipe data UUID
        const { data: penghuniData, error: penghuniError } = await supabase
          .from('penghuni')
          .select('id')
          .eq('user_id', user.id);

        if (penghuniError) {
          console.error("Gagal memuat data penghuni di beranda:", penghuniError);
        }

        // Ambil objek pertama dari array data penghuni
        const targetPenghuni = Array.isArray(penghuniData) ? penghuniData[0] : penghuniData;

        if (targetPenghuni && targetPenghuni.id) {
          const currentPenghuniId = targetPenghuni.id;
          
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

        // 3. Ambil laporan aktif milik user
        const { data: laporanData } = await supabase
          .from('laporan')
          .select('*')
          .eq('pelapor_id', user.id)
          .neq('status', 'selesai');

        // 4. Ambil pengumuman dari tabel informasi sesuai skema terbaru
        const { data: pengumumanData } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        setLaporan(laporanData || []);
        setPengumuman(pengumumanData || []);
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

  // 💡 PERBAIKAN UTAMA: Tambahkan validasi mendalam agar tidak merender halaman jika nomor_unit atau lantai masih berupa strip/kosong
  if (
    loading || 
    !userProfile || 
    !userProfile.nomor_unit || 
    userProfile.nomor_unit === '-' || 
    !userProfile.lantai || 
    userProfile.lantai === '-'
  ) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6 text-zinc-500 text-sm font-semibold bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <span className="w-4 h-4 mr-2 rounded-full bg-zinc-400 animate-ping"></span>
        Menyinkronkan Data Unit Kamar SiManTap...
      </div>
    );
  }

  // Menggunakan tagihan.jumlah sesuai skema SQL
  const formattedAmount = tagihan?.jumlah
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.jumlah)
    : 'Rp 0';

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
            {/* 💡 MENGGUNAKAN DATA DINAMIS DARI CONTEXT */}
            <span>Halo, {userProfile?.nama || 'Penghuni'}!</span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            {/* 💡 MENGGUNAKAN NOMOR UNIT DAN LANTAI DARI CONTEXT */}
            Unit {userProfile.nomor_unit} · Lantai {userProfile.lantai} — Selamat datang di SiManTap
          </p>
        </div>
        <div className="flex items-center gap-4 border-l border-zinc-100 pl-0 md:pl-6">
          <div className="text-right">
            <p className="text-lg font-extrabold text-zinc-900 leading-none">{formattedAmount}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
              {tagihan ? `Tagihan ${formatPeriode(tagihan.periode)}` : 'Tidak Anda Tagihan Aktif'}
            </p>
          </div>
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
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
            <p className="text-lg font-black text-zinc-900 mt-1.5">{pengumuman.length} publikasi</p>
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

      {/* Pengumuman Terbaru */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <Info size={16} />
          <span>Pengumuman Terbaru</span>
        </h3>

        <div className="space-y-4">
          {pengumuman.map((item) => (
            <div
              key={item.id}
              onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
              className="group flex flex-col sm:flex-row items-start gap-4 p-4 hover:bg-zinc-50 rounded-xl transition duration-150 cursor-pointer border border-transparent hover:border-zinc-100"
            >
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                {item.target_role === 'all' ? 'Umum' : 'Internal'}
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
                  {item.judul}
                </h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed line-clamp-2">
                  {item.isi}
                </p>
              </div>
            </div>
          ))}
          {pengumuman.length === 0 && (
            <div className="text-center py-4 text-xs font-semibold text-zinc-400">
              Tidak ada pengumuman terbaru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}