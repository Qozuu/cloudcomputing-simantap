import React, { useState } from 'react';
import { Search, FileDown } from 'lucide-react';

export default function AuditLog() {
  const [logs] = useState([
    { id: 1, time: '09:42:13', admin: 'Rina K.', division: 'Keuangan', action: 'Generate Tagihan', detail: 'Tagihan IPL April 2026 - 440 unit', ip: '192.168.1.42', period: 'Hari Ini' },
    { id: 2, time: '09:15:07', admin: 'Doni P.', division: 'Pemeliharaan', action: 'Assign Teknisi', detail: 'TK-0088 → Pak Roni', ip: '192.168.1.35', period: 'Hari Ini' },
    { id: 3, time: '08:55:44', admin: 'Agus W.', division: 'Keamanan', action: 'Broadcast Darurat', detail: 'Lift Tower B bermasalah', ip: '192.168.1.33', period: 'Hari Ini' },
    { id: 4, time: '08:30:00', admin: 'Sistem', division: 'Otomatis', action: 'Auto Rekonsiliasi', detail: 'Midtrans payment gateway', ip: '127.0.0.1', period: 'Hari Ini' },
    { id: 5, time: '07:00:00', admin: 'Siti R.', division: 'Kebersihan', action: 'Update Jadwal', detail: 'Jadwal Minggu ke-14 2026', ip: '192.168.1.43', period: 'Hari Ini' },
    { id: 6, time: 'Kemarin, 14:20', admin: 'Budi S.', division: 'Management', action: 'Update Fasilitas', detail: 'Yoga Studio status → Maintenance', ip: '192.168.1.10', period: 'Minggu Ini' },
    { id: 7, time: '24 Mei, 11:05', admin: 'Agus W.', division: 'Keamanan', action: 'Hapus Tamu', detail: 'Log tamu luar dinonaktifkan', ip: '192.168.1.33', period: 'Minggu Ini' }
  ]);

  const [periodFilter, setPeriodFilter] = useState('Hari Ini');
  const [adminFilter, setAdminFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'badge-lavender';
      case 'Pemeliharaan': return 'badge-yellow';
      case 'Keamanan': return 'badge-mint';
      case 'Kebersihan': return 'badge-pink';
      case 'Management': return 'badge-dark';
      case 'Otomatis': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const handleExport = () => {
    setSuccessToast('Audit_Log_SiManTap.csv berhasil diexport!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesPeriod = periodFilter === 'Semua' || log.period === periodFilter;
    const matchesAdmin = adminFilter === 'Semua' || log.admin === adminFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPeriod && matchesAdmin && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filters row */}
      <div className="card-section p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Waktu:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-1 px-3 w-32"
            >
              <option value="Hari Ini">Hari Ini</option>
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Semua">Semua Waktu</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Operator:</span>
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-1 px-3 w-40"
            >
              <option value="Semua">Semua Admin</option>
              <option value="Rina K.">Rina K. (Keuangan)</option>
              <option value="Doni P.">Doni P. (Pemeliharaan)</option>
              <option value="Agus W.">Agus W. (Keamanan)</option>
              <option value="Siti R.">Siti R. (Kebersihan)</option>
              <option value="Sistem">Sistem (Otomatis)</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari aksi atau detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 input-modern font-semibold w-52"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          </div>
        </div>

        <button
          onClick={handleExport}
          className="btn-ghost py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <FileDown size={14} />
          <span>Export Log</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="pb-4 border-b border-soft mb-5">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Audit Log Aktivitas Sistem
          </h3>
          <p className="text-xs text-muted">Rekaman jejak digital dari perubahan data yang dilakukan oleh administrator</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>Divisi</th>
                <th>Aksi</th>
                <th>Detail</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-muted font-mono">{log.time}</td>
                    <td className="font-bold text-ink">{log.admin}</td>
                    <td>
                      <span className={`badge-base ${getDivisionBadgeClass(log.division)}`}>
                        {log.division}
                      </span>
                    </td>
                    <td className="font-bold text-ink">{log.action}</td>
                    <td className="text-muted font-semibold max-w-xs truncate">{log.detail}</td>
                    <td className="font-mono text-muted">{log.ip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted font-bold">
                    Tidak ada rekaman aktivitas yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
