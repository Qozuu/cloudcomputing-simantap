import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  CreditCard,
  Wrench,
  Dumbbell,
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Homepage() {
  const navigate = useNavigate();

  // State untuk Counter Utama
  const [towerCount, setTowerCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [karyawanCount, setKaryawanCount] = useState(0);

  // State untuk Kartu Informasi Finansial & Operasional
  const [pendapatan, setPendapatan] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [tiketCount, setTiketCount] = useState(0);
  const [absenHariIni, setAbsenHariIni] = useState('0/0');

  // State Dinamis untuk Pengumuman
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch Data Sederhana (Tower & Unit)
        const { count: tc } = await supabase.from('tower').select('id', { count: 'exact', head: true });
        const { count: uc } = await supabase.from('unit').select('id', { count: 'exact', head: true });
        
        if (tc !== null) setTowerCount(tc);
        if (uc !== null) setUnitCount(uc);

        // 2. Fetch Jumlah Penghuni Aktif (Dari tabel penghuni)
        const { count: usc } = await supabase
          .from('penghuni')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'aktif');
        if (usc !== null) setUserCount(usc);

        // 3. Fetch Jumlah Karyawan (Semua user selain role 'penghuni' dan 'super_admin')
        const { count: kc } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .not('role', 'in', '(penghuni,super_admin)');
        const totalKaryawan = kc || 0;
        setKaryawanCount(totalKaryawan);

        // 4. Fetch Pendapatan (Akumulasi total tagihan yang sudah_bayar)
        const { data: dataTagihan } = await supabase
          .from('tagihan')
          .select('jumlah')
          .eq('status', 'sudah_bayar');
        const totalPendapatan = dataTagihan?.reduce((sum, item) => sum + Number(item.jumlah), 0) || 0;
        setPendapatan(totalPendapatan);

        // 5. Fetch Pengeluaran (Akumulasi nominal pengeluaran yang selesai)
        const { data: dataPengeluaran } = await supabase
          .from('pengeluaran')
          .select('nominal')
          .eq('status', 'selesai');
        const totalPengeluaran = dataPengeluaran?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0;
        setPengeluaran(totalPengeluaran);

        // 6. Fetch Tiket Kerusakan Aktif (Tabel laporan yang belum selesai)
        const { count: tkt } = await supabase
          .from('laporan')
          .select('id', { count: 'exact', head: true })
          .not('status', 'in', '(selesai,ditolak)');
        if (tkt !== null) setTiketCount(tkt);

        // 7. Fetch Absensi Hari Ini (Format Tanggal YYYY-MM-DD)
        const hariIni = new Date().toISOString().split('T')[0];
        const { count: totalHadir } = await supabase
          .from('absensi')
          .select('id', { count: 'exact', head: true })
          .eq('tanggal', hariIni)
          .eq('status', 'hadir');
        setAbsenHariIni(`${totalHadir || 0}/${totalKaryawan}`);

        // 8. Fetch 3 Pengumuman Terbaru dari tabel informasi (sumber: PusatInformasi.jsx)
        const { data: dataInformasi } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (dataInformasi && dataInformasi.length > 0) {
          const mappedInformasi = dataInformasi.map(item => ({
            category: item.target_role.charAt(0).toUpperCase() + item.target_role.slice(1), // Kapital huruf pertama
            time: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            title: item.judul,
            desc: item.isi
          }));
          setAnnouncements(mappedInformasi);
        } else {
          setAnnouncements([]);
        }

      } catch (err) {
        console.error('Error fetching dashboard database aggregates:', err);
      }
    }
    loadDashboardData();
  }, []);

  // Format nominal rupiah ke ringkasan berbasis Juta Rupiah (Contoh: Rp 296.5 Jt)
  const formatKeJuta = (nominal) => {
    if (nominal === 0) return 'Rp 0 Jt';
    return `Rp ${(nominal / 1000000).toFixed(1)} Jt`;
  };

  const handleSafeRedirect = (path) => {
    navigate(path);
  };

  // Struktur Data untuk Render Card Stats Atas
  const statsConfig = [
    {
      title: 'Pendapatan Terkumpul',
      value: formatKeJuta(pendapatan),
      badge: 'Total Transaksi Masuk',
      icon: TrendingUp,
      cardColor: 'card-pink',
      iconColor: 'card-icon-pink',
      badgeStyle: { backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' }
    },
    {
      title: 'Pengeluaran Operasional',
      value: formatKeJuta(pengeluaran),
      subtitle: 'Selesai Terbayar',
      icon: CreditCard,
      cardColor: 'card-yellow',
      iconColor: 'card-icon-yellow'
    },
    {
      title: 'Tiket Kendala Aktif',
      value: String(tiketCount),
      badge: 'Butuh Penanganan',
      icon: Wrench,
      cardColor: 'card-lavender',
      iconColor: 'card-icon-lavender',
      badgeStyle: { backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' }
    },
    {
      title: 'Kehadiran Staf Hari Ini',
      value: absenHariIni,
      badge: 'Presensi Kerja',
      icon: CalendarCheck,
      cardColor: 'card-mint',
      iconColor: 'card-icon-mint',
      badgeStyle: { backgroundColor: 'rgba(181,234,215,0.6)', color: '#187050' }
    }
  ];

  const shortcuts = [
    { label: 'Grafik Monitoring', path: '/super-admin/grafik', icon: BarChart2 },
    { label: 'E-Billing', path: '/super-admin/laporan', icon: CreditCard },
    { label: 'Tiket Kerusakan', path: '/super-admin/dashboard', icon: Wrench },
    { label: 'Kelola Fasilitas', path: '/super-admin/fasilitas', icon: Dumbbell },
    { label: 'Data Penghuni', path: '/super-admin/penghuni', icon: Users },
    { label: 'Absen Karyawan', path: '/super-admin/absen', icon: CalendarCheck }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* Welcome Banner Card */}
      <div className="bg-[#111111] rounded-3xl p-8 text-[#FAF6F0] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 border border-[#2D2D2D] relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="space-y-5 max-w-lg z-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight leading-tight font-serif text-white">Selamat Datang di SiManTap</h2>
            <p className="text-xs text-[#FAF6F0]/80 font-medium leading-relaxed">
              Sistem Informasi Manajemen Terpadu Apartemen. Kelola gedung, penghuni, keuangan, dan karyawan dalam satu dasbor eksekutif.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <button 
              onClick={() => handleSafeRedirect('/super-admin/dashboard')} 
              className="px-4 py-2 rounded-full text-xs font-bold bg-white text-[#111111] hover:bg-[#FAF6F0] transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Buka Dashboard
            </button>
            <button 
              onClick={() => handleSafeRedirect('/super-admin/grafik')} 
              className="px-4 py-2 rounded-full text-xs font-bold bg-transparent text-white border border-white/20 hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Grafik Monitoring
            </button>
            <button 
              onClick={() => handleSafeRedirect('/super-admin/informasi')} 
              className="px-4 py-2 rounded-full text-xs font-bold bg-transparent text-white border border-white/20 hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Pusat Informasi
            </button>
          </div>
        </div>

        {/* Banner Right Stats */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/10 md:border-t-0 md:border-l md:border-white/15 pt-5 md:pt-0 md:pl-8 z-10 flex-shrink-0">
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-white">{unitCount}</p>
            <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wider">Total Unit</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-white">{userCount}</p>
            <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wider">Penghuni Aktif</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-white font-serif">{towerCount} Tower</p>
            <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wider">Tower Utama</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-black text-white font-serif">{karyawanCount}</p>
            <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wider">Total Staf</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className={`${stat.cardColor} flex flex-col justify-between min-h-[140px] transition hover:scale-[1.01] duration-150`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[#8A857F] font-semibold text-xs">{stat.title}</span>
                  <div className={`${stat.iconColor} !mb-0`}>
                    <Icon size={18} />
                  </div>
                </div>
                <p className="text-[#1E1E1E] font-black text-2xl mt-2">{stat.value}</p>
              </div>
              
              <div className="mt-3">
                {stat.badge ? (
                  <span className="badge-base" style={stat.badgeStyle}>
                    {stat.badge}
                  </span>
                ) : (
                  <p className="text-[#8A857F] font-semibold text-xs">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Section - Announcements (60%) */}
        <div className="lg:col-span-6 card-section p-6 relative">
          <div className="flex items-center justify-between border-b border-[#EAE6E1] pb-4 mb-4">
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
              Pengumuman Terkini
            </h3>
            <button 
              onClick={() => handleSafeRedirect('/super-admin/informasi')}
              className="text-xs font-bold text-[#1E1E1E] hover:text-[#8A857F] transition flex items-center gap-1 hover:underline"
            >
              <span>Kelola</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann, idx) => {
              const listColors = ['card-pink', 'card-lavender', 'card-yellow', 'card-mint'];
              const listBadgeStyles = [
                { backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' },
                { backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' },
                { backgroundColor: 'rgba(252,214,165,0.6)', color: '#A05820' },
                { backgroundColor: 'rgba(181,234,215,0.6)', color: '#187050' }
              ];
              const cardClass = listColors[idx % 4];
              const badgeStyle = listBadgeStyles[idx % 4];

              return (
                <div 
                  key={idx} 
                  className={`${cardClass} transition-all space-y-2 group`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="badge-base" style={badgeStyle}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-[#8A857F] font-bold">{ann.time}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-[#1E1E1E] transition">
                    {ann.title}
                  </h4>
                  {ann.desc && (
                    <p className="text-xs text-[#8A857F] leading-relaxed font-medium">
                      {ann.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section - Quick Access Shortcuts (40%) */}
        <div className="lg:col-span-4 card-section p-6 flex flex-col">
          <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider border-b border-[#EAE6E1] pb-4 mb-4 font-serif">
            Akses Cepat Menu Utama
          </h3>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {shortcuts.map((sc, idx) => {
              const Icon = sc.icon;
              const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
              const iconColors = ['card-icon-pink', 'card-icon-yellow', 'card-icon-lavender', 'card-icon-mint'];

              return (
                <div
                  key={idx}
                  onClick={() => handleSafeRedirect(sc.path)}
                  className={`${cardColors[idx % 4]} cursor-pointer transition-all duration-200 flex flex-col justify-between items-start gap-4 group shadow-sm hover:shadow`}
                >
                  <div className={`${iconColors[idx % 4]} !mb-0`}>
                    <Icon size={18} className="group-hover:scale-110 transition" />
                  </div>
                  <span className="text-xs font-bold text-[#1E1E1E] transition">
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}