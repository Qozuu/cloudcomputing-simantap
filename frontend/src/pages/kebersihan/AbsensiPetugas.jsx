import React, { useState } from 'react';

export default function AbsensiPetugas() {
  const [officers, setOfficers] = useState([
    { id: 1, name: 'Wati Lestari', area: 'Lobby & Koridor Tower A', checkIn: '05:55', checkOut: '14:00', status: 'Hadir', recap: 95 },
    { id: 2, name: 'Sri Mulyani', area: 'Kolam Renang & Taman', checkIn: '06:00', checkOut: '13:00', status: 'Hadir', recap: 100 },
    { id: 3, name: 'Dewi Pertiwi', area: 'Lobby & Koridor Tower B', checkIn: '06:05', checkOut: '—', status: 'Hadir', recap: 87 },
    { id: 4, name: 'Retna Seri', area: 'Toilet Umum & Mushola', checkIn: '—', checkOut: '—', status: 'Sakit', recap: 72 },
    { id: 5, name: 'Endah Susanti', area: 'Gym & Area Fasilitas', checkIn: '06:00', checkOut: '—', status: 'Hadir', recap: 91 },
    { id: 6, name: 'Lina Kusuma', area: 'Koridor Tower C', checkIn: '05:50', checkOut: '—', status: 'Hadir', recap: 88 }
  ]);

  const [month, setMonth] = useState('April 2026');
  const [successToast, setSuccessToast] = useState('');
  
  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Forms state
  const [newRecord, setNewRecord] = useState({
    name: 'Wati Lestari',
    area: 'Lobby & Koridor Tower A',
    checkIn: '06:00',
    checkOut: '—',
    status: 'Hadir'
  });
  
  const [editTarget, setEditTarget] = useState(null);

  const handleExport = () => {
    setSuccessToast('Absensi_Petugas.xlsx berhasil diunduh!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    setOfficers(prev => {
      // Find if already exists
      const existsIdx = prev.findIndex(o => o.name === newRecord.name);
      if (existsIdx > -1) {
        const updated = [...prev];
        updated[existsIdx] = {
          ...updated[existsIdx],
          checkIn: newRecord.checkIn,
          checkOut: newRecord.checkOut,
          status: newRecord.status
        };
        return updated;
      }
      return [...prev, { ...newRecord, id: Date.now(), recap: 90 }];
    });
    setRecordModalOpen(false);
    setSuccessToast(`Absensi petugas ${newRecord.name} berhasil disimpan!`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleOpenEdit = (officer) => {
    setEditTarget(officer);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTarget) return;

    setOfficers(prev =>
      prev.map(o => o.id === editTarget.id ? editTarget : o)
    );

    setEditModalOpen(false);
    setSuccessToast('Data diedit');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="label-modern m-0">Pilih Periode:</label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-2 w-44"
            >
              <option value="April 2026">April 2026</option>
              <option value="Maret 2026">Maret 2026</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRecordModalOpen(true)}
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
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Petugas</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">6 Petugas</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Cleaning staff aktif</span>
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
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">5 Hadir</h4>
            <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">83.1%</span>
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
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1 text-[#C05040]">1 Sakit</h4>
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
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">91.8%</h4>
            <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Bulan April</span>
          </div>
          <div className="card-icon-mint shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-section flex flex-col">
        <div className="card-section-header">
          <div>
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Absensi Petugas — 22 April 2026</h2>
            <p className="text-xs text-muted font-medium mt-0.5">Log kehadiran harian divisi kebersihan lapangan</p>
          </div>
        </div>

        {/* Table */}
        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama Petugas</th>
                <th>Area Tugas</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {officers.map((off) => (
                <tr key={off.id}>
                  <td className="font-bold text-ink">{off.name}</td>
                  <td className="text-muted font-medium">{off.area}</td>
                  <td className="font-mono font-bold text-ink">{off.checkIn}</td>
                  <td className="font-mono text-muted">{off.checkOut}</td>
                  <td>
                    {off.status === 'Hadir' ? (
                      <span className="badge-base badge-mint">
                        Hadir
                      </span>
                    ) : (
                      <span className="badge-base badge-pink">
                        Sakit
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleOpenEdit(off)}
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

      {/* Progress Recap Section */}
      <div className="card-section p-6 flex flex-col space-y-5">
        <div className="pb-4 border-b border-soft">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Rekap Kehadiran Bulan Ini</h3>
          <p className="text-xs text-muted font-medium mt-0.5">Persentase tingkat kehadiran petugas di bulan April</p>
        </div>

        <div className="space-y-4">
          {officers.map((off, idx) => {
            let pColor = 'progress-dark';
            if (idx % 3 === 1) pColor = 'progress-lavender';
            if (idx % 3 === 2) pColor = 'progress-pink';

            return (
              <div key={off.id} className="flex items-center justify-between gap-6">
                <div className="w-1/4 min-w-[120px]">
                  <span className="text-xs font-bold text-ink">{off.name}</span>
                </div>
                
                {/* Progress bar */}
                <div className="flex-1 progress-track">
                  <div
                    className={`progress-fill ${pColor}`}
                    style={{ width: `${off.recap}%` }}
                  ></div>
                </div>
                
                <div className="w-12 text-right">
                  <span className="text-xs font-bold text-ink">{off.recap}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECORD ABSENSI MODAL */}
      {recordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Catat Kehadiran Petugas</h3>
              <button onClick={() => setRecordModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRecordSubmit} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Petugas</label>
                <select
                  value={newRecord.name}
                  onChange={(e) => {
                    const matched = officers.find(o => o.name === e.target.value);
                    setNewRecord(prev => ({
                      ...prev,
                      name: e.target.value,
                      area: matched ? matched.area : prev.area
                    }));
                  }}
                  className="select-modern input-modern font-semibold"
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-modern">Area Tugas</label>
                <input
                  type="text"
                  value={newRecord.area}
                  readOnly
                  className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Masuk</label>
                  <input
                    type="text"
                    value={newRecord.checkIn}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, checkIn: e.target.value }))}
                    placeholder="06:00"
                    className="input-modern font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Keluar</label>
                  <input
                    type="text"
                    value={newRecord.checkOut}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, checkOut: e.target.value }))}
                    placeholder="—"
                    className="input-modern font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Status Kehadiran</label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, status: e.target.value }))}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <span>✓ Simpan Catatan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ABSENSI MODAL */}
      {editModalOpen && editTarget && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Edit Absensi Petugas</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="modal-body space-y-4">
              <div>
                <span className="label-modern mb-0.5">Nama Petugas</span>
                <p className="text-xs font-bold text-ink">{editTarget.name}</p>
              </div>

              <div>
                <span className="label-modern mb-0.5">Area Tugas</span>
                <p className="text-xs font-semibold text-muted">{editTarget.area}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Masuk</label>
                  <input
                    type="text"
                    value={editTarget.checkIn}
                    onChange={(e) => setEditTarget(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="input-modern font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Keluar</label>
                  <input
                    type="text"
                    value={editTarget.checkOut}
                    onChange={(e) => setEditTarget(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="input-modern font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Status Kehadiran</label>
                <select
                  value={editTarget.status}
                  onChange={(e) => setEditTarget(prev => ({ ...prev, status: e.target.value }))}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <span>✓ Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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
