import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function getLast6Months() {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleString('id-ID', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return result;
}

const fmtJuta = (v) => `Rp ${(v / 1_000_000).toFixed(0)} Jt`;
const fmtRupiah = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [unitCount, setUnitCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [tiketCount, setTiketCount] = useState(null);
  const [pendapatanBulanIni, setPendapatanBulanIni] = useState(null);
  const [pengeluaranBulanIni, setPengeluaranBulanIni] = useState(null);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [pctLunas, setPctLunas] = useState(0);
  const [absenHadir, setAbsenHadir] = useState(null);
  const [absenAbsen, setAbsenAbsen] = useState(null);
  const [totalKaryawan, setTotalKaryawan] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStatCards(), fetchBarChart(), fetchPieIPL(), fetchAbsensi()]);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Gagal memuat data. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function fetchStatCards() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const periodeStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const periodeEnd = new Date(year, month, 0).toISOString().split('T')[0];

    const [
      { count: uc, error: e1 },
      { count: usc, error: e2 },
      { count: tkt, error: e3 },
      { data: tagBulanIni, error: e4 },
      { data: penBulanIni, error: e5 },
    ] = await Promise.all([
      supabase.from('unit').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'penghuni').eq('is_active', true),
      supabase.from('laporan').select('id', { count: 'exact', head: true }).neq('status', 'selesai').neq('status', 'ditolak'),
      supabase.from('tagihan').select('jumlah').eq('status', 'sudah_bayar').gte('periode', periodeStart).lte('periode', periodeEnd),
      supabase.from('pengeluaran').select('nominal').gte('tanggal', periodeStart).lte('tanggal', periodeEnd),
    ]);

    if (e1 || e2 || e3 || e4 || e5) throw e1 ?? e2 ?? e3 ?? e4 ?? e5;

    setUnitCount(uc ?? 0);
    setUserCount(usc ?? 0);
    setTiketCount(tkt ?? 0);
    setPendapatanBulanIni((tagBulanIni ?? []).reduce((s, r) => s + Number(r.jumlah), 0));
    setPengeluaranBulanIni((penBulanIni ?? []).reduce((s, r) => s + Number(r.nominal), 0));
  }

  async function fetchBarChart() {
    const months = getLast6Months();
    const oldest = `${months[0].year}-${String(months[0].month).padStart(2, '0')}-01`;

    const [
      { data: tagihanRows, error: e1 },
      { data: pengeluaranRows, error: e2 },
    ] = await Promise.all([
      supabase.from('tagihan').select('jumlah, periode').eq('status', 'sudah_bayar').gte('periode', oldest),
      supabase.from('pengeluaran').select('nominal, tanggal').gte('tanggal', oldest),
    ]);

    if (e1 || e2) throw e1 ?? e2;

    const pendMap = {};
    const penMap = {};
    months.forEach(m => {
      pendMap[`${m.year}-${m.month}`] = 0;
      penMap[`${m.year}-${m.month}`] = 0;
    });

    (tagihanRows ?? []).forEach(row => {
      const d = new Date(row.periode);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (key in pendMap) pendMap[key] += Number(row.jumlah);
    });

    (pengeluaranRows ?? []).forEach(row => {
      const d = new Date(row.tanggal);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (key in penMap) penMap[key] += Number(row.nominal);
    });

    setBarChartData(months.map(m => ({
      name: m.label,
      Pendapatan: pendMap[`${m.year}-${m.month}`],
      Pengeluaran: penMap[`${m.year}-${m.month}`],
    })));
  }

  async function fetchPieIPL() {
    const { data, error } = await supabase.from('tagihan').select('status').eq('jenis', 'IPL');
    if (error) throw error;

    const rows = data ?? [];
    const total = rows.length;
    const counts = { sudah_bayar: 0, belum_bayar: 0, terlambat: 0 };
    rows.forEach(r => { if (r.status in counts) counts[r.status]++; });
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

    setPieChartData([
      { name: 'Lunas',       value: pct(counts.sudah_bayar), count: counts.sudah_bayar, color: '#B5EAD7' },
      { name: 'Belum Bayar', value: pct(counts.belum_bayar), count: counts.belum_bayar, color: '#FCD6A5' },
      { name: 'Tunggakan',   value: pct(counts.terlambat),   count: counts.terlambat,   color: '#F9C3BA' },
    ]);
    setPctLunas(pct(counts.sudah_bayar));
  }

  async function fetchAbsensi() {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalK, error: e1 },
      { data: rows, error: e2 },
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).neq('role', 'penghuni').eq('is_active', true),
      supabase.from('absensi').select('status').eq('tanggal', today),
    ]);

    if (e1 || e2) throw e1 ?? e2;

    const hadir = (rows ?? []).filter(r => r.status === 'hadir').length;
    setTotalKaryawan(totalK ?? 0);
    setAbsenHadir(hadir);
    setAbsenAbsen(Math.max(0, (totalK ?? 0) - hadir));
  }

  const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 gap-2">
        <AlertCircle size={18} />
        <span className="text-sm font-semibold">{error}</span>
        <button onClick={fetchAll} className="ml-4 px-3 py-1 text-xs bg-red-100 rounded-lg hover:bg-red-200 transition">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-pink flex flex-col justify-between min-h-[120px]">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Total Pendapatan IPL</p>
            {pendapatanBulanIni === null
              ? <Skeleton className="h-8 w-32 mt-1" />
              : <p className="text-[#1E1E1E] font-black text-2xl mt-1">{fmtJuta(pendapatanBulanIni)}</p>
            }
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">
            {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[120px]">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Total Pengeluaran</p>
            {pengeluaranBulanIni === null
              ? <Skeleton className="h-8 w-32 mt-1" />
              : <p className="text-[#1E1E1E] font-black text-2xl mt-1">{fmtJuta(pengeluaranBulanIni)}</p>
            }
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">
            {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[120px]">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Penghuni Aktif</p>
            {userCount === null
              ? <Skeleton className="h-8 w-20 mt-1" />
              : <p className="text-[#1E1E1E] font-black text-2xl mt-1">{userCount}</p>
            }
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">
            dari {unitCount ?? '…'} unit
          </span>
        </div>

        <div className="card-mint flex flex-col justify-between min-h-[120px]">
          <div className="space-y-1">
            <p className="text-[#8A857F] font-semibold text-xs">Tiket Komplain</p>
            {tiketCount === null
              ? <Skeleton className="h-8 w-16 mt-1" />
              : <p className="text-[#1E1E1E] font-black text-2xl mt-1">{tiketCount}</p>
            }
          </div>
          <span className="text-[#8A857F] font-semibold text-xs mt-2 block">Menunggu Tindakan</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

        {/* Bar Chart */}
        <div className="lg:col-span-6 card-section p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-soft pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Pendapatan & Pengeluaran 6 Bulan
              </h3>
              <p className="text-[10px] text-muted font-bold mt-0.5">Operasional Finansial SiManTap</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {loading || barChartData.length === 0
              ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted" size={28} /></div>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(30,30,30,0.06)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }} />
                    <YAxis tickFormatter={fmtJuta} tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#8A857F' }} width={80} />
                    <Tooltip
                      formatter={(value, name) => [fmtRupiah(value), name]}
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(30,30,30,0.08)', boxShadow: '0 8px 24px rgba(30,30,30,0.06)', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                    <Bar dataKey="Pendapatan"  fill="#C6C1F7" radius={[4,4,0,0]} barSize={16} />
                    <Bar dataKey="Pengeluaran" fill="#F9C3BA" radius={[4,4,0,0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Pie IPL */}
          <div className="card-section p-6 flex flex-col">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3 mb-3">
              Status Pembayaran IPL
            </h4>
            {loading || pieChartData.length === 0
              ? <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-muted" size={22} /></div>
              : (
                <div className="flex items-center justify-between gap-2.5">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={50} paddingAngle={4} dataKey="value">
                          {pieChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-ink">{pctLunas}%</span>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {pieChartData.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-ink">
                        <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="leading-tight">
                          <p>{item.name}</p>
                          <p className="text-muted text-[9px]">{item.count} unit · {item.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>

          {/* Absensi */}
          <div className="card-section p-6">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3 mb-4">
              Absensi Karyawan — Hari Ini
            </h4>
            {loading || absenHadir === null
              ? <div className="flex items-center justify-center h-20"><Loader2 className="animate-spin text-muted" size={22} /></div>
              : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#B5EAD7]/30 p-3 rounded-2xl border border-[#B5EAD7]/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-[#187050]" />
                        <span className="text-[10px] font-bold text-[#187050] uppercase">Hadir</span>
                      </div>
                      <p className="text-xl font-black text-[#1E1E1E]">{absenHadir}</p>
                    </div>
                    <div className="bg-[#F9C3BA]/30 p-3 rounded-2xl border border-[#F9C3BA]/50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={14} className="text-[#C05040]" />
                        <span className="text-[10px] font-bold text-[#C05040] uppercase">Belum Absen</span>
                      </div>
                      <p className="text-xl font-black text-[#1E1E1E]">{absenAbsen}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted font-bold mt-3 text-center uppercase tracking-widest">
                    Total {totalKaryawan} Karyawan Aktif
                  </p>
                </>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
}