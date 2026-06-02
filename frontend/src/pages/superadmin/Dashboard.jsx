import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
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
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('2026');

  // Hardcoded data for 6 Months BarChart (values in Millions / Jt)
  const barChartData = [
    { name: 'Okt', Pendapatan: 270, Pengeluaran: 125 },
    { name: 'Nov', Pendapatan: 280, Pengeluaran: 130 },
    { name: 'Des', Pendapatan: 260, Pengeluaran: 120 },
    { name: 'Jan', Pendapatan: 294, Pengeluaran: 120 },
    { name: 'Feb', Pendapatan: 302, Pengeluaran: 125 },
    { name: 'Mar', Pendapatan: 293, Pengeluaran: 132 }
  ];

  // IPL Payment Donut PieChart Data
  const pieChartData = [
    { name: 'Lunas', value: 78, count: 322, color: '#B5EAD7' },
    { name: 'Belum Bayar', value: 13, count: 58, color: '#FCD6A5' },
    { name: 'Tunggakan', value: 9, count: 32, color: '#F9C3BA' }
  ];

  const adminActivities = [
    { time: '09:42', admin: 'Rina K.', division: 'Keuangan', activity: 'Generate tagihan IPL April 2026 (440 unit)', status: 'Selesai' },
    { time: '09:15', admin: 'Doni P.', division: 'Pemeliharaan', activity: 'Assign teknisi Roni ke tiket #TK-0088', status: 'Proses' },
    { time: '08:55', admin: 'Agus W.', division: 'Keamanan', activity: 'Broadcast pesan darurat — Lift Tower B', status: 'Terkirim' },
    { time: '08:30', admin: 'Sistem', division: 'Otomatis', activity: 'Auto rekonsiliasi payment gateway', status: 'Selesai' }
  ];

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'badge-lavender';
      case 'Pemeliharaan': return 'badge-yellow';
      case 'Keamanan': return 'badge-mint';
      default: return 'badge-gray';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Selesai': return 'badge-mint';
      case 'Proses': return 'badge-yellow';
      case 'Terkirim': return 'badge-lavender';
      default: return 'badge-gray';
    }
  };

  const formatRupiahYAxis = (value) => {
    return `Rp ${value} Jt`;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-pink flex flex-col justify-between min-h-[120px] hover:translate-y-[-2px] transition duration-150">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Total Pendapatan IPL</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">Rp 248 Jt</p>
          </div>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' }}>
            +12% vs bulan lalu
          </span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[120px] hover:translate-y-[-2px] transition duration-150">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Total Pengeluaran</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">Rp 142 Jt</p>
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">Bulan April 2026</span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[120px] hover:translate-y-[-2px] transition duration-150">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Penghuni Aktif</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">412</p>
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">dari 440 unit</span>
        </div>

        <div className="card-mint flex flex-col justify-between min-h-[120px] hover:translate-y-[-2px] transition duration-150">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Tiket Belum Selesai</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">18</p>
          </div>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(181,234,215,0.6)', color: '#187050' }}>
            2 urgent
          </span>
        </div>
      </div>

      {/* Main Charts Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left - 6 Months Income vs Expenses Bar Chart (60%) */}
        <div className="lg:col-span-6 card-section p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-soft pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Pendapatan & Pengeluaran 6 Bulan
              </h3>
              <p className="text-[10px] text-muted font-bold mt-0.5">Operasional Finansial SiManTap</p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-1 px-3 w-24"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(30,30,30,0.06)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }}
                />
                <YAxis 
                  tickFormatter={formatRupiahYAxis} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }}
                />
                <Tooltip 
                  formatter={(value) => [`Rp ${value} Jt`]}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(30,30,30,0.08)', boxShadow: '0 8px 24px rgba(30,30,30,0.06)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar dataKey="Pendapatan" fill="#C6C1F7" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Pengeluaran" fill="#F9C3BA" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right - Pie Donut & Absensi (40%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card A: Donut PieChart */}
          <div className="card-section p-6 flex flex-col">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3 mb-3">
              Status Pembayaran IPL
            </h4>
            
            <div className="flex items-center justify-between gap-2.5">
              <div className="relative w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={56}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-ink">78%</span>
                  <span className="text-[9px] font-bold text-muted uppercase tracking-tight">Lunas</span>
                </div>
              </div>

              {/* Legend right */}
              <div className="space-y-2 flex-1">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px] font-bold text-ink">
                    <span 
                      className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <div className="leading-tight">
                      <p className="text-ink">{item.name} ({item.value}%)</p>
                      <p className="text-muted font-bold text-[9px]">{item.count} unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card B: Absensi Progress Bars */}
          <div className="card-section p-6 space-y-4">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
              Absensi Karyawan Hari Ini
            </h4>

            <div className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink">
                  <span>Hadir (34 org)</span>
                  <span>89%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-mint" style={{ width: '89%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink">
                  <span>Izin/Sakit (4 org)</span>
                  <span>11%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill progress-pink" style={{ width: '11%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Activity Audit Trail Table */}
      <div className="card-section p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-soft pb-4">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Aktivitas Admin Terkini
            </h3>
            <p className="text-xs text-muted mt-0.5">Audit log dari aktivitas operator admin divisi</p>
          </div>
          <button
            onClick={() => navigate('/super-admin/audit')}
            className="text-xs font-bold text-ink hover:underline flex items-center gap-0.5 transition"
          >
            <span>Lihat Audit Log</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Divisi</th>
                <th>Aktivitas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {adminActivities.map((act, idx) => (
                <tr key={idx}>
                  <td className="text-muted font-mono font-semibold">{act.time}</td>
                  <td className="font-bold text-ink">{act.admin}</td>
                  <td>
                    <span className={`badge-base ${getDivisionBadgeClass(act.division)}`}>
                      {act.division}
                    </span>
                  </td>
                  <td className="text-ink font-medium">{act.activity}</td>
                  <td>
                    <span className={`badge-base ${getStatusBadgeClass(act.status)}`}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
