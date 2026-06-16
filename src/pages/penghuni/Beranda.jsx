import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Beranda() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState('Penghuni');
  const [unit, setUnit] = useState(null);
  const [tagihan, setTagihan] = useState(null);
  const [laporan, setLaporan] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get nama from users table
      const { data: userData } = await supabase
        .from('users')
        .select('nama')
        .eq('id', user.id)
        .single();

      // 2. Get unit info from penghuni table
      const { data: penghuniData } = await supabase
        .from('penghuni')
        .select('*, unit(nomor_unit, lantai, tower(nama_tower))')
        .eq('user_id', user.id)
        .single();

      // 3. Get tagihan terbaru
      const { data: tagihanData } = await supabase
        .from('tagihan')
        .select('*')
        .eq('penghuni_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // 4. Get laporan aktif
      const { data: laporanData } = await supabase
        .from('laporan')
        .select('*')
        .eq('pelapor_id', user.id)
        .neq('status', 'selesai');

      // 5. Get pengumuman
      const { data: pengumumanData } = await supabase
        .from('informasi')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      setNama(userData?.nama || 'Penghuni');
      setUnit(penghuniData?.unit || null);
      setTagihan(tagihanData?.[0] || null);
      setLaporan(laporanData || []);
      setPengumuman(pengumumanData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 🛡️ KUNCI ANTI-KEDIPAN RESIDU:
  const handleQuickRedirect = (path) => {
    navigate(path);
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Darurat':
        return 'badge-base badge-pink';
      case 'Info':
        return 'badge-base badge-lavender';
      case 'Promo':
        return 'badge-base badge-yellow';
      case 'Peraturan':
        return 'badge-base badge-dark';
      default:
        return 'badge-base badge-gray';
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  const formattedAmount = tagihan
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tagihan.total)
    : 'Rp 0';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Row */}
      <div className="card-section p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink flex items-center gap-1.5">
            {/* Tanda seru sudah ditambahkan di sini */}
            <span>Halo, {nama}!</span>
            <span className="animate-wiggle inline-block"></span>
          </h2>
          <p className="text-xs text-muted font-medium mt-1">
            Unit {unit?.nomor_unit || '-'} · {unit?.tower?.nama_tower || '-'} · Lantai {unit?.lantai || '-'} — Selamat datang di SiManTap
          </p>
        </div>
        <div className="flex items-center gap-4 border-l border-soft pl-0 md:pl-6">
          <div className="text-right">
            <p className="text-lg font-extrabold text-ink leading-none">{formattedAmount}</p>
            <p className="text-[10px] text-muted font-bold uppercase mt-1">Tagihan {tagihan?.periode || ''}</p>
          </div>
          {/* Badge "1 Hari Aktif" sudah dihapus dari sini */}
        </div>
      </div>

      {/* 2x2 Grid of Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tagihan April */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/billing')}
          className="card-pink hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Tagihan {tagihan?.periode || ''}</p>
            <div className="mt-2.5">
              <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                tagihan?.status === 'lunas' || tagihan?.status === 'Lunas'
                  ? 'bg-[rgba(181,234,215,0.6)] text-[#187050]'
                  : 'bg-red-100 text-red-700'
              }`}>
                {tagihan?.status === 'lunas' || tagihan?.status === 'Lunas' ? 'Lunas' : tagihan?.status === 'sudah_bayar' ? 'Proses' : 'Belum Lunas'}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#8A857F] font-semibold">
            {tagihan?.tgl_bayar 
              ? new Date(tagihan.tgl_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              : '-'}
          </p>
        </div>

        {/* Card 2: Laporan Aktif */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/laporan')}
          className="card-yellow hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Laporan Aktif</p>
            <p className="text-lg font-black text-[#1E1E1E] mt-1.5">{laporan.length} tiket</p>
          </div>
          <p className="text-xs text-[#A05820] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A05820] animate-pulse"></span>
            <span className="truncate max-w-[150px]">
              {laporan.length > 0 
                ? `${laporan[0].judul} → ${laporan[0].status}` 
                : 'Tidak ada laporan'}
            </span>
          </p>
        </div>

        {/* Card 3: Pengumuman */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
          className="card-lavender hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Pengumuman</p>
            <p className="text-lg font-black text-[#1E1E1E] mt-1.5">{pengumuman.length} baru</p>
          </div>
          <p className="text-xs text-[#4840B0] font-semibold">Belum dibaca</p>
        </div>

        {/* Card 4: Customer Service */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/cs')}
          className="card-mint hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Customer Service</p>
            <p className="text-lg font-black text-[#1E1E1E] mt-1.5">1 pesan</p>
          </div>
          <p className="text-xs text-[#187050] font-semibold">Dibalas baru</p>
        </div>
      </div>

      {/* Pengumuman Terbaru */}
      <div className="card-section p-6">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <Info size={16} />
          <span>Pengumuman Terbaru</span>
        </h3>

        <div className="space-y-4">
          {pengumuman.map((item) => (
            <div
              key={item.id}
              onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
              className="group flex flex-col sm:flex-row items-start gap-4 p-4 hover:bg-app-bg rounded-xl transition duration-150 cursor-pointer"
            >
              <span className={`flex-shrink-0 ${getBadgeStyle(item.kategori)}`}>
                {item.kategori}
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink group-hover:text-active transition-colors leading-snug">
                  {item.judul}
                </h4>
                <p className="text-xs text-muted font-medium leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            </div>
          ))}
          {pengumuman.length === 0 && (
            <div className="text-center py-4 text-xs font-semibold text-muted">
              Tidak ada pengumuman terbaru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}