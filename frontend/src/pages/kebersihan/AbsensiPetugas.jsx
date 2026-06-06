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
  const [mainSearchTerm, setMainSearchTerm] = useState(''); // State untuk filter tabel utama
  
  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Dropdown kustom kontrol di dalam modal catat
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState(''); // State untuk filter di dalam modal
  
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
    setModalSearchTerm('');
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

  // Filter baris tabel utama berdasarkan kolom pencarian atas
  const filteredOfficers = officers.filter(o =>
    o.name.toLowerCase().includes(mainSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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

          {/* Search Bar Utama - Anti Tumpang Tindih */}
          <div className="relative flex items-center w-full sm:w-60">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8A857F]">
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              value={mainSearchTerm}
              onChange={(e) => setMainSearchTerm(e.target.value)}
              className="w-full pr-8 py-2 input-modern text-xs font-semibold shadow-sm"
              style={{ paddingLeft: '2.5rem' }}
            />
            {mainSearchTerm && (
              <button 
                onClick={() => setMainSearchTerm('')}
                className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setDropdownOpen(false);
              setModalSearchTerm('');
              setRecordModalOpen(true);
            }}
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

        {/* Table View */}
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
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map((off) => (
                  <tr key={off.id}>
                    <td className="font-bold text-ink">{off.name}</td>
                    <td className="text-muted font-medium">{off.area}</td>
                    <td className="font-mono font-bold text-ink">{off.checkIn}</td>
                    <td className="font-mono text-muted">{off.checkOut}</td>
                    <td>
                      {off.status === 'Hadir' ? (
                        <span className="badge-base badge-mint">Hadir</span>
                      ) : (
                        <span className="badge-base badge-pink">Sakit</span>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-xs text-muted font-medium">
                    Karyawan dengan nama "{mainSearchTerm}" tidak ditemukan.
                  </td>
                </tr>
              )}
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

      {/* RECORD ABSENSI MODAL (WITH SEARCH INSIDE DROPDOWN) */}
      {recordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box !overflow-visible">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Catat Kehadiran Petugas</h3>
              <button onClick={() => setRecordModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="modal-body space-y-4">
              {/* Custom Searchable Dropdown */}
              <div className="relative">
                <label className="label-modern">Nama Petugas</label>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setModalSearchTerm('');
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{newRecord.name}</span>
                  <svg className={`w-3.5 h-3.5 text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden flex flex-col max-h-52">
                    {/* Input ketik search karyawan di dalam modal */}
                    <div className="p-2 border-b border-soft bg-[#FAFAFA] sticky top-0 z-10 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-muted ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Ketik nama karyawan..."
                        value={modalSearchTerm}
                        onChange={(e) => setModalSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-soft rounded-lg text-xs font-semibold outline-none focus:border-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Menu Pilihan Hasil Filter */}
                    <div className="overflow-y-auto flex-1">
                      {officers.filter(o => 
                        o.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
                      ).length > 0 ? (
                        officers
                          .filter(o => o.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                          .map((o) => (
                            <div
                              key={o.id}
                              onClick={() => {
                                setNewRecord(prev => ({ ...prev, name: o.name, area: o.area }));
                                setDropdownOpen(false);
                                setModalSearchTerm('');
                              }}
                              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            >
                              <span>{o.name}</span>
                              {newRecord.name === o.name && (
                                <svg className="w-3.5 h-3.5 text-emerald-600 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="px-4 py-2.5 text-center text-[11px] text-muted font-medium">
                          Nama tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Edit Absensi Petugas</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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