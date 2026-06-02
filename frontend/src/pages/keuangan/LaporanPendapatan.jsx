import React, { useState } from 'react';
import { TrendingUp, FileDown, Calendar, Percent, CheckCircle, BarChart3, Filter } from 'lucide-react';

export default function LaporanPendapatan() {
  const [year, setYear] = useState('2026');
  const [quarter, setQuarter] = useState('Q1');
  const [successToast, setSuccessToast] = useState('');

  // Q1 Target vs Realisasi hardcoded data
  const revenueDataQ1 = [
    {
      month: 'Januari 2026',
      targetIpl: 338800000,
      realisasiIpl: 338800000,
      targetParkir: 66000000,
      realisasiParkir: 65200000,
      targetFasilitas: 15000000,
      realisasiFasilitas: 18450000,
    },
    {
      month: 'Februari 2026',
      targetIpl: 338800000,
      realisasiIpl: 336490000,
      targetParkir: 66000000,
      realisasiParkir: 67100000,
      targetFasilitas: 15000000,
      realisasiFasilitas: 12800000,
    },
    {
      month: 'Maret 2026',
      targetIpl: 338800000,
      realisasiIpl: 338800000,
      targetParkir: 66000000,
      realisasiParkir: 66800000,
      targetFasilitas: 15000000,
      realisasiFasilitas: 21950000,
    }
  ];

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Calculations for Q1
  const totals = revenueDataQ1.reduce((acc, row) => {
    const rowTargetTotal = row.targetIpl + row.targetParkir + row.targetFasilitas;
    const rowRealTotal = row.realisasiIpl + row.realisasiParkir + row.realisasiFasilitas;
    
    return {
      targetIpl: acc.targetIpl + row.targetIpl,
      realisasiIpl: acc.realisasiIpl + row.realisasiIpl,
      targetParkir: acc.targetParkir + row.targetParkir,
      realisasiParkir: acc.realisasiParkir + row.realisasiParkir,
      targetFasilitas: acc.targetFasilitas + row.targetFasilitas,
      realisasiFasilitas: acc.realisasiFasilitas + row.realisasiFasilitas,
      totalTarget: acc.totalTarget + rowTargetTotal,
      totalRealisasi: acc.totalRealisasi + rowRealTotal,
    };
  }, {
    targetIpl: 0, realisasiIpl: 0,
    targetParkir: 0, realisasiParkir: 0,
    targetFasilitas: 0, realisasiFasilitas: 0,
    totalTarget: 0, totalRealisasi: 0
  });

  const percentageAchieved = (totals.totalRealisasi / totals.totalTarget) * 100;

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filters Card */}
      <div className="card-section flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-ink font-bold text-xs bg-app-bg px-2.5 py-1.5 rounded-xl border border-soft">
            <Filter size={13} />
            <span>Filter Laporan:</span>
          </div>

          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-modern select-modern w-auto inline-block py-2 text-xs font-bold"
          >
            <option value="2026">Tahun Buku 2026</option>
            <option value="2025">Tahun Buku 2025</option>
          </select>

          {/* Quarter selector */}
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="input-modern select-modern w-auto inline-block py-2 text-xs font-bold"
          >
            <option value="Q1">Kuartal 1 (Jan - Mar)</option>
            <option value="Q2">Kuartal 2 (Apr - Jun) [Belum Berjalan]</option>
            <option value="Q3">Kuartal 3 (Jul - Sep) [Belum Berjalan]</option>
            <option value="Q4">Kuartal 4 (Okt - Des) [Belum Berjalan]</option>
          </select>
        </div>

        <button
          onClick={() => showToast('Mengekspor laporan pendapatan kuartal ke file PDF...')}
          className="btn-primary py-2.5 px-4 text-xs"
        >
          <FileDown size={14} />
          <span>Unduh Laporan Pendapatan (PDF)</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink */}
        <div className="card-pink flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Total Target Kuartal</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(totals.totalTarget)}</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Est. IPL, Parkir & Fasilitas</span>
        </div>

        {/* Card 2: Yellow */}
        <div className="card-yellow flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Total Realisasi Kuartal</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(totals.totalRealisasi)}</h4>
          </div>
          <div className="flex items-center gap-1 text-[#A05820] font-black text-[10px] mt-1">
            <TrendingUp size={10} />
            <span>99.8% terkumpul</span>
          </div>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Persentase Capaian</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{percentageAchieved.toFixed(2)}%</h4>
          </div>
          <div className="flex items-center gap-1 text-[#4840B0] font-black text-[10px] mt-1">
            <Percent size={10} />
            <span>Kinerja Kuartal Memuaskan</span>
          </div>
        </div>

        {/* Card 4: Mint */}
        <div className="card-mint flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Sisa Tunggakan Q1</span>
            <h4 className="text-[#C05040] font-black text-xl mt-1.5">{formatRupiah(totals.totalTarget - totals.totalRealisasi)}</h4>
          </div>
          <span className="text-[10px] text-[#C05040] font-bold mt-1">Menunggu rekonsiliasi</span>
        </div>
      </div>

      {/* Main Income breakdown comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table comparison columns */}
        <div className="card-section p-6 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-soft mb-5">
            <div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                Detail Realisasi Pendapatan Bulanan
              </h3>
              <p className="text-[11px] text-muted font-bold mt-0.5">
                Perbandingan data target anggaran dengan realisasi rekening apartemen
              </p>
            </div>
            <span className="badge-base badge-mint">
              Q1 Aktif
            </span>
          </div>

          <div className="table-wrap">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Sumber Pendapatan</th>
                  <th className="text-right">Target Anggaran</th>
                  <th className="text-right">Realisasi Lapangan</th>
                  <th className="text-right">Capaian</th>
                </tr>
              </thead>
              <tbody>
                {revenueDataQ1.flatMap((row, index) => {
                  const items = [
                    { label: 'IPL (Iuran Pengelola Lingkungan)', target: row.targetIpl, real: row.realisasiIpl },
                    { label: 'Sewa Parkir Bulanan', target: row.targetParkir, real: row.realisasiParkir },
                    { label: 'Pendapatan Fasilitas (Sewa)', target: row.targetFasilitas, real: row.realisasiFasilitas },
                  ];

                  return items.map((sub, sIdx) => {
                    const rowSpan = sIdx === 0 ? 3 : 0;
                    const isLast = sIdx === 2;
                    const percent = (sub.real / sub.target) * 100;
                    
                    return (
                      <tr key={`${index}-${sIdx}`} className={isLast ? 'border-b border-soft' : ''}>
                        {sIdx === 0 && (
                          <td className="p-3 text-ink font-bold border-r border-soft align-middle" rowSpan={rowSpan}>
                            {row.month}
                          </td>
                        )}
                        <td className="p-3 text-muted font-medium">{sub.label}</td>
                        <td className="p-3 text-right font-mono text-muted">{formatRupiah(sub.target)}</td>
                        <td className={`p-3 text-right font-mono font-bold ${sub.real >= sub.target ? 'text-[#187050]' : 'text-[#B06020]'}`}>
                          {formatRupiah(sub.real)}
                        </td>
                        <td className="p-3 text-right">
                          <span className={percent >= 100 ? 'badge-base badge-mint' : 'badge-base badge-yellow'}>
                            {percent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })}
                {/* Total Row */}
                <tr className="bg-app-bg font-extrabold text-ink border-t-2 border-soft">
                  <td className="p-3 font-bold" colSpan={2}>GRAND TOTAL (Q1)</td>
                  <td className="p-3 text-right font-mono text-muted">{formatRupiah(totals.totalTarget)}</td>
                  <td className="p-3 text-right font-mono text-ink">{formatRupiah(totals.totalRealisasi)}</td>
                  <td className="p-3 text-right">
                    <span className="badge-base badge-dark">
                      {percentageAchieved.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown side panel */}
        <div className="space-y-6">
          <div className="card-section p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
              Kinerja Tiap Sektor
            </h3>

            {/* Sector 1: IPL */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">Iuran Pengelola Lingkungan (IPL)</span>
                <span className="text-ink">{(totals.realisasiIpl / totals.targetIpl * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill progress-pink" 
                  style={{ width: `${Math.min(100, (totals.realisasiIpl / totals.targetIpl * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted font-bold">
                <span>Target: {formatRupiah(totals.targetIpl)}</span>
                <span>Real: {formatRupiah(totals.realisasiIpl)}</span>
              </div>
            </div>

            {/* Sector 2: Parkir */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">Sewa Parkir Bulanan</span>
                <span className="text-ink">{(totals.realisasiParkir / totals.targetParkir * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill progress-lavender" 
                  style={{ width: `${Math.min(100, (totals.realisasiParkir / totals.targetParkir * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted font-bold">
                <span>Target: {formatRupiah(totals.targetParkir)}</span>
                <span>Real: {formatRupiah(totals.realisasiParkir)}</span>
              </div>
            </div>

            {/* Sector 3: Fasilitas */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">Sewa Fasilitas Apartemen</span>
                <span className="text-[#187050]">{(totals.realisasiFasilitas / totals.targetFasilitas * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill progress-mint" 
                  style={{ width: `${Math.min(100, (totals.realisasiFasilitas / totals.targetFasilitas * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted font-bold">
                <span>Target: {formatRupiah(totals.targetFasilitas)}</span>
                <span className="text-[#187050]">Over-target!</span>
              </div>
            </div>
          </div>

          <div className="card-section p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-soft pb-3 flex items-center gap-1.5">
              <BarChart3 size={15} />
              <span>Catatan Keuangan Q1</span>
            </h3>
            <ul className="space-y-3 text-xs font-bold text-muted">
              <li className="flex gap-2.5 items-start">
                <CheckCircle size={14} className="text-[#187050] mt-0.5 flex-shrink-0" />
                <span>Pendapatan sewa fasilitas melampaui target sebesar <strong className="text-ink">117.7%</strong> berkat tingginya reservasi lapangan tenis & clubhouse di akhir pekan.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle size={14} className="text-[#187050] mt-0.5 flex-shrink-0" />
                <span>Penagihan IPL berjalan lancar dengan tingkat kedisiplinan pembayaran mencapai <strong className="text-ink">99.7%</strong>.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle size={14} className="text-[#B06020] mt-0.5 flex-shrink-0" />
                <span>Selisih pembayaran parkir di bulan Januari diselesaikan sepenuhnya pada penagihan bulan berikutnya.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Sukses</p>
            <p className="text-[10px] opacity-90 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
