import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function RiwayatPerbaikan() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), teknisi:users!ditugaskan_ke(nama), unit(nomor_unit)')
          .eq('status', 'selesai')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map(row => {
            let durasi = '—';
            if (row.created_at && row.updated_at) {
              const diffMs = new Date(row.updated_at) - new Date(row.created_at);
              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
              durasi = diffHrs < 24 ? `${diffHrs} jam` : `${Math.floor(diffHrs / 24)} hari`;
            }
            return {
              id: `TK-${String(row.id).padStart(4, '0')}`,
              kerusakan: row.judul || row.deskripsi || 'Tidak ada keterangan',
              unit: row.unit?.nomor_unit ? `${row.unit.nomor_unit}` : 'Umum',
              teknisi: row.teknisi?.nama || 'Tidak ada',
              selesai: row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
              durasi,
              status: 'Selesai'
            };
          });
          setHistoryData(mapped);
        }
      } catch (err) {
        console.error('Error fetching repair history:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

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

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

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
