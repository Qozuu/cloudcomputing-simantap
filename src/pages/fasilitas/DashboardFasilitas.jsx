import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardFasilitas() {
  const recentActivities = [
    { id: 1, text: 'Hendra Gunawan memesan Kolam Renang', time: '10 menit yang lalu', status: 'Menunggu' },
    { id: 2, text: 'Maya Sari memesan Lapangan Tenis', time: '45 menit yang lalu', status: 'Menunggu' },
    { id: 3, text: 'Rudi Hartono melunasi tagihan Ruang Serbaguna', time: '2 jam yang lalu', status: 'Lunas' },
    { id: 4, text: 'Pembatalan otomatis reservasi Lapangan Tenis Unit 08C', time: '3 jam yang lalu', status: 'Batal' }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top summary bar card */}
      <div className="card-section p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-wide">Dashboard Fasilitas 🔔</h1>
          </div>
          <p className="text-xs text-muted">
            Kelola reservasi, jadwal, dan tagihan fasilitas apartemen.
          </p>
        </div>
        
        {/* Right side inline stats */}
        <div className="flex flex-wrap items-center gap-3.5 bg-[#FAF6F0] p-3 rounded-2xl border border-soft text-xs font-bold">
          <div className="px-2.5 py-1 bg-pastel-pink-bg text-[#E06E5D] border border-pastel-pink/30 rounded-full font-bold text-[11px]">
            2 Menunggu
          </div>
          <div className="w-px h-3 bg-[#EAE5DF]"></div>
          <div className="text-ink font-semibold">
            28 Bulan Ini
          </div>
          <div className="w-px h-3 bg-[#EAE5DF]"></div>
          <div className="text-ink font-bold">
            Rp 1.8Jt Pendapatan
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="card-pink flex flex-col justify-between h-32 hover:translate-y-[-2px] transition duration-200">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Menunggu Konfirmasi</span>
            <span className="badge-base" style={{ backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' }}>
              Perlu ditinjau
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[#1E1E1E] font-black text-3xl">2</span>
            <span className="text-[#8A857F] font-semibold text-xs">reservasi baru</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-yellow flex flex-col justify-between h-32 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Diarsipkan Hari Ini</span>
            <span className="text-[#8A857F] font-semibold text-xs mt-0.5 block">Sesi terselesaikan</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[#1E1E1E] font-black text-3xl">5</span>
            <span className="text-[#8A857F] font-semibold text-xs">aktif hari ini</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-lavender flex flex-col justify-between h-32 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Tagihan Belum Bayar</span>
            <span className="text-[#8A857F] font-semibold text-xs mt-0.5 block">Segera konfirmasi</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[#1E1E1E] font-black text-3xl">3</span>
            <span className="text-[#8A857F] font-semibold text-xs">invoices pending</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-mint flex flex-col justify-between h-32 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Ditolak Bulan Ini</span>
            <span className="text-[#8A857F] font-semibold text-xs mt-0.5 block">Dibatalkan/tidak sah</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[#1E1E1E] font-black text-3xl">3</span>
            <span className="text-[#8A857F] font-semibold text-xs">reservasi ditolak</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content - Columns for Quick Access and Log Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Activity Log) */}
        <div className="card-section p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soft">
            <div>
              <h2 className="text-base font-bold text-ink">Reservasi & Aktivitas Terbaru</h2>
              <p className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">Riwayat Penggunaan Fasilitas</p>
            </div>
            <Link to="/fasilitas/reservasi" className="text-xs font-bold text-ink hover:underline">
              Lihat Semua →
            </Link>
          </div>

          <div className="divide-y divide-soft">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink leading-snug">{act.text}</p>
                    <span className="text-[10px] font-semibold text-muted">{act.time}</span>
                  </div>
                </div>
                <div>
                  <span className={`badge-base ${
                    act.status === 'Lunas' ? 'badge-mint' : act.status === 'Menunggu' ? 'badge-yellow' : 'badge-gray'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Quick Actions Card) */}
        <div className="card-section p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="pb-3 border-b border-soft">
              <h2 className="text-base font-bold text-ink">Navigasi Cepat</h2>
              <p className="text-[10px] text-muted font-bold tracking-wider uppercase mt-0.5">Akses cepat menu utama</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/fasilitas/reservasi" 
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-soft bg-[#FAF6F0] hover:bg-white hover:border-ink/10 hover:shadow-sm transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-pastel-pink-bg text-[#B85040] flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <p className="text-xs font-bold text-ink group-hover:underline">Reservasi Masuk</p>
                  <p className="text-[10px] text-muted font-medium">Tinjau reservasi dari warga</p>
                </div>
              </Link>

              <Link 
                to="/fasilitas/kelola" 
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-soft bg-[#FAF6F0] hover:bg-white hover:border-ink/10 hover:shadow-sm transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-pastel-yellow-bg text-[#A05820] flex items-center justify-center font-bold text-xs">
                  K
                </div>
                <div>
                  <p className="text-xs font-bold text-ink group-hover:underline">Kelola Fasilitas</p>
                  <p className="text-[10px] text-muted font-medium">Pengaturan status & tambah baru</p>
                </div>
              </Link>

              <Link 
                to="/fasilitas/tagihan" 
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-soft bg-[#FAF6F0] hover:bg-white hover:border-ink/10 hover:shadow-sm transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-pastel-lavender-bg text-[#4840B0] flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <div>
                  <p className="text-xs font-bold text-ink group-hover:underline">Tagihan Reservasi</p>
                  <p className="text-[10px] text-muted font-medium">Konfirmasi pembayaran booking</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-soft text-center">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">Butuh bantuan?</span>
            <span className="text-[10px] text-muted font-medium mt-1 block">Hubungi tim technical administrator apartemen.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
