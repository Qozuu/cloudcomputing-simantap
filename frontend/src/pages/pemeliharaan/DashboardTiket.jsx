import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardTiket() {
  const stats = [
    {
      title: 'Tiket Urgent',
      value: '2',
      subtitle: 'Perlu segera ditangani',
      borderColor: 'border-coral',
      valueColor: 'text-coral'
    },
    {
      title: 'Dalam Proses',
      value: '8',
      subtitle: 'Teknisi sedang bekerja',
      borderColor: 'border-gold',
      valueColor: 'text-gold'
    },
    {
      title: 'Selesai Bulan Ini',
      value: '47',
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
      value: '1.2 hari',
      subtitle: 'Target: < 2 hari',
      borderColor: 'border-cream',
      valueColor: 'text-navy'
    }
  ];

  const recentTickets = [
    {
      id: 'TK-0088',
      title: 'AC bocor di Unit 18C',
      unit: 'Unit 18C',
      date: '21 Apr 2026',
      status: 'Urgent',
      statusClass: 'bg-coral text-white'
    },
    {
      id: 'TK-0087',
      title: 'Kran kamar mandi menetes',
      unit: 'Unit 12A',
      date: '20 Apr 2026',
      status: 'Proses',
      statusClass: 'bg-gold text-white'
    },
    {
      id: 'TK-0086',
      title: 'Pintu lift berbunyi',
      unit: 'Tower B',
      date: '19 Apr 2026',
      status: 'Proses',
      statusClass: 'bg-gold text-white'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Banner */}
      <div className="bg-[#111111] rounded-3xl p-6 text-[#FAF6F0] shadow-soft relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-white/5 pointer-events-none"></div>
        
        <div>
          <h3 className="text-xl font-bold text-[#FAF6F0] mb-1">Halo, Pak Doni!</h3>
          <p className="text-sm text-[#D8D2CC]">
            Ada <strong className="text-[#FFFFFF]">2 tiket urgent</strong> baru yang memerlukan penanganan segera hari ini.
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
