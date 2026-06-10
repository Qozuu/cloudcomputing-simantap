import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Beranda() {
  const navigate = useNavigate();

  // 🛡️ KUNCI ANTI-KEDIPAN RESIDU:
  const handleQuickRedirect = (path) => {
    navigate(path);
  };

  const pengumuman = [
    {
      id: 1,
      category: 'Darurat',
      title: 'Pemadaman Listrik Tower B — Pukul 09:00-12:00',
      description: 'Pemadaman terjadwal untuk perbaikan panel utama lantai B2. Mohon maaf atas ketidaknyamanannya.',
      badgeStyle: 'badge-base badge-pink'
    },
    {
      id: 2,
      category: 'Info',
      title: 'Kolam Renang Kembali Dibuka',
      description: 'Setelah perawatan rutin, kolam renang kembali beroperasi normal.',
      badgeStyle: 'badge-base badge-lavender'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Row */}
      <div className="card-section p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink flex items-center gap-1.5">
            {/* Tanda seru sudah ditambahkan di sini */}
            <span>Halo, Hendra!</span>
            <span className="animate-wiggle inline-block"></span>
          </h2>
          <p className="text-xs text-muted font-medium mt-1">
            Unit 1012 · Tower A · Lantai 10 — Selamat datang di SiManTap
          </p>
        </div>
        <div className="flex items-center gap-4 border-l border-soft pl-0 md:pl-6">
          <div className="text-right">
            <p className="text-lg font-extrabold text-ink leading-none">Rp 920.000</p>
            <p className="text-[10px] text-muted font-bold uppercase mt-1">Tagihan April</p>
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
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Tagihan April</p>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(181,234,215,0.6)] text-[#187050]">
                Lunas
              </span>
            </div>
          </div>
          <p className="text-xs text-[#8A857F] font-semibold">15 Apr</p>
        </div>

        {/* Card 2: Laporan Aktif */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/laporan')}
          className="card-yellow hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Laporan Aktif</p>
            <p className="text-lg font-black text-[#1E1E1E] mt-1.5">1 tiket</p>
          </div>
          <p className="text-xs text-[#A05820] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A05820] animate-pulse"></span>
            <span>AC bocor → Proses</span>
          </p>
        </div>

        {/* Card 3: Pengumuman */}
        <div
          onClick={() => handleQuickRedirect('/penghuni/pengumuman')}
          className="card-lavender hover:scale-[1.02] hover:shadow-soft cursor-pointer transition-all duration-150 flex flex-col justify-between h-32"
        >
          <div>
            <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">Pengumuman</p>
            <p className="text-lg font-black text-[#1E1E1E] mt-1.5">2 baru</p>
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
              <span className={`flex-shrink-0 ${item.badgeStyle}`}>
                {item.category}
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink group-hover:text-active transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-muted font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}