import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// =========================================================================
// DATA DUMMY FALLBACK (Otomatis muncul jika database Supabase kosong)
// Sudah dilengkapi URL foto sampel agar layout terlihat estetik saat demo
// =========================================================================
const MOCK_RECENT_TICKETS = [
  { 
    id: 101, 
    judul: 'Kebocoran Pipa Air Utama Koridor Barat', 
    status: 'Urgent', 
    created_at: new Date(Date.now() - 3600000).toISOString(), 
    unit: { nomor_unit: 'B-04' },
    foto_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop&q=60' // Contoh foto pipa/dinding bocor
  },
  { 
    id: 102, 
    judul: 'Korsleting Lampu Indikator Lift Penumpang', 
    status: 'Proses', 
    created_at: new Date(Date.now() - 7200000).toISOString(), 
    unit: { nomor_unit: 'Lobby' },
    foto_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=150&auto=format&fit=crop&q=60' // Contoh foto panel listrik
  },
  { 
    id: 103, 
    judul: 'Kipas Exhaust Ruang Panel Overheat', 
    status: 'Menunggu', 
    created_at: new Date(Date.now() - 86400000).toISOString(), 
    unit: { nomor_unit: 'P-02' },
    foto_url: null // Contoh jika penghuni tidak melampirkan foto
  },
];

export default function DashboardTiket() {
  const [tiket, setTiket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Pak Doni');
  
  // State Statistik Awal (Sinkron dengan status riil database)
  const [stats, setStats] = useState([
    { title: 'Tiket Menunggu', value: '0', subtitle: 'Belum ditanggapi teknisi', borderColor: 'border-coral', valueColor: 'text-coral' },
    { title: 'Dalam Proses', value: '0', subtitle: 'Teknisi sedang bekerja', borderColor: 'border-gold', valueColor: 'text-gold' },
    { title: 'Selesai Bulan Ini', value: '0', subtitle: '▲ 0% Baik', borderColor: 'border-navy', valueColor: 'text-navy', percentage: 0 },
    { title: 'Avg Penyelesaian', value: '1.2 hari', subtitle: 'Target: < 2 hari', borderColor: 'border-cream', valueColor: 'text-[#1E1E1E]' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Ambil Profil User yang Login
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('nama').eq('id', user.id).single();
          if (profile?.nama) setUserName(profile.nama);
        }

        // 2. Ambil 5 Tiket Terkini dari Database (Pastikan kolom foto_url ikut terpanggil)
        const { data: recent, error } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), unit(nomor_unit)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Jika database ada isinya, pakai data asli. Jika kosong, pakai Dummy.
        if (recent && recent.length > 0) {
          setTiket(recent);
        } else {
          setTiket(MOCK_RECENT_TICKETS);
        }

        // 3. Ambil Seluruh Data Tiket Untuk Kalkulasi Statistik Ringkas
        const { data: allTickets } = await supabase.from('laporan').select('status, kategori, created_at, updated_at');
        
        // Buat basis data perhitungan (Gunakan fallback dummy jika db kosong)
        const activeTicketsData = (allTickets && allTickets.length > 0) ? allTickets : [
          { status: 'menunggu' },
          { status: 'proses' },
          { status: 'proses' },
          { status: 'selesai', created_at: '2026-06-15', updated_at: '2026-06-16' }
        ];

        const waiting = activeTicketsData.filter(t => t.status?.toLowerCase() === 'menunggu' || t.status?.toLowerCase() === 'pending').length;
        const proses = activeTicketsData.filter(t => t.status?.toLowerCase() === 'proses').length;
        
        const now = new Date();
        const selesaiBulanIni = activeTicketsData.filter(t => {
          if (t.status?.toLowerCase() !== 'selesai') return false;
          if (!t.updated_at) return false;
          const updatedDate = new Date(t.updated_at);
          return updatedDate.getMonth() === now.getMonth() && updatedDate.getFullYear() === now.getFullYear();
        }).length;

        // Hitung Dinamis Tren Persentase Keberhasilan
        const hitungPersen = activeTicketsData.length > 0 
          ? Math.round((selesaiBulanIni / activeTicketsData.length) * 100) 
          : 0;

        // Hitung Average Resolution Time (SLA)
        const resolvedTickets = activeTicketsData.filter(t => t.status?.toLowerCase() === 'selesai' && t.created_at && t.updated_at);
        let avgStr = '1.2 hari';
        if (resolvedTickets.length > 0) {
          const totalMs = resolvedTickets.reduce((acc, t) => acc + (new Date(t.updated_at) - new Date(t.created_at)), 0);
          const avgDays = (totalMs / (1000 * 60 * 60 * 24 * resolvedTickets.length)).toFixed(1);
          avgStr = `${avgDays} hari`;
        }

        setStats([
          { title: 'Tiket Menunggu', value: String(waiting), subtitle: 'Belum ditanggapi teknisi', borderColor: 'border-coral', valueColor: 'text-coral' },
          { title: 'Dalam Proses', value: String(proses), subtitle: 'Teknisi sedang bekerja', borderColor: 'border-gold', valueColor: 'text-gold' },
          { title: 'Selesai Bulan Ini', value: String(selesaiBulanIni), subtitle: `▲ ${hitungPersen}% Baik`, borderColor: 'border-navy', valueColor: 'text-navy', percentage: hitungPersen },
          { title: 'Avg Penyelesaian', value: avgStr, subtitle: 'Target: < 2 hari', borderColor: 'border-cream', valueColor: 'text-[#1E1E1E]' }
        ]);

      } catch (err) {
        console.error('Error loading dashboard tiket:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // 4. Realtime Listener Supabase Channel
    const channel = supabase.channel('laporan-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'laporan' }, async (payload) => {
        const { data: newTicket } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), unit(nomor_unit)')
          .eq('id', payload.new.id)
          .single();
        
        if (newTicket) {
          setTiket(prev => {
            const filteredPrev = prev.filter(t => typeof t.id === 'number' && t.id > 1000 || typeof t.id === 'string');
            return [newTicket, ...filteredPrev].slice(0, 5);
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-muted text-sm font-semibold">Sinkronisasi Dashboard...</div>;
  }

  // Format Pemetaan Data List Tiket untuk UI Component
  const recentTickets = tiket.map(t => ({
    id: `TK-${String(t.id).padStart(4, '0')}`,
    title: t.judul || t.deskripsi || 'Laporan Kerusakan Fasilitas',
    unit: t.unit?.nomor_unit ? `Unit ${t.unit.nomor_unit}` : 'Fasilitas Umum',
    date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: t.status || 'Proses',
    foto_url: t.foto_url || null // Menangkap kolom foto dari database
  }));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Banner */}
      <div className="bg-[#111111] rounded-3xl p-6 text-[#FAF6F0] shadow-soft relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-white/5 pointer-events-none"></div>
        
        <div>
          <h3 className="text-xl font-bold text-[#FAF6F0] mb-1">Halo, {userName}!</h3>
          <p className="text-sm text-[#D8D2CC]">
            Ada <strong className="text-[#FFFFFF]">{stats[0].value} tiket baru</strong> yang berstatus menunggu dan perlu segera ditinjau hari ini.
          </p>
        </div>
        <Link 
          to="/pemeliharaan/tiket" 
          className="btn-soft btn-sm flex items-center gap-1.5 border-none hover:bg-white transition text-xs font-bold"
        >
          <span>Kelola Semua Tiket</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
          const cardClass = cardColors[idx % 4];
          return (
            <div 
              key={idx} 
              className={`${cardClass} flex flex-col justify-between hover:shadow-soft transition duration-200`}
            >
              <div>
                <p className="text-[#8A857F] font-semibold text-xs tracking-wider uppercase">{stat.title}</p>
                <h4 className="text-[#1E1E1E] font-black text-2xl mt-2 mb-1">{stat.value}</h4>
              </div>
              <div className="text-xs font-semibold mt-1">
                {idx === 2 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' }}>
                    {stat.subtitle}
                  </span>
                ) : (
                  <span className="text-[#8A857F] font-medium">{stat.subtitle}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets Section */}
      <div className="card-section p-6 flex flex-col bg-white border border-soft rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-soft mb-5">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Tiket Aktif Terkini</h3>
          <Link 
            to="/pemeliharaan/tiket" 
            className="text-xs font-bold text-ink hover:underline transition flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Ticket List dengan Layout Opsi 1 (Thumbnail Foto Bukti Kerusakan) */}
        <div className="space-y-4">
          {recentTickets.map((ticket, idx) => {
            const listColors = ['card-pink', 'card-lavender', 'card-yellow'];
            const listBadgeStyles = [
              { backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' },
              { backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' },
              { backgroundColor: 'rgba(252,214,165,0.6)', color: '#A05820' }
            ];
            const cardClass = listColors[idx % 3];
            const badgeStyle = listBadgeStyles[idx % 3];

            return (
              <div 
                key={ticket.id} 
                className={`${cardClass} group hover:shadow-soft transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Sisi Kiri: Gabungan Foto Thumbnail + Deskripsi Tiket */}
                <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                  
                  {/* METODE OPSI 1: ELEMEN FOTO BUKTI */}
                  {ticket.foto_url ? (
                    <img 
                      src={ticket.foto_url} 
                      alt="Bukti Kerusakan" 
                      className="w-16 h-16 rounded-xl object-cover border border-soft shadow-sm bg-white cursor-zoom-in transition transform hover:scale-105"
                      onClick={() => window.open(ticket.foto_url, '_blank')}
                      title="Klik untuk melihat ukuran penuh"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100/70 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center text-[10px] text-gray-400 font-bold px-1 select-none">
                      <span>Tidak Ada</span>
                      <span>Foto</span>
                    </div>
                  )}

                  {/* Teks Informasi Laporan */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8A857F]">{ticket.id}</span>
                      <span className="badge-base font-bold text-[10px] px-2 py-0.5 rounded" style={badgeStyle}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#1E1E1E] text-base group-hover:underline transition duration-150 line-clamp-1">
                      {ticket.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8A857F]">
                      {/* Info Nomor Unit */}
                      <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-[#C05040]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[#1E1E1E]">{ticket.unit}</span>
                      </div>
                      
                      {/* Info Tanggal Lapor */}
                      <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Dilaporkan: {ticket.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sisi Kanan: Action Button */}
                <div className="flex items-center justify-end md:self-center">
                  <Link 
                    to="/pemeliharaan/tiket" 
                    className="btn-soft btn-sm text-xs font-bold border border-soft bg-white hover:bg-gray-50 px-4 py-2 rounded-xl shadow-sm transition"
                  >
                    Detail Tiket
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}