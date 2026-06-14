import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export default function GrafikMonitoring() {
  const [timeFilter, setTimeFilter] = useState('6 Bulan Terakhir');

  const monitoringData = [
    { name: 'Okt', Pendapatan: 270, Pengeluaran: 125, Laba: 145, Kehadiran: 88 },
    { name: 'Nov', Pendapatan: 280, Pengeluaran: 130, Laba: 150, Kehadiran: 90 },
    { name: 'Des', Pendapatan: 260, Pengeluaran: 120, Laba: 140, Kehadiran: 91 },
    { name: 'Jan', Pendapatan: 294, Pengeluaran: 120, Laba: 174, Kehadiran: 91 },
    { name: 'Feb', Pendapatan: 302, Pengeluaran: 125, Laba: 177, Kehadiran: 92 },
    { name: 'Mar', Pendapatan: 293, Pengeluaran: 132, Laba: 161, Kehadiran: 91 }
  ];

  const pieData = [
    { name: 'SDM/Gaji', value: 48, amount: 'Rp 68 Jt', color: '#4840B0' },
    { name: 'Operasional', value: 30, amount: 'Rp 42 Jt', color: '#A05820' },
    { name: 'Perbaikan', value: 22, amount: 'Rp 32 Jt', color: '#B85040' }
  ];

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Header */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">Grafik Monitoring Terintegrasi</h2>
          <p className="text-xs text-[#8A857F] font-medium mt-0.5">Analisis korelasi data finansial, absensi karyawan, dan kinerja apartemen</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
          >
            <option value="6 Bulan Terakhir">6 Bulan Terakhir</option>
            <option value="1 Tahun Terakhir">1 Tahun Terakhir</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card-pink flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Pendapatan</p>
            <p className="text-lg font-black text-[#1E1E1E]">Rp 842 Jt</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={10} /> +9.4%
          </span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Pengeluaran</p>
            <p className="text-lg font-black text-[#1E1E1E]">Rp 410 Jt</p>
          </div>
          <span className="text-[10px] text-[#8A857F] font-bold flex items-center gap-0.5 mt-2">
            Stabil
          </span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Laba Bersih</p>
            <p className="text-lg font-black text-[#1E1E1E]">Rp 432 Jt</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={10} /> +15.2%
          </span>
        </div>

        <div className="card-mint flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Tiket</p>
            <p className="text-lg font-black text-[#1E1E1E]">195</p>
          </div>
          <span className="text-[10px] text-[#B85040] font-bold flex items-center gap-0.5 mt-2">
            <TrendingDown size={10} /> -9%
          </span>
        </div>

        <div className="card-pink flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Kehadiran Staff</p>
            <p className="text-lg font-black text-[#1E1E1E]">91.4%</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            Baik
          </span>
        </div>
      </div>

      {/* Recharts Master LineChart */}
      <div className="card-section p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
            Grafik Monitoring Keseluruhan — Semua Data Terintegrasi
          </h3>
          <p className="text-xs text-[#8A857F] font-medium mt-0.5">
            Pendapatan · Pengeluaran · Laba Bersih · Tiket Kerusakan · Kehadiran Karyawan dalam satu tampilan
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monitoringData}
              margin={{ top: 10, right: -10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E1" vertical={false} />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }}
              />
              <YAxis 
                yAxisId="financial" 
                tickFormatter={(v) => `Rp ${v} Jt`}
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#1E1E1E' }}
              />
              <YAxis 
                yAxisId="percentage" 
                orientation="right"
                tickFormatter={(v) => `${v}%`}
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }}
                domain={[80, 100]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid #EAE6E1', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                formatter={(value, name) => {
                  if (name === 'Kehadiran %') return [`${value}%`];
                  return [`Rp ${value} Jt`];
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
              <Line name="Pendapatan" type="monotone" dataKey="Pendapatan" stroke="#B85040" strokeWidth={3} yAxisId="financial" connectNulls dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line name="Pengeluaran" type="monotone" dataKey="Pengeluaran" stroke="#A05820" strokeWidth={2.5} yAxisId="financial" connectNulls dot={{ r: 3 }} />
              <Line name="Laba Bersih" type="monotone" dataKey="Laba" stroke="#187050" strokeWidth={2.5} yAxisId="financial" connectNulls dot={{ r: 3 }} />
              <Line name="Kehadiran %" type="monotone" dataKey="Kehadiran" stroke="#4840B0" strokeWidth={2} strokeDasharray="5 5" yAxisId="percentage" connectNulls dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-section p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border-b border-[#EAE6E1] pb-3 mb-4 font-serif">
              Komposisi Pengeluaran Bulan Ini
            </h4>
          </div>
          <div className="flex items-center justify-around gap-6 py-2">
            <div className="relative w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={64} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#1E1E1E]">142 Jt</span>
                <span className="text-[9px] font-bold text-[#8A857F] uppercase tracking-tight">Total</span>
              </div>
            </div>
            <div className="space-y-3 flex-1 max-w-[200px]">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-bold">
                  <span className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="leading-tight">
                    <p className="text-[#1E1E1E]">{item.name} ({item.value}%)</p>
                    <p className="text-[#8A857F] text-[10px] font-medium">{item.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-section p-6 space-y-5">
          <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border-b border-[#EAE6E1] pb-3 font-serif">
            Pendapatan per Sumber & Tower
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider block">Per Sumber Pendapatan</span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>IPL (Rp 605 Jt)</span><span>85%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill progress-lavender" style={{ width: '85%' }}></div></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>Parkir (Rp 110 Jt)</span><span>15%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill progress-pink" style={{ width: '15%' }}></div></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>Fasilitas (Rp 87 Jt)</span><span>5%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill progress-mint" style={{ width: '5%' }}></div></div>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#EAE6E1]">
              <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider block">Per Tower Gedung</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower A</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp 336 Jt</p>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower B</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp 310 Jt</p>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower C</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp 196 Jt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HR Attendance Rates */}
      <div className="card-section p-6 space-y-4">
        <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border-b border-[#EAE6E1] pb-3 font-serif">
          Kehadiran Karyawan per Divisi
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Keuangan', rate: 99, progressClass: 'progress-lavender' },
            { label: 'Pemeliharaan', rate: 93, progressClass: 'progress-pink' },
            { label: 'Keamanan', rate: 92, progressClass: 'progress-dark' },
            { label: 'Kebersihan', rate: 88, progressClass: 'progress-pink' },
            { label: 'Fasilitas', rate: 100, progressClass: 'progress-mint' }
          ].map((div, idx) => (
            <div key={idx} className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1] space-y-2">
              <span className="text-xs font-bold text-[#1E1E1E] block">{div.label}</span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-grow progress-track">
                  <div className={`progress-fill ${div.progressClass}`} style={{ width: `${div.rate}%` }} />
                </div>
                <span className="text-xs font-bold text-[#1E1E1E] flex-shrink-0">{div.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance & Ticketing Tren */}
      <div className="card-section p-6 space-y-5">
        <h4 className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider border-b border-[#EAE6E1] pb-3 font-serif">
          Tren Kerusakan Fasilitas
        </h4>
        <div className="bg-[#FEF7EC] border border-[#FCD6A5] rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-[#A05820] flex-shrink-0 mt-0.5" size={16} />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-[#A05820]">Rekomendasi Pemeliharaan</h5>
            <p className="text-[11px] text-[#A05820] font-semibold leading-normal">
              Aduan AC/Pendingin naik sebesar 34% di kuartal ini. Dipertimbangkan untuk melakukan perawatan massal di Tower A guna memangkas durasi downtime.
            </p>
          </div>
        </div>
        <div className="space-y-4 max-w-xl pt-1">
          {[
            { label: 'AC/Pendingin', tickets: 47, width: '90%', progressClass: 'progress-lavender' },
            { label: 'Pipa/Air', tickets: 29, width: '60%', progressClass: 'progress-pink' },
            { label: 'Listrik', tickets: 18, width: '40%', progressClass: 'progress-dark' },
            { label: 'Lift', tickets: 12, width: '25%', progressClass: 'progress-mint' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs font-bold">
              <span className="w-28 text-[#1E1E1E]">{item.label}</span>
              <div className="flex-1 progress-track">
                <div className={`progress-fill ${item.progressClass}`} style={{ width: item.width }} />
              </div>
              <span className="w-14 text-right text-[#8A857F] font-semibold">{item.tickets} tiket</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}