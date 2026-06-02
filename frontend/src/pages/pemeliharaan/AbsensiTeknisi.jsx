import React, { useState } from 'react';

export default function AbsensiTeknisi() {
  // Initial attendance state
  const [attendance, setAttendance] = useState([
    { name: 'Doni Prasetya', role: 'Admin Pemeliharaan', checkIn: '07:55', checkOut: '-', status: 'Hadir' },
    { name: 'Agus Maulana', role: 'Teknisi Listrik', checkIn: '08:00', checkOut: '-', status: 'Hadir' },
    { name: 'Ridwan Saputra', role: 'Teknisi AC & Plumbing', checkIn: '07:50', checkOut: '-', status: 'Hadir' },
    { name: 'Fajar Kurniawan', role: 'Teknisi Lift & Mekanikal', checkIn: '-', checkOut: '-', status: 'Izin' },
    { name: 'Hendra Setiawan', role: 'Teknisi Umum', checkIn: '08:10', checkOut: '-', status: 'Hadir' },
    { name: 'Riko Prabowo', role: 'Teknisi Umum', checkIn: '07:58', checkOut: '-', status: 'Hadir' }
  ]);

  const [activeMonth, setActiveMonth] = useState('April 2026');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedTechIndex, setSelectedTechIndex] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');
  const [formStatus, setFormStatus] = useState('Hadir');

  const handleExport = () => {
    showToast('Absensi_Teknisi.xlsx berhasil diunduh!');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormName('');
    setFormRole('Teknisi Listrik');
    setFormCheckIn('08:00');
    setFormCheckOut('-');
    setFormStatus('Hadir');
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const tech = attendance[index];
    setModalMode('edit');
    setSelectedTechIndex(index);
    setFormName(tech.name);
    setFormRole(tech.role);
    setFormCheckIn(tech.checkIn);
    setFormCheckOut(tech.checkOut);
    setFormStatus(tech.status);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newRecord = {
        name: formName,
        role: formRole,
        checkIn: formStatus === 'Izin' ? '-' : formCheckIn,
        checkOut: formStatus === 'Izin' ? '-' : formCheckOut,
        status: formStatus
      };
      setAttendance([...attendance, newRecord]);
      showToast('Absensi berhasil dicatat');
    } else {
      const updated = [...attendance];
      updated[selectedTechIndex] = {
        name: formName,
        role: formRole,
        checkIn: formStatus === 'Izin' ? '-' : formCheckIn,
        checkOut: formStatus === 'Izin' ? '-' : formCheckOut,
        status: formStatus
      };
      setAttendance(updated);
      showToast('Data diedit');
    }
    setModalOpen(false);
  };

  // Stats calculations
  const totalTeknisi = attendance.length;
  const hadirCount = attendance.filter(a => a.status === 'Hadir').length;
  const izinCount = attendance.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
  const hadirPercentage = totalTeknisi > 0 ? ((hadirCount / totalTeknisi) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Month Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
            className="btn-ghost btn-sm flex items-center justify-between min-w-[140px] text-left"
          >
            <span>{activeMonth}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${monthDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {monthDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMonthDropdownOpen(false)}></div>
              <div className="absolute left-0 mt-2 w-44 bg-white border border-soft rounded-xl shadow-lg z-40 py-1.5 animate-scale-in">
                {['April 2026', 'Maret 2026'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setActiveMonth(m);
                      setMonthDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-app-bg transition ${
                      activeMonth === m ? 'text-ink bg-app-bg font-bold' : 'text-muted'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Catat Absensi</span>
          </button>
          
          <button
            onClick={handleExport}
            className="btn-ghost btn-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink */}
        <div className="card-pink flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Teknisi</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{totalTeknisi}</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Divisi Pemeliharaan</span>
          </div>
          <div className="card-icon-pink shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Yellow */}
        <div className="card-yellow flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Hadir Hari Ini</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{hadirCount}</h4>
            <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">{hadirPercentage}%</span>
          </div>
          <div className="card-icon-yellow shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Izin / Sakit</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1 text-[#C05040]">{izinCount}</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Hari ini</span>
          </div>
          <div className="card-icon-lavender shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Mint */}
        <div className="card-mint flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Rata-rata Kehadiran</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">94.1%</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Bulan April</span>
          </div>
          <div className="card-icon-mint shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section flex flex-col">
        <div className="card-section-header">
          <h3 className="text-sm font-bold text-ink">Absensi Teknisi — 22 April 2026</h3>
        </div>

        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>NAMA TEKNISI</th>
                <th>SPESIALISASI</th>
                <th>JAM MASUK</th>
                <th>JAM KELUAR</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {attendance.map((row, idx) => (
                <tr key={idx}>
                  {/* Name */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar avatar-sm avatar-lavender">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-ink">{row.name}</span>
                    </div>
                  </td>
                  
                  {/* Role */}
                  <td className="text-muted">
                    {row.role}
                  </td>
                  
                  {/* Jam Masuk */}
                  <td className="font-mono text-ink">
                    {row.checkIn}
                  </td>
                  
                  {/* Jam Keluar */}
                  <td className="font-mono text-muted">
                    {row.checkOut}
                  </td>
                  
                  {/* Status */}
                  <td>
                    {row.status === 'Hadir' ? (
                      <span className="badge-base badge-mint">
                        Hadir
                      </span>
                    ) : (
                      <span className="badge-base badge-yellow">
                        {row.status}
                      </span>
                    )}
                  </td>
                  
                  {/* Action */}
                  <td className="text-right">
                    <button
                      onClick={() => openEditModal(idx)}
                      className="text-ink hover:underline font-bold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDANCE MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                {modalMode === 'create' ? 'Catat Absensi Baru' : 'Edit Absensi'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body space-y-4">
              {/* Name */}
              <div>
                <label className="label-modern">Nama Teknisi</label>
                {modalMode === 'create' ? (
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama lengkap teknisi..."
                    className="input-modern font-semibold"
                  />
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={formName}
                    className="input-modern bg-gray-50 border border-soft text-muted font-semibold outline-none cursor-not-allowed"
                  />
                )}
              </div>

              {/* Role */}
              <div>
                <label className="label-modern">Spesialisasi</label>
                {modalMode === 'create' ? (
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Teknisi Listrik">Teknisi Listrik</option>
                    <option value="Teknisi AC & Plumbing">Teknisi AC & Plumbing</option>
                    <option value="Teknisi Lift & Mekanikal">Teknisi Lift & Mekanikal</option>
                    <option value="Teknisi Umum">Teknisi Umum</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={formRole}
                    className="input-modern bg-gray-50 border border-soft text-muted font-semibold outline-none cursor-not-allowed"
                  />
                )}
              </div>

              {/* Status */}
              <div>
                <label className="label-modern">Status Kehadiran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>

              {formStatus === 'Hadir' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Jam Masuk */}
                  <div>
                    <label className="label-modern">Jam Masuk</label>
                    <input
                      type="text"
                      required
                      value={formCheckIn}
                      onChange={(e) => setFormCheckIn(e.target.value)}
                      placeholder="08:00"
                      className="input-modern font-mono font-semibold"
                    />
                  </div>
                  {/* Jam Keluar */}
                  <div>
                    <label className="label-modern">Jam Keluar</label>
                    <input
                      type="text"
                      required
                      value={formCheckOut}
                      onChange={(e) => setFormCheckOut(e.target.value)}
                      placeholder="-"
                      className="input-modern font-mono font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <span>✓ Simpan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Messages Bottom-Right */}
      {toastMessage && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
