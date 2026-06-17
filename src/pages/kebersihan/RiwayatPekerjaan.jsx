import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function RiwayatPekerjaan() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    monthlyCompletion: 0,
    avgDuration: '—'
  });

  const [toastVisible, setToastVisible] = useState(false);

  // Fungsi format tanggal Indonesia
  const formatDateStr = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${dateObj.getDate()} ${monthsIndo[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Ambil data murni dari tabel 'jadwal' tanpa join tabel users
      const { data: dbData, error } = await supabase
        .from('jadwal')
        .select('*')
        .eq('jenis', 'kebersihan')
        .order('tanggal', { ascending: false });

      if (error) throw error;

      if (dbData) {
        const now = new Date();
        const currentMonth = now.getMonth(); 
        const currentYear = now.getFullYear();

        let monthlyCount = 0;
        let totalHours = 0;

        const formattedData = dbData.map((item) => {
          const itemDate = item.tanggal ? new Date(item.tanggal) : null;
          
          // Hitung tugas bulan berjalan
          if (itemDate && itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
            monthlyCount++;
          }

          // PARSING DATA MURNI DARI KOLOM CATATAN
          let displayOfficer = 'Tim Lapangan';
          let displayDuration = '5.0 jam';
          let durationNum = 5.0;

          if (item.catatan) {
            // Jika formatnya pakai pemisah "|" (contoh: "06:00-11:00 | Tim A")
            if (item.catatan.includes('|')) {
              const parts = item.catatan.split('|');
              displayOfficer = parts[1]?.trim() || displayOfficer; // Ambil nama tim setelah tanda "|"
              
              // Hitung durasi dari teks jam (sebelum tanda "|")
              const jamParts = parts[0].trim().split('-');
              if (jamParts.length === 2) {
                const startH = parseInt(jamParts[0].split(':')[0]);
                const endH = parseInt(jamParts[1].split(':')[0]);
                if (!isNaN(endH) && !isNaN(startH) && endH > startH) {
                  durationNum = endH - startH;
                }
              }
            } else {
              // Jika kolom catatan diisi murni nama tim saja tanpa jam
              displayOfficer = item.catatan.trim();
            }
          }
          
          displayDuration = `${durationNum}.0 jam`;
          totalHours += durationNum;

          return {
            id: `TGS-${String(item.id).substring(0, 4).toUpperCase()}`,
            area: item.area || 'Area Kompleks',
            officer: displayOfficer, // Mengambil isi teks dari kolom catatan
            service: item.area ? `Pembersihan ${item.area}` : 'General Cleaning',
            date: formatDateStr(item.tanggal),
            duration: displayDuration,
            status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Selesai'
          };
        });

        const avgHrs = formattedData.length > 0 ? (totalHours / formattedData.length).toFixed(1) : '0.0';

        setHistory(formattedData);
        setStats({
          totalTasks: formattedData.length,
          monthlyCompletion: monthlyCount,
          avgDuration: avgHrs
        });
      }
    } catch (err) {
      console.error('Gagal memuat riwayat:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleExport = () => {
    if (history.length === 0) return;
    const headers = ['ID Tugas', 'Area / Unit', 'Petugas / Tim', 'Layanan', 'Tanggal', 'Durasi', 'Status'];
    const rows = history.map(row => [row.id, `"${row.area}"`, `"${row.officer}"`, `"${row.service}"`, row.date, row.duration, row.status]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Log_Riwayat_Kebersihan.csv');
    link.click();
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  if (loading) return <div className="p-6 text-slate-500 text-sm animate-pulse">Menghubungkan ke tabel jadwal...</div>;

  return (
    <div className="space-y-6">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Tugas Terdata</p>
          <h4 className="text-purple-900 font-black text-2xl mt-1">{stats.totalTasks} Tugas</h4>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Penyelesaian Bulan Ini</p>
          <h4 className="text-emerald-900 font-black text-2xl mt-1">{stats.monthlyCompletion} Tugas</h4>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Rata-Rata Jam Kerja</p>
          <h4 className="text-rose-900 font-black text-2xl mt-1">{stats.avgDuration} Jam</h4>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900">Riwayat Pekerjaan Selesai</h2>
            <p className="text-xs text-slate-400 mt-0.5">Menampilkan data tim petugas langsung dari log catatan jadwal</p>
          </div>
          <button onClick={handleExport} className="bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm">
            Export Log (.csv)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="p-3.5">ID Tugas</th>
                <th className="p-3.5">Area / Unit</th>
                <th className="p-3.5">Petugas / Tim</th>
                <th className="p-3.5">Layanan</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Durasi Shift</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 font-semibold">{row.id}</td>
                  <td className="p-3.5 font-black text-slate-900">{row.area}</td>
                  <td className="p-3.5 font-bold text-purple-700">{row.officer}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{row.service}</td>
                  <td className="p-3.5 text-slate-500 font-medium">{row.date}</td>
                  <td className="p-3.5 font-mono text-slate-900 font-bold">{row.duration}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                    Belum ada data pekerjaan kebersihan di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}