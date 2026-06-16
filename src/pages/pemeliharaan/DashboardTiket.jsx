import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function DashboardTiket() {
  const [tiket, setTiket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Pak Doni');
  const [stats, setStats] = useState([
    {
      title: 'Tiket Urgent',
      value: '0',
      subtitle: 'Perlu segera ditangani',
      borderColor: 'border-coral',
      valueColor: 'text-coral'
    },
    {
      title: 'Dalam Proses',
      value: '0',
      subtitle: 'Teknisi sedang bekerja',
      borderColor: 'border-gold',
      valueColor: 'text-gold'
    },
    {
      title: 'Selesai Bulan Ini',
      value: '0',
      subtitle: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          ▲ 0% Baik
        </span>
      ),
      borderColor: 'border-navy',
      valueColor: 'text-navy'
    },
    {
      title: 'Avg Penyelesaian',
      value: '1.2 hari',
      subtitle: 'Target: < 2 hari',
      borderColor: 'border-cream',
      valueColor: 'text-[#1E1E1E]'
    }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get user details
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('nama').eq('id', user.id).single();
          if (profile?.nama) setUserName(profile.nama);
        }

        // Fetch recent tickets
        const { data: recent, error } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), unit(nomor_unit)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (recent) {
          setTiket(recent);
        }

        // Fetch stats
        const { data: allTickets } = await supabase.from('laporan').select('status, kategori, created_at, updated_at');
        if (allTickets) {
          const urgent = allTickets.filter(t => t.kategori === 'Urgent' || t.status?.toLowerCase() === 'urgent').length;
          const proses = allTickets.filter(t => t.status?.toLowerCase() === 'proses' || t.status?.toLowerCase() === 'menunggu').length;
          
          const now = new Date();
          const selesaiBulanIni = allTickets.filter(t => {
            if (t.status?.toLowerCase() !== 'selesai') return false;
            if (!t.updated_at) return false;
            const updatedDate = new Date(t.updated_at);
            return updatedDate.getMonth() === now.getMonth() && updatedDate.getFullYear() === now.getFullYear();
          }).length;

          // Calculate average resolution time
          const resolvedTickets = allTickets.filter(t => t.status?.toLowerCase() === 'selesai' && t.created_at && t.updated_at);
          let avgStr = '1.2 hari';
          if (resolvedTickets.length > 0) {
            const totalMs = resolvedTickets.reduce((acc, t) => acc + (new Date(t.updated_at) - new Date(t.created_at)), 0);
            const avgDays = (totalMs / (1000 * 60 * 60 * 24 * resolvedTickets.length)).toFixed(1);
            avgStr = `${avgDays} hari`;
          }

          setStats([
            {
              title: 'Tiket Urgent',
              value: String(urgent),
              subtitle: 'Perlu segera ditangani',
              borderColor: 'border-coral',
              valueColor: 'text-coral'
            },
            {
              title: 'Dalam Proses',
              value: String(proses),
              subtitle: 'Teknisi sedang bekerja',
              borderColor: 'border-gold',
              valueColor: 'text-gold'
            },
            {
              title: 'Selesai Bulan Ini',
              value: String(selesaiBulanIni),
              subtitle: (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  ▲ 12% Baik
                </span>
              ),
              borderColor: 'border-navy',
              valueColor: 'text-navy'
            },
            {
              title: 'Avg Penyelesaian',
              value: avgStr,
              subtitle: 'Target: < 2 hari',
              borderColor: 'border-cream',
              valueColor: 'text-[#1E1E1E]'
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading dashboard tiket:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to realtime changes
    const channel = supabase.channel('laporan-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'laporan' }, async (payload) => {
        // Fetch full ticket details including relations
        const { data: newTicket } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), unit(nomor_unit)')
          .eq('id', payload.new.id)
          .single();
        
        if (newTicket) {
          setTiket(prev => [newTicket, ...prev].slice(0, 5));
        } else {
          setTiket(prev => [payload.new, ...prev].slice(0, 5));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  const recentTickets = tiket.map(t => ({
    id: `TK-${String(t.id).padStart(4, '0')}`,
    title: t.judul || t.deskripsi || 'Tidak ada judul',
    unit: t.unit?.nomor_unit ? `Unit ${t.unit.nomor_unit}` : 'Umum',
    date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: t.status || 'Proses',
    statusClass: t.status?.toLowerCase() === 'urgent' ? 'bg-coral text-white' : 'bg-gold text-white'
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
            Ada <strong className="text-[#FFFFFF]">{stats[0].value} tiket urgent</strong> baru yang memerlukan penanganan segera hari ini.
          </p>
        </div>
        <Link 
          to="/pemeliharaan/tiket" 
          className="btn-soft btn-sm flex items-center gap-1.5 border-none hover:bg-white transition"
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
                <p className="text-[#8A857F] font-semibold text-xs">{stat.title}</p>
                <h4 className="text-[#1E1E1E] font-black text-2xl mt-2 mb-1">{stat.value}</h4>
              </div>
              <div className="text-xs font-semibold mt-1">
                {idx === 2 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' }}>
                    ▲ 12% Baik
                  </span>
                ) : (
                  <span className="text-[#8A857F]">{stat.subtitle}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets Section */}
      <div className="card-section p-6 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-soft mb-5">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider font-serif">Tiket Aktif Terkini</h3>
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

        {/* Ticket List */}
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8A857F]">{ticket.id}</span>
                    <span className="badge-base" style={badgeStyle}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#1E1E1E] text-base group-hover:underline transition duration-150">
                    {ticket.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8A857F]">
                    {/* Unit info with custom warning/fire icon */}
                    <div className="flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4 text-[#C05040]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[#1E1E1E]">{ticket.unit}</span>
                    </div>
                    
                    {/* Calendar info with calendar icon */}
                    <div className="flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Dilaporkan: {ticket.date}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-end">
                  <Link 
                    to="/pemeliharaan/tiket" 
                    className="btn-soft btn-sm text-xs font-bold"
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
