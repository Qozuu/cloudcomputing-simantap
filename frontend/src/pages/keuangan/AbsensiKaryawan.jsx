import React, { useState } from 'react';
import { UserCheck, Clock, UserX, Plus, X, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function AbsensiKaryawan() {
  const [logs, setLogs] = useState([
    { id: 1, name: 'Rina Kurnia', role: 'Supervisor Keuangan', date: '28 Mei 2026', checkIn: '07:45', checkOut: '17:00', status: 'Hadir', note: 'Absen pagi tepat waktu' },
    { id: 2, name: 'Ahmad Fauzi', role: 'Staff Kasir & EBilling', date: '28 Mei 2026', checkIn: '07:58', checkOut: '17:05', status: 'Hadir', note: 'Tepat waktu' },
    { id: 3, name: 'Sri Wahyuni', role: 'Staff Akunting & Pajak', date: '28 Mei 2026', checkIn: '08:15', checkOut: '—', status: 'Terlambat', note: 'Ban motor bocor dijalan' },
    { id: 4, name: 'Ahmad Fauzi', role: 'Staff Kasir & EBilling', date: '27 Mei 2026', checkIn: '07:50', checkOut: '17:00', status: 'Hadir', note: 'Tepat waktu' },
    { id: 5, name: 'Sri Wahyuni', role: 'Staff Akunting & Pajak', date: '27 Mei 2026', checkIn: '07:55', checkOut: '17:00', status: 'Hadir', note: 'Tepat waktu' },
    { id: 6, name: 'Rina Kurnia', role: 'Supervisor Keuangan', date: '27 Mei 2026', checkIn: '07:40', checkOut: '17:15', status: 'Hadir', note: 'Absen pagi tepat waktu' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [formName, setFormName] = useState('Ahmad Fauzi');
  const [formStatus, setFormStatus] = useState('Hadir');
  const [formCheckIn, setFormCheckIn] = useState('08:00');
  const [formCheckOut, setFormCheckOut] = useState('17:00');
  const [formNote, setFormNote] = useState('');

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleOpenModal = () => {
    setFormName('Ahmad Fauzi');
    setFormStatus('Hadir');
    setFormCheckIn('08:00');
    setFormCheckOut('17:00');
    setFormNote('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAbsensi = (e) => {
    e.preventDefault();

    const rolesMap = {
      'Rina Kurnia': 'Supervisor Keuangan',
      'Ahmad Fauzi': 'Staff Kasir & EBilling',
      'Sri Wahyuni': 'Staff Akunting & Pajak'
    };

    const newLog = {
      id: Date.now(),
      name: formName,
      role: rolesMap[formName] || 'Staff Keuangan',
      date: '28 Mei 2026', // Hari ini
      checkIn: formStatus === 'Alpa' || formStatus === 'Izin' || formStatus === 'Sakit' ? '—' : formCheckIn,
      checkOut: formStatus === 'Alpa' || formStatus === 'Izin' || formStatus === 'Sakit' ? '—' : formCheckOut,
      status: formStatus,
      note: formNote || (formStatus === 'Hadir' ? 'Tepat waktu' : formStatus)
    };

    setLogs(prev => [newLog, ...prev]);
    setIsModalOpen(false);
    showToast(`Berhasil mencatat absensi manual untuk ${formName}!`);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'Semua' || log.status === statusFilter || (statusFilter === 'Hadir' && log.status === 'Terlambat');
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || log.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-2 w-44"
            >
              <option value="Semua">Semua Status</option>
              <option value="Hadir">Hadir & Terlambat</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpa">Alpa</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-9 pr-4 py-2 text-xs font-semibold w-52"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          </div>
        </div>

        {/* Input Manual Trigger */}
        <button
          onClick={handleOpenModal}
          className="btn-primary btn-sm flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>Input Absensi Manual</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink */}
        <div className="card-pink flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Staf</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">3 Orang</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Divisi Keuangan</span>
          </div>
          <div className="card-icon-pink shadow-sm">
            <UserCheck size={18} />
          </div>
        </div>

        {/* Card 2: Yellow */}
        <div className="card-yellow flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Hadir Hari Ini</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">2 Orang</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Tepat waktu</span>
          </div>
          <div className="card-icon-yellow shadow-sm">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Terlambat</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">1 Orang</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Sri Wahyuni</span>
          </div>
          <div className="card-icon-lavender shadow-sm">
            <Clock size={18} />
          </div>
        </div>

        {/* Card 4: Mint */}
        <div className="card-mint flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Absen / Cuti</span>
            <h4 className="text-[#C05040] font-black text-2xl mt-1">0 Orang</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Kehadiran 100% Q1</span>
          </div>
          <div className="card-icon-mint shadow-sm">
            <UserX size={18} />
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Log Table */}
        <div className="card-section lg:col-span-2 flex flex-col">
          <div className="card-section-header">
            <div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                Log Kehadiran Staf Keuangan
              </h3>
              <p className="text-[11px] text-muted font-medium mt-0.5">
                Riwayat catatan absensi harian karyawan Divisi Keuangan
              </p>
            </div>
          </div>

          <div className="card-section-body p-0 overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nama Staf</th>
                  <th>Jabatan</th>
                  <th>Tanggal</th>
                  <th>Masuk</th>
                  <th>Keluar</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {filteredLogs.map((row) => (
                  <tr key={row.id}>
                    <td className="font-bold text-ink">{row.name}</td>
                    <td className="text-muted">{row.role}</td>
                    <td className="text-muted">{row.date}</td>
                    <td className="font-mono font-bold text-ink">{row.checkIn}</td>
                    <td className="font-mono text-muted">{row.checkOut}</td>
                    <td>
                      {row.status === 'Hadir' ? (
                        <span className="badge-base badge-mint">
                          Hadir
                        </span>
                      ) : row.status === 'Terlambat' ? (
                        <span className="badge-base badge-yellow">
                          Terlambat
                        </span>
                      ) : (
                        <span className="badge-base badge-pink">
                          {row.status}
                        </span>
                      )}
                    </td>
                    <td className="text-muted font-medium truncate max-w-[150px]" title={row.note}>
                      {row.note}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted font-bold">
                      Tidak ada catatan absensi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Rates Side Panel */}
        <div className="card-section p-6 flex flex-col space-y-5">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Tingkat Kehadiran Bulanan (Mei)
            </h3>
            <p className="text-[11px] text-muted font-medium mt-0.5">
              Rasio kehadiran berbanding hari kerja produktif
            </p>
          </div>

          <div className="space-y-4">
            {/* Rina Kurnia */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-ink">Rina Kurnia</span>
                <span className="text-ink">100%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-dark" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[10px] text-muted font-semibold">20 Hari Hadir · 0 Cuti/Alpa</p>
            </div>

            {/* Ahmad Fauzi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-ink">Ahmad Fauzi</span>
                <span className="text-ink">95%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-pink" style={{ width: '95%' }}></div>
              </div>
              <p className="text-[10px] text-muted font-semibold">19 Hari Hadir · 1 Izin Sakit</p>
            </div>

            {/* Sri Wahyuni */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-ink">Sri Wahyuni</span>
                <span className="text-ink">98%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-lavender" style={{ width: '98%' }}></div>
              </div>
              <p className="text-[10px] text-muted font-semibold">20 Hari Hadir (2 Terlambat)</p>
            </div>
          </div>

          <div className="pt-4 border-t border-soft text-[11px] text-muted font-semibold italic flex items-start gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ink mt-1.5 flex-shrink-0"></span>
            <span>Target standar kehadiran minimum Divisi Keuangan adalah 95%. Seluruh staf melampaui target KPI bulan ini.</span>
          </div>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-ink">Input Absensi Manual</h4>
                <p className="text-[10px] text-muted font-semibold">Catat data kehadiran luar kantor atau penyesuaian khusus</p>
              </div>
              <button onClick={handleCloseModal} className="text-muted hover:text-ink hover:bg-app-bg p-1.5 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAbsensi} className="modal-body space-y-4 text-xs font-bold text-gray-700">
              
              {/* Employee */}
              <div className="space-y-1.5">
                <label className="label-modern">Pilih Nama Karyawan</label>
                <select
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Ahmad Fauzi">Ahmad Fauzi - Staff Kasir & EBilling</option>
                  <option value="Sri Wahyuni">Sri Wahyuni - Staff Akunting & Pajak</option>
                  <option value="Rina Kurnia">Rina Kurnia - Supervisor Keuangan</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="label-modern">Status Kehadiran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir (Tepat Waktu)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin Terencana</option>
                  <option value="Sakit">Sakit (Dengan Surat Dokter)</option>
                  <option value="Alpa">Alpa (Tanpa Keterangan)</option>
                </select>
              </div>

              {/* Check-In & Out Timestamps (only visible if Present or Late) */}
              {(formStatus === 'Hadir' || formStatus === 'Terlambat') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-modern">Jam Masuk</label>
                    <input
                      type="text"
                      placeholder="Contoh: 08:00"
                      value={formCheckIn}
                      onChange={(e) => setFormCheckIn(e.target.value)}
                      className="input-modern font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-modern">Jam Keluar</label>
                    <input
                      type="text"
                      placeholder="Contoh: 17:00"
                      value={formCheckOut}
                      onChange={(e) => setFormCheckOut(e.target.value)}
                      className="input-modern font-mono font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="space-y-1.5">
                <label className="label-modern">Keterangan / Catatan Dokumen</label>
                <textarea
                  rows={2}
                  placeholder="Misalnya: Dinas luar kantor ke KPP Pratama / Keterangan Sakit"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="textarea-modern font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  Simpan Absensi
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
