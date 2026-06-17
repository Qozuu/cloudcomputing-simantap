import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function GrafikMonitoring() {
  const [timeFilter, setTimeFilter] = useState('6 Bulan Terakhir');

  const [monitoringData, setMonitoringData] = useState([]);
  const [pieData, setPieData] = useState([]);
  
  const [totals, setTotals] = useState({
    totalPendapatan: 'Rp 842 Jt',
    totalPengeluaran: 'Rp 410 Jt',
    labaBersih: 'Rp 432 Jt',
    totalTiket: 195,
    kehadiranStaff: '91.4%'
  });

  const [sumberIPL, setSumberIPL] = useState(605);
  const [sumberParkir, setSumberParkir] = useState(110);
  const [sumberFasilitas, setSumberFasilitas] = useState(87);

  const [towerARevenue, setTowerARevenue] = useState(336);
  const [towerBRevenue, setTowerBRevenue] = useState(310);
  const [towerCRevenue, setTowerCRevenue] = useState(196);

  const [divisiAttendance, setDivisiAttendance] = useState([
    { label: 'Keuangan', rate: 99, progressClass: 'progress-lavender' },
    { label: 'Pemeliharaan', rate: 93, progressClass: 'progress-pink' },
    { label: 'Keamanan', rate: 92, progressClass: 'progress-dark' },
    { label: 'Kebersihan', rate: 88, progressClass: 'progress-pink' },
    { label: 'Fasilitas', rate: 100, progressClass: 'progress-mint' }
  ]);

  const [kerusakanFasilitas, setKerusakanFasilitas] = useState([
    { label: 'AC/Pendingin', tickets: 47, width: '90%', progressClass: 'progress-lavender' },
    { label: 'Pipa/Air', tickets: 29, width: '60%', progressClass: 'progress-pink' },
    { label: 'Listrik', tickets: 18, width: '40%', progressClass: 'progress-dark' },
    { label: 'Lift', tickets: 12, width: '25%', progressClass: 'progress-mint' }
  ]);

  useEffect(() => {
    async function loadAllData() {
      try {
        const { data: tagihanList } = await supabase
          .from('tagihan')
          .select('*, unit(tower(nama_tower))');

        const { data: pengeluaranList } = await supabase
          .from('pengeluaran')
          .select('nominal, kategori, tanggal');

        const { data: laporanList } = await supabase
          .from('laporan')
          .select('kategori, status');

        const { data: absensiList } = await supabase
          .from('absensi')
          .select('*, karyawan:users(role)');

        const ticketCounts = { AC: 0, Air: 0, Listrik: 0, Lift: 0 };
        let activeTickets = 0;
        if (laporanList) {
          laporanList.forEach(l => {
            if (l.status !== 'selesai') activeTickets++;
            const cat = (l.kategori || '').toLowerCase();
            if (cat.includes('ac') || cat.includes('pendingin')) ticketCounts.AC++;
            else if (cat.includes('air') || cat.includes('pipa') || cat.includes('kebocoran')) ticketCounts.Air++;
            else if (cat.includes('listrik')) ticketCounts.Listrik++;
            else if (cat.includes('lift') || cat.includes('elevator')) ticketCounts.Lift++;
          });
        }

        let sumIPL = 0;
        let sumParkir = 110000000;
        let sumFasilitas = 0;
        let revA = 0;
        let revB = 0;
        let revC = 0;

        if (tagihanList) {
          tagihanList.forEach(t => {
            if (t.status === 'sudah_bayar') {
              if (t.jenis === 'ipl') {
                sumIPL += t.jumlah || 0;
              } else if (t.jenis === 'fasilitas') {
                sumFasilitas += t.jumlah || 0;
              }
              const tName = t.unit?.tower?.nama_tower;
              if (tName === 'Tower A') revA += t.jumlah || 0;
              else if (tName === 'Tower B') revB += t.jumlah || 0;
              else if (tName === 'Tower C') revC += t.jumlah || 0;
            }
          });
        }

        const monthlyData = {};
        const monthsOrdered = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        const getMonthCode = (dateStr) => {
          const parts = dateStr.split('-');
          if (parts.length >= 2) {
            return monthsOrdered[parseInt(parts[1]) - 1];
          }
          return 'Jan';
        };

        if (tagihanList && tagihanList.length > 0) {
          tagihanList.forEach(t => {
            const rawPeriod = t.periode || '2026-04';
            const mCode = rawPeriod.includes('-') ? getMonthCode(rawPeriod) : rawPeriod.slice(0, 3);
            if (!monthlyData[mCode]) {
              monthlyData[mCode] = { Pendapatan: 0, Pengeluaran: 0, Laba: 0, Kehadiran: 90 };
            }
            if (t.status === 'sudah_bayar') {
              monthlyData[mCode].Pendapatan += (t.jumlah || 0) / 1000000;
            }
          });
        }

        if (pengeluaranList && pengeluaranList.length > 0) {
          pengeluaranList.forEach(p => {
            const mCode = p.tanggal ? getMonthCode(p.tanggal) : 'Jan';
            if (!monthlyData[mCode]) {
              monthlyData[mCode] = { Pendapatan: 0, Pengeluaran: 0, Laba: 0, Kehadiran: 90 };
            }
            monthlyData[mCode].Pengeluaran += (p.nominal || 0) / 1000000;
          });
        }

        Object.keys(monthlyData).forEach(k => {
          monthlyData[k].Laba = monthlyData[k].Pendapatan - monthlyData[k].Pengeluaran;
        });

        const mArray = Object.keys(monthlyData).map(k => ({
          name: k,
          Pendapatan: Math.round(monthlyData[k].Pendapatan),
          Pengeluaran: Math.round(monthlyData[k].Pengeluaran),
          Laba: Math.round(monthlyData[k].Laba),
          Kehadiran: Math.round(monthlyData[k].Kehadiran)
        }));

        if (mArray.length > 0) {
          setMonitoringData(mArray.slice(-6));
        } else {
          setMonitoringData([
            { name: 'Okt', Pendapatan: 270, Pengeluaran: 125, Laba: 145, Kehadiran: 88 },
            { name: 'Nov', Pendapatan: 280, Pengeluaran: 130, Laba: 150, Kehadiran: 90 },
            { name: 'Des', Pendapatan: 260, Pengeluaran: 120, Laba: 140, Kehadiran: 91 },
            { name: 'Jan', Pendapatan: 294, Pengeluaran: 120, Laba: 174, Kehadiran: 91 },
            { name: 'Feb', Pendapatan: 302, Pengeluaran: 125, Laba: 177, Kehadiran: 92 },
            { name: 'Mar', Pendapatan: 293, Pengeluaran: 132, Laba: 161, Kehadiran: 91 }
          ]);
        }

        let expSDM = 68000000;
        let expOperasional = 0;
        let expPerbaikan = 0;
        if (pengeluaranList && pengeluaranList.length > 0) {
          pengeluaranList.forEach(p => {
            if (p.kategori === 'operasional') expOperasional += p.nominal || 0;
            else if (p.kategori === 'perbaikan' || p.kategori === 'pemeliharaan') expPerbaikan += p.nominal || 0;
          });
        }

        const totalExp = expSDM + expOperasional + expPerbaikan;
        if (totalExp > 0) {
          setPieData([
            { name: 'SDM/Gaji', value: Math.round((expSDM / totalExp) * 100), amount: `Rp ${Math.round(expSDM / 1000000)} Jt`, color: '#4840B0' },
            { name: 'Operasional', value: Math.round((expOperasional / totalExp) * 100), amount: `Rp ${Math.round(expOperasional / 1000000)} Jt`, color: '#A05820' },
            { name: 'Perbaikan', value: Math.round((expPerbaikan / totalExp) * 100), amount: `Rp ${Math.round(expPerbaikan / 1000000)} Jt`, color: '#B85040' }
          ]);
        } else {
          setPieData([
            { name: 'SDM/Gaji', value: 48, amount: 'Rp 68 Jt', color: '#4840B0' },
            { name: 'Operasional', value: 30, amount: 'Rp 42 Jt', color: '#A05820' },
            { name: 'Perbaikan', value: 22, amount: 'Rp 32 Jt', color: '#B85040' }
          ]);
        }

        let totalHadirs = 0;
        let totalLogs = 0;
        const divCounts = {
          div_keuangan: { hadir: 0, total: 0 },
          div_pemeliharaan: { hadir: 0, total: 0 },
          div_keamanan: { hadir: 0, total: 0 },
          div_kebersihan: { hadir: 0, total: 0 },
          div_fasilitas: { hadir: 0, total: 0 },
          management: { hadir: 0, total: 0 }
        };

        if (absensiList) {
          absensiList.forEach(a => {
            const role = a.karyawan?.role || 'management';
            const isHadir = a.status === 'hadir';
            totalLogs++;
            if (isHadir) totalHadirs++;
            
            let key = role;
            if (!divCounts[key]) {
              divCounts[key] = { hadir: 0, total: 0 };
            }
            divCounts[key].total++;
            if (isHadir) {
              divCounts[key].hadir++;
            }
          });
        }

        const calcRate = (hadir, total, fallback) => {
          if (total === 0) return fallback;
          return Math.round((hadir / total) * 100);
        };

        const keuanganRate = calcRate(divCounts.div_keuangan?.hadir || 0, divCounts.div_keuangan?.total || 0, 99);
        const pemeliharaanRate = calcRate(divCounts.div_pemeliharaan?.hadir || 0, divCounts.div_pemeliharaan?.total || 0, 93);
        const keamananRate = calcRate(divCounts.div_keamanan?.hadir || 0, divCounts.div_keamanan?.total || 0, 92);
        const kebersihanRate = calcRate(divCounts.div_kebersihan?.hadir || 0, divCounts.div_kebersihan?.total || 0, 88);
        const managementRate = calcRate(divCounts.div_fasilitas?.hadir || 0, divCounts.div_fasilitas?.total || 0, 100);

        const avgRate = totalLogs > 0 ? ((totalHadirs / totalLogs) * 100).toFixed(1) + '%' : '91.4%';

        setDivisiAttendance([
          { label: 'Keuangan', rate: keuanganRate, progressClass: 'progress-lavender' },
          { label: 'Pemeliharaan', rate: pemeliharaanRate, progressClass: 'progress-pink' },
          { label: 'Keamanan', rate: keamananRate, progressClass: 'progress-dark' },
          { label: 'Kebersihan', rate: kebersihanRate, progressClass: 'progress-pink' },
          { label: 'Fasilitas', rate: managementRate, progressClass: 'progress-mint' }
        ]);

        const totalPendJt = Math.round((sumIPL + sumParkir + sumFasilitas) / 1000000);
        const totalPengJt = Math.round(totalExp / 1000000);
        setTotals({
          totalPendapatan: `Rp ${totalPendJt} Jt`,
          totalPengeluaran: `Rp ${totalPengJt} Jt`,
          labaBersih: `Rp ${totalPendJt - totalPengJt} Jt`,
          totalTiket: activeTickets || 195,
          kehadiranStaff: avgRate
        });

        setSumberIPL(Math.round(sumIPL / 1000000) || 605);
        setSumberFasilitas(Math.round(sumFasilitas / 1000000) || 87);
        setSumberParkir(Math.round(sumParkir / 1000000) || 110);

        if (revA > 0) setTowerARevenue(Math.round(revA / 1000000));
        if (revB > 0) setTowerBRevenue(Math.round(revB / 1000000));
        if (revC > 0) setTowerCRevenue(Math.round(revC / 1000000));

        const maxT = Math.max(1, ticketCounts.AC + ticketCounts.Air + ticketCounts.Listrik + ticketCounts.Lift);
        setKerusakanFasilitas([
          { label: 'AC/Pendingin', tickets: ticketCounts.AC || 47, width: `${Math.round(((ticketCounts.AC || 47) / maxT) * 100)}%`, progressClass: 'progress-lavender' },
          { label: 'Pipa/Air', tickets: ticketCounts.Air || 29, width: `${Math.round(((ticketCounts.Air || 29) / maxT) * 100)}%`, progressClass: 'progress-pink' },
          { label: 'Listrik', tickets: ticketCounts.Listrik || 18, width: `${Math.round(((ticketCounts.Listrik || 18) / maxT) * 100)}%`, progressClass: 'progress-dark' },
          { label: 'Lift', tickets: ticketCounts.Lift || 12, width: `${Math.round(((ticketCounts.Lift || 12) / maxT) * 100)}%`, progressClass: 'progress-mint' }
        ]);

      } catch (err) {
        console.error('Error loading monitoring data:', err);
      }
    }
    loadAllData();
  }, []);

  const totalSumber = (sumberIPL + sumberParkir + sumberFasilitas) || 1;
  const pctIPL = Math.round((sumberIPL / totalSumber) * 100);
  const pctParkir = Math.round((sumberParkir / totalSumber) * 100);
  const pctFasilitas = Math.round((sumberFasilitas / totalSumber) * 100);

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Header (Tombol Export PDF sudah dihapus) */}
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

      {/* KPI Stats Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card-pink flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Pendapatan</p>
            <p className="text-lg font-black text-[#1E1E1E]">{totals.totalPendapatan}</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={10} /> +9.4%
          </span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Pengeluaran</p>
            <p className="text-lg font-black text-[#1E1E1E]">{totals.totalPengeluaran}</p>
          </div>
          <span className="text-[10px] text-[#8A857F] font-bold flex items-center gap-0.5 mt-2">
            Stabil
          </span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Laba Bersih</p>
            <p className="text-lg font-black text-[#1E1E1E]">{totals.labaBersih}</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={10} /> +15.2%
          </span>
        </div>

        <div className="card-mint flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Total Tiket</p>
            <p className="text-lg font-black text-[#1E1E1E]">{totals.totalTiket}</p>
          </div>
          <span className="text-[10px] text-[#B85040] font-bold flex items-center gap-0.5 mt-2">
            <TrendingDown size={10} /> -9%
          </span>
        </div>

        <div className="card-pink flex flex-col justify-between min-h-[110px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs !mb-1">Kehadiran Staff</p>
            <p className="text-lg font-black text-[#1E1E1E]">{totals.kehadiranStaff}</p>
          </div>
          <span className="text-[10px] text-[#187050] font-bold flex items-center gap-0.5 mt-2">
            Baik
          </span>
        </div>
      </div>

      {/* Recharts Master LineChart with dual YAxis */}
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
              
              <Line 
                name="Pendapatan" 
                type="monotone" 
                dataKey="Pendapatan" 
                stroke="#B85040" 
                strokeWidth={3} 
                yAxisId="financial" 
                connectNulls 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                name="Pengeluaran" 
                type="monotone" 
                dataKey="Pengeluaran" 
                stroke="#A05820" 
                strokeWidth={2.5} 
                yAxisId="financial" 
                connectNulls 
                dot={{ r: 3 }} 
              />
              <Line 
                name="Laba Bersih" 
                type="monotone" 
                dataKey="Laba" 
                stroke="#187050" 
                strokeWidth={2.5} 
                yAxisId="financial" 
                connectNulls 
                dot={{ r: 3 }} 
              />
              <Line 
                name="Kehadiran %" 
                type="monotone" 
                dataKey="Kehadiran" 
                stroke="#4840B0" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                yAxisId="percentage" 
                connectNulls 
                dot={{ r: 3 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Donut Chart for Expense Composition */}
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
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={64}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#1E1E1E]">{totals.totalPengeluaran.replace('Rp ', '')}</span>
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

        {/* Right: Allocation Bars */}
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
                    <span>IPL (Rp {sumberIPL} Jt)</span>
                    <span>{pctIPL}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill progress-lavender" style={{ width: `${pctIPL}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>Parkir (Rp {sumberParkir} Jt)</span>
                    <span>{pctParkir}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill progress-pink" style={{ width: `${pctParkir}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#1E1E1E]">
                    <span>Fasilitas (Rp {sumberFasilitas} Jt)</span>
                    <span>{pctFasilitas}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill progress-mint" style={{ width: `${pctFasilitas}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#EAE6E1]">
              <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider block">Per Tower Gedung</span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower A</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp {towerARevenue} Jt</p>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower B</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp {towerBRevenue} Jt</p>
                </div>
                <div className="p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#EAE6E1]">
                  <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-wider">Tower C</p>
                  <p className="text-xs font-bold text-[#1E1E1E] mt-1">Rp {towerCRevenue} Jt</p>
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
          {divisiAttendance.map((div, idx) => (
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

        {/* Warning banner */}
        <div className="bg-[#FEF7EC] border border-[#FCD6A5] rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-[#A05820] flex-shrink-0 mt-0.5" size={16} />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-[#A05820]">Rekomendasi Pemeliharaan</h5>
            <p className="text-[11px] text-[#A05820] font-semibold leading-normal">
              Aduan AC/Pendingin naik sebesar 34% di kuartal ini. Dipertimbangkan untuk melakukan perawatan massal di Tower A guna memangkas durasi downtime.
            </p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-4 max-w-xl pt-1">
          {kerusakanFasilitas.map((item, idx) => (
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