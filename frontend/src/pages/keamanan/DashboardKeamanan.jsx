import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Car,
  ShieldCheck,
  Megaphone,
  QrCode,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardKeamanan() {
  const stats = [
    {
      title: 'Tamu Hari Ini',
      value: '24',
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
      value: '2 jam',
      subtitle: 'Lift Tower B',
      icon: Megaphone,
      colorClass: 'stat-mint',
      textClass: 'text-[#187050]'
    }
  ];

  const recentTamu = [
    {
      id: 1,
      name: 'Budi Susanto',
      unit: '12A',
      host: 'Hendra G.',
      time: 'Masuk 09:30',
      type: 'Tamu pribadi'
    },
    {
      id: 2,
      name: 'Delivery JNE',
      unit: '05B',
      host: 'Maya S.',
      time: 'Masuk 09:15',
      type: 'Pengiriman paket'
    },
    {
      id: 3,
      name: 'Dr. Rina',
      unit: '18C',
      host: 'Rudi H.',
      time: 'Masuk 08:45',
      type: 'Kunjungan keluarga'
    }
  ];

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
