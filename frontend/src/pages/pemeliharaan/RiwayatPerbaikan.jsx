import React, { useState } from 'react';

export default function RiwayatPerbaikan() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const historyData = [
    {
      id: 'TK-0085',
      kerusakan: 'Saklar lampu mati',
      unit: '05B',
      teknisi: 'Pak Heri',
      selesai: '18 Apr 2026',
      durasi: '3 jam',
      status: 'Selesai'
    },
    {
      id: 'TK-0071',
      kerusakan: 'Kran kamar mandi menetes',
      unit: '12A',
      teknisi: 'Pak Heri',
      selesai: '16 Mar 2026',
      durasi: '1 hari',
      status: 'Selesai'
    },
    {
      id: 'TK-0065',
      kerusakan: 'Saklar lampu mati',
      unit: '05B',
      teknisi: 'Pak Roni',
      selesai: '10 Mar 2026',
      durasi: '4 jam',
      status: 'Selesai'
    }
  ];

  const handleExport = () => {
    // Clear any existing timeout
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    setToastVisible(true);

    // Auto dismiss after 3 seconds
    const timeout = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
    setToastTimeoutId(timeout);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Riwayat Table Card */}
      <div className="card-section flex flex-col">
        
        {/* Card Header */}
        <div className="card-section-header">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Riwayat Perbaikan Selesai</h3>
          
          <button
            onClick={handleExport}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID TIKET</th>
                <th>KERUSAKAN</th>
                <th>UNIT</th>
                <th>TEKNISI</th>
                <th>SELESAI</th>
                <th>DURASI</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {historyData.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold text-ink">
                    {row.id}
                  </td>
                  <td className="font-bold text-ink">
                    {row.kerusakan}
                  </td>
                  <td className="text-muted font-bold">
                    {row.unit}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 font-bold">
                      <div className="avatar avatar-sm avatar-lavender shadow-sm">
                        {row.teknisi.charAt(4)}
                      </div>
                      <span className="text-ink">{row.teknisi}</span>
                    </div>
                  </td>
                  <td className="text-muted">
                    {row.selesai}
                  </td>
                  <td className="font-mono text-ink">
                    {row.durasi}
                  </td>
                  <td>
                    <span className="badge-base badge-mint">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Toast Notification Bottom-Right */}
      {toastVisible && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Ekspor Berhasil</p>
            <p className="text-[10px] text-gray-300">Data.xlsx berhasil diunduh!</p>
          </div>
        </div>
      )}
    </div>
  );
}
