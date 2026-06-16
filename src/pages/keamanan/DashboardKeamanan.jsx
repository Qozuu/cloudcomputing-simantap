import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  ShieldCheck,
  Megaphone,
  QrCode,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DashboardKeamanan() {
  const [recentTamu, setRecentTamu] = useState([]);
  const [stats, setStats] = useState([
    {
      title: 'Tamu Hari Ini',
      value: '0',
      subtitle: 'QR Code aktif',
      icon: Users,
      colorClass: 'stat-pink',
      textClass: 'text-[#B85040]'
    },
    {
      title: 'Kendaraan Parkir',
      value: '312',
      subtitle: 'dari 380 slot tersedia',
      icon: Car,
      colorClass: 'stat-yellow',
      textClass: 'text-[#A05820]'
    },
    {
      title: 'Insiden Hari Ini',
      value: '0',
      isBadge: true,
      badgeText: 'Aman',
      icon: ShieldCheck,
      colorClass: 'stat-lavender',
      textClass: 'text-[#4840B0]'
    },
    {
      title: 'Broadcast Terakhir',
      value: '—',
      subtitle: 'Tidak ada broadcast baru',
      icon: Megaphone,
      colorClass: 'stat-mint',
      textClass: 'text-[#187050]'
    }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch visitors di_dalam
        const { data: visitors } = await supabase
          .from('visitor')
          .select('*, unit_tujuan:unit(nomor_unit, tower(nama_tower))')
          .is('waktu_keluar', null)
          .order('waktu_masuk', { ascending: false })
          .limit(5);

        if (visitors) {
          const tamuFormatted = visitors.map(v => {
            const masukDate = new Date(v.waktu_masuk);
            const timeStr = masukDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return {
              id: v.id,
              name: v.nama_tamu,
              unit: v.unit_tujuan?.nomor_unit || '—',
              host: v.unit_tujuan?.tower?.nama_tower || '—',
              time: `Masuk ${timeStr}`,
              type: v.keperluan || 'Tamu pribadi'
            };
          });
          setRecentTamu(tamuFormatted);
        }

        // 2. Fetch active incidents
        const { data: incidents } = await supabase
          .from('incident')
          .select('*')
          .eq('status', 'aktif')
          .order('created_at', { ascending: false });

        const activeIncidentsCount = incidents?.length ?? 0;

        // 3. Fetch visitor di_dalam count for stats
        const { count: activeVisitorsCount } = await supabase
          .from('visitor')
          .select('id', { count: 'exact', head: true })
          .is('waktu_keluar', null);

        // 4. Fetch last broadcast
        const { data: broadcasts } = await supabase
          .from('informasi')
          .select('judul, created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        let lastBroadcastTitle = 'Tidak ada';
        let lastBroadcastTime = '—';
        if (broadcasts && broadcasts.length > 0) {
          lastBroadcastTitle = broadcasts[0].judul;
          const bcDate = new Date(broadcasts[0].created_at);
          const diffMs = new Date() - bcDate;
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHrs < 1) {
            lastBroadcastTime = 'Baru saja';
          } else if (diffHrs < 24) {
            lastBroadcastTime = `${diffHrs} jam lalu`;
          } else {
            lastBroadcastTime = `${Math.floor(diffHrs / 24)} hari lalu`;
          }
        }

        setStats(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], value: String(activeVisitorsCount ?? 0) };
          updated[2] = { 
            ...updated[2], 
            value: String(activeIncidentsCount),
            badgeText: activeIncidentsCount === 0 ? 'Aman' : 'Tindakan'
          };
          updated[3] = {
            ...updated[3],
            value: lastBroadcastTime,
            subtitle: lastBroadcastTitle
          };
          return updated;
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    }

    loadData();
  }, []);


  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
          const iconColors = ['card-icon-pink', 'card-icon-yellow', 'card-icon-lavender', 'card-icon-mint'];
          const badgeStyles = [
            { backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' },
            { backgroundColor: 'rgba(252,214,165,0.6)', color: '#A05820' },
            { backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' },
            { backgroundColor: 'rgba(181,234,215,0.6)', color: '#187050' }
          ];

          return (
            <div
              key={idx}
              className={`${cardColors[idx % 4]} flex flex-col justify-between min-h-[135px] transition hover:translate-y-[-2px] duration-150`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-[#8A857F] font-semibold text-xs">
                      {stat.title}
                    </p>
                    <div className={`${iconColors[idx % 4]}`}>
                      <IconComponent size={18} className="stroke-[2.5]" />
                    </div>
                  </div>
                  {stat.isBadge ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#1E1E1E] font-black text-2xl">{stat.value}</span>
                      <span className="badge-base" style={badgeStyles[idx % 4]}>
                        <ShieldCheck size={10} className="stroke-[3]" />
                        <span>{stat.badgeText}</span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#1E1E1E] font-black text-2xl mt-2">
                      {stat.value}
                    </p>
                  )}
                </div>
              </div>
              
              {stat.subtitle && (
                <p className="text-[#8A857F] font-semibold text-xs mt-2">
                  {stat.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Log Tamu Terkini Section */}
      <div className="card-section p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-soft pb-4">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Log Tamu Terkini
          </h3>
          <Link
            to="/keamanan/tamu"
            className="text-xs font-bold text-ink hover:underline flex items-center gap-0.5 transition"
          >
            <span>Lihat Semua</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-soft space-y-0.5">
          {recentTamu.map((tamu) => (
            <div
              key={tamu.id}
              className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group hover:bg-[#FAF6F0] px-3 rounded-2xl transition duration-150"
            >
              <div className="flex items-center gap-3.5">
                {/* Simulated QR square placeholder */}
                <div className="w-9 h-9 border border-soft rounded-xl flex items-center justify-center bg-[#FAF6F0] text-muted flex-shrink-0 group-hover:bg-white transition duration-150 shadow-sm">
                  <QrCode size={16} className="stroke-[1.5]" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-ink leading-snug group-hover:text-[#4840B0] transition">
                    {tamu.name}
                  </p>
                  <p className="text-[11px] text-muted font-medium leading-none">
                    Unit {tamu.unit} - {tamu.host} · <span className="text-ink font-semibold">{tamu.time}</span> · {tamu.type}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className="badge-base badge-mint">
                Di Dalam
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
