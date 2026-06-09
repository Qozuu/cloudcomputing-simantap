import React from 'react';

export default function LaporanKeuangan() {
  const pendapatanData = [
    { bulan: 'Januari 2026', target: 'Rp 286 Jt', realisasi: 'Rp 252 Jt', parkir: 'Rp 30 Jt', fasilitas: 'Rp 12 Jt', total: 'Rp 294 Jt', pct: 88.1 },
    { bulan: 'Februari 2026', target: 'Rp 286 Jt', realisasi: 'Rp 258 Jt', parkir: 'Rp 31 Jt', fasilitas: 'Rp 13 Jt', total: 'Rp 302 Jt', pct: 90.2 },
    { bulan: 'Maret 2026', target: 'Rp 286 Jt', realisasi: 'Rp 246 Jt', parkir: 'Rp 33 Jt', fasilitas: 'Rp 14 Jt', total: 'Rp 293 Jt', pct: 86.0 }
  ];

  const pengeluaranData = [
    { bulan: 'Januari 2026', sdm: 'Rp 68 Jt', operasional: 'Rp 22 Jt', perbaikan: 'Rp 18 Jt', kebersihan: 'Rp 12 Jt', total: 'Rp 120 Jt' },
    { bulan: 'Februari 2026', sdm: 'Rp 68 Jt', operasional: 'Rp 24 Jt', perbaikan: 'Rp 21 Jt', kebersihan: 'Rp 12 Jt', total: 'Rp 125 Jt' },
    { bulan: 'Maret 2026', sdm: 'Rp 60 Jt', operasional: 'Rp 25 Jt', perbaikan: 'Rp 26 Jt', kebersihan: 'Rp 13 Jt', total: 'Rp 132 Jt' }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-pink flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Total Pendapatan Q1</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">Rp 842 Jt</h4>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' }}>
            +9.4% vs Q4 2024
          </span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Total Pengeluaran Q1</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">Rp 410 Jt</h4>
          <span className="text-[#8A857F] font-semibold text-xs mt-3 block">Operasional + Perbaikan + SDM</span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Laba Bersih Q1</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">Rp 432 Jt</h4>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' }}>
            +15.2%
          </span>
        </div>
      </div>

      {/* Table 1: Laporan Pendapatan */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Laporan Pendapatan per Bulan — Q1 2026
          </h3>
          <p className="text-xs text-muted mt-0.5">Rincian penerimaan dana dari IPL, parkir, dan reservasi fasilitas</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Target IPL</th>
                <th>Realisasi IPL</th>
                <th>Parkir</th>
                <th>Fasilitas</th>
                <th>Total Pendapatan</th>
                <th>% Target</th>
              </tr>
            </thead>
            <tbody>
              {pendapatanData.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-ink">{row.bulan}</td>
                  <td className="font-mono text-muted">{row.target}</td>
                  <td className="font-mono text-ink">{row.realisasi}</td>
                  <td className="font-mono text-muted">{row.parkir}</td>
                  <td className="font-mono text-muted">{row.fasilitas}</td>
                  <td className="font-mono text-ink font-bold">{row.total}</td>
                  <td>
                    <span className={`badge-base ${
                      row.pct >= 90 
                        ? 'badge-mint' 
                        : 'badge-yellow'
                    }`}>
                      {row.pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Laporan Pengeluaran */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Laporan Pengeluaran per Bulan — Q1 2026
          </h3>
          <p className="text-xs text-muted mt-0.5">Rincian pengeluaran dana operasional, pemeliharaan fisik, dan upah SDM</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>SDM / Gaji</th>
                <th>Operasional</th>
                <th>Perbaikan</th>
                <th>Kebersihan</th>
                <th>Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaranData.map((row, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-ink">{row.bulan}</td>
                  <td className="font-mono text-muted">{row.sdm}</td>
                  <td className="font-mono text-muted">{row.operasional}</td>
                  <td className="font-mono text-muted">{row.perbaikan}</td>
                  <td className="font-mono text-muted">{row.kebersihan}</td>
                  <td className="font-mono text-ink font-bold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
