import React, { useState } from 'react';

export default function RiwayatPekerjaan() {
  const [history] = useState([
    { id: 'TGS-0199', area: 'Unit 12A', officer: 'Sri Mulyani', service: 'Deep cleaning', date: '21 Apr 2026', duration: '2.5 jam', status: 'Selesai' },
    { id: 'TGS-0198', area: 'Lobby Tower A', officer: 'Wati Lestari', service: 'Sapu & Pel Lantai', date: '21 Apr 2026', duration: '1.5 jam', status: 'Selesai' },
    { id: 'TGS-0197', area: 'Gym & Area Fasilitas', officer: 'Endah Susanti', service: 'Pembersihan Alat & Sanitasi', date: '20 Apr 2026', duration: '2.0 jam', status: 'Selesai' },
    { id: 'TGS-0196', area: 'Toilet Umum Lt.1', officer: 'Retna Seri', service: 'Disinfeksi & Sikat Lantai', date: '20 Apr 2026', duration: '1.0 jam', status: 'Selesai' }
  ]);

  const [toastVisible, setToastVisible] = useState(false);

  const handleExport = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Page header summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-lavender hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-lavender mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Pekerjaan</p>
            <h4 className="text-[#4840B0] font-black text-2xl mt-2 mb-1">199 Tugas</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Sejak awal tahun operasional</span>
        </div>

        <div className="card-mint hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-mint mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Penyelesaian Bulan Ini</p>
            <h4 className="text-[#187050] font-black text-2xl mt-2 mb-1">68 Tugas</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">100% tingkat kepuasan</span>
        </div>

        <div className="card-pink hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-pink mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Waktu Rata-Rata Kerja</p>
            <h4 className="text-[#C05040] font-black text-2xl mt-2 mb-1">1.8 Jam</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Efisiensi standar operasional</span>
        </div>
      </div>

      {/* Main card section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-5 border-b border-soft mb-6">
          <div>
            <h2 className="text-base font-extrabold text-ink">Riwayat Pekerjaan Selesai</h2>
            <p className="text-xs text-muted">Log riwayat tugas kebersihan terverifikasi</p>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
          >
            {/* Download Icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID Tugas</th>
                <th>Area / Unit</th>
                <th>Petugas</th>
                <th>Layanan</th>
                <th>Tanggal</th>
                <th>Durasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-muted font-semibold">{row.id}</td>
                  <td className="font-bold text-ink">{row.area}</td>
                  <td>{row.officer}</td>
                  <td className="text-ink font-medium">{row.service}</td>
                  <td className="text-muted">{row.date}</td>
                  <td className="font-mono text-muted">{row.duration}</td>
                  <td>
                    <span className="badge-base badge-mint">
                      <svg className="w-3 h-3 text-[#187050]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Toast */}
      {toastVisible && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Data.xlsx berhasil diunduh!</p>
          </div>
        </div>
      )}
    </div>
  );
}
