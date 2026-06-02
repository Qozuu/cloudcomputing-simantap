import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardKeuangan() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Tagihan Bulan Ini',
      value: 'Rp 339 Jt',
      subtitle: '440 unit · Rp 770rb/unit avg',
      borderColor: 'border-l-[4px] border-l-[#F9C3BA]'
    },
    {
      title: 'Sudah Terbayar',
      value: 'Rp 248 Jt',
      badge: '+78.1% realisasi',
      badgeBg: 'badge-base badge-mint',
      borderColor: 'border-l-[4px] border-l-[#FCD6A5]'
    },
    {
      title: 'Menunggu',
      value: 'Rp 44.6 Jt',
      subtitle: '58 unit belum bayar',
      borderColor: 'border-l-[4px] border-l-[#C6C1F7]'
    },
    {
      title: 'Tunggakan',
      value: 'Rp 46.2 Jt',
      subtitle: '60 unit terlambat',
      borderColor: 'border-l-[4px] border-l-[#B5EAD7]'
    }
  ];

  const chartData = [
    { name: 'Okt', Pendapatan: 270 },
    { name: 'Nov', Pendapatan: 280 },
    { name: 'Des', Pendapatan: 260 },
    { name: 'Jan', Pendapatan: 294 },
    { name: 'Feb', Pendapatan: 302 },
    { name: 'Mar', Pendapatan: 293 }
  ];

  const expenses = [
    { label: 'SDM / Gaji', pct: 48, amount: 'Rp 68 Jt', color: 'progress-pink' },
    { label: 'Operasional', pct: 30, amount: 'Rp 42 Jt', color: 'progress-lavender' },
    { label: 'Perbaikan', pct: 22, amount: 'Rp 32 Jt', color: 'progress-mint' }
  ];

  const formatRupiahYAxis = (value) => {
    return `Rp ${value} Jt`;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const cardClasses = [
            'card-pink',
            'card-yellow',
            'card-lavender',
            'card-mint'
          ];
          const bgClass = cardClasses[idx % 4];
          
          return (
            <div
              key={idx}
              className={`${bgClass} flex flex-col justify-between min-h-[120px] transition hover:shadow-soft hover:scale-[1.01] duration-150`}
            >
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest leading-none">
                  {stat.title}
                </p>
                <p className="text-2xl font-black text-[#1E1E1E] leading-none mt-1">
                  {stat.value}
                </p>
              </div>
              
              <div className="mt-3">
                {stat.badge ? (
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    idx % 4 === 0 ? 'bg-[rgba(249,195,186,0.6)] text-[#C05040]' :
                    idx % 4 === 1 ? 'bg-[rgba(252,214,165,0.6)] text-[#A05820]' :
                    idx % 4 === 2 ? 'bg-[rgba(198,193,247,0.6)] text-[#4840B0]' :
                    'bg-[rgba(181,234,215,0.6)] text-[#187050]'
                  }`}>
                    {stat.badge}
                  </span>
                ) : (
                  <p className="text-xs text-[#8A857F] font-semibold">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left: 6 Months Income Bar Chart (60%) */}
        <div className="lg:col-span-6 card-section p-6 flex flex-col justify-between">
          <div className="border-b border-soft pb-4 mb-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Tren Pendapatan 6 Bulan
            </h3>
            <p className="text-[10px] text-muted font-bold mt-0.5">Akumulasi pendapatan IPL, parkir, dan fasilitas</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(30,30,30,0.05)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#8A857F' }}
                />
                <YAxis 
                  tickFormatter={formatRupiahYAxis} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#8A857F' }}
                  domain={[0, 400]}
                />
                <Tooltip 
                  formatter={(value) => [`Rp ${value} Jt`]}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(30,30,30,0.07)', background: '#FFFFFF', fontSize: '11px', fontWeight: 'bold' }}
                />
                {/* Single bar lavender color */}
                <Bar dataKey="Pendapatan" fill="#C6C1F7" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pengeluaran Progress Bars (40%) */}
        <div className="lg:col-span-4 card-section p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-soft pb-4 mb-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </h3>
            <Link
              to="/keuangan/expense"
              className="text-xs font-bold text-ink hover:text-muted transition flex items-center gap-0.5"
            >
              <span>Lihat Detail</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-5 py-2 flex-1 flex flex-col justify-center">
            {expenses.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-ink">
                  <span>{item.label}</span>
                  <span>{item.amount}</span>
                </div>
                <div className="progress-track">
                  <div 
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted font-bold tracking-tight text-right">{item.pct}% dari total pengeluaran</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
