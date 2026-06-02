import React, { useState, useRef, useEffect } from 'react';

export default function ReservasiMasuk() {
  const [reservations, setReservations] = useState([
    {
      id: 'RSV-001',
      resident: 'Hendra Gunawan',
      unit: '12A',
      facility: 'Kolam Renang',
      date: '22 Apr 2026',
      session: '06:00-08:00',
      cost: 'Gratis',
      status: 'Menunggu'
    },
    {
      id: 'RSV-002',
      resident: 'Maya Sari',
      unit: '05B',
      facility: 'Lapangan Tenis',
      date: '22 Apr 2026',
      session: '08:00-10:00',
      cost: 75000,
      status: 'Menunggu'
    },
    {
      id: 'RSV-003',
      resident: 'Rudi Hartono',
      unit: '18C',
      facility: 'Ruang Serbaguna',
      date: '21 Apr 2026',
      session: '13:00-17:00',
      cost: 100000,
      status: 'Disetujui'
    }
  ]);

  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('Semua Fasilitas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua Status');

  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRsv, setSelectedRsv] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const facilityRef = useRef(null);
  const statusRef = useRef(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (facilityRef.current && !facilityRef.current.contains(event.target)) {
        setFacilityDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSetujui = (id) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'Disetujui' } : r)
    );
    showToast(`Reservasi ${id} berhasil disetujui!`);
  };

  const handleTolak = (id) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    showToast(`Reservasi ${id} ditolak dan dihapus.`);
  };

  const handleExport = () => {
    showToast('Data_Reservasi.xlsx berhasil diunduh!');
  };

  const handleOpenDetail = (rsv) => {
    setSelectedRsv(rsv);
    setDetailModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const filteredReservations = reservations.filter(r => {
    const matchFac = selectedFacilityFilter === 'Semua Fasilitas' || r.facility === selectedFacilityFilter;
    const matchStat = selectedStatusFilter === 'Semua Status' || r.status === selectedStatusFilter;
    return matchFac && matchStat;
  });

  const formatRupiah = (val) => {
    if (val === 'Gratis') return val;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const getCostClass = (cost) => {
    if (cost === 'Gratis') return 'badge-base badge-mint uppercase';
    if (cost === 75000) return 'text-[#A05820] font-bold';
    if (cost === 100000) return 'text-[#B85040] font-bold';
    return 'text-ink font-bold';
  };

  const facilityOptions = ['Semua Fasilitas', 'Kolam Renang', 'Lapangan Tenis', 'Ruang Serbaguna'];
  const statusOptions = ['Semua Status', 'Menunggu', 'Disetujui'];

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filter and Export Action Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-20">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Facility Filter */}
          <div className="relative" ref={facilityRef}>
            <button
              onClick={() => {
                setFacilityDropdownOpen(!facilityDropdownOpen);
                setStatusDropdownOpen(false);
              }}
              className="px-4 py-2 bg-[#FAF6F0] border border-soft hover:bg-[#F0EDE8] rounded-xl text-xs font-bold text-ink flex items-center gap-2 transition"
            >
              <span>{selectedFacilityFilter}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${facilityDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {facilityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-soft rounded-2xl shadow-xl z-30 py-1 overflow-hidden animate-scaleUp">
                {facilityOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedFacilityFilter(opt);
                      setFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#FAF6F0] transition ${
                      selectedFacilityFilter === opt ? 'text-[#A05820] bg-[#FAF6F0] font-black' : 'text-ink'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setFacilityDropdownOpen(false);
              }}
              className="px-4 py-2 bg-[#FAF6F0] border border-soft hover:bg-[#F0EDE8] rounded-xl text-xs font-bold text-ink flex items-center gap-2 transition"
            >
              <span>{selectedStatusFilter}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {statusDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white border border-soft rounded-2xl shadow-xl z-30 py-1 overflow-hidden animate-scaleUp">
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedStatusFilter(opt);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#FAF6F0] transition ${
                      selectedStatusFilter === opt ? 'text-[#A05820] bg-[#FAF6F0] font-black' : 'text-ink'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Export Button */}
        <div>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-5 py-2.5 btn-ghost rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Data</span>
          </button>
        </div>

      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-soft mb-6 gap-2">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Reservasi Masuk</h2>
            <p className="text-xs text-muted">Kelola konfirmasi penggunaan area warga</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-muted font-semibold italic">
              Masuk otomatis dari permintaan penghuni
            </span>
          </div>
        </div>

        {/* Table representation */}
        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>NO</th>
                <th>PENGHUNI</th>
                <th>UNIT</th>
                <th>FASILITAS</th>
                <th>TANGGAL</th>
                <th>SESI</th>
                <th>BIAYA</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-muted">{r.id}</td>
                  <td className="font-bold text-ink">{r.resident}</td>
                  <td>{r.unit}</td>
                  <td className="font-bold text-ink">{r.facility}</td>
                  <td className="text-muted">{r.date}</td>
                  <td>
                    <span className="font-mono text-ink bg-[#FAF6F0] rounded-xl px-2.5 py-1 border border-soft text-[11px]">
                      {r.session}
                    </span>
                  </td>
                  <td>
                    <span className={getCostClass(r.cost)}>
                      {formatRupiah(r.cost)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-base ${
                      r.status === 'Menunggu' ? 'badge-yellow' : 'badge-lavender'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {r.status === 'Menunggu' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSetujui(r.id)}
                          className="btn-primary py-1.5 px-3 text-[10px] font-bold rounded-xl"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleTolak(r.id)}
                          className="btn-ghost hover:bg-pastel-pink-bg hover:text-[#B85040] hover:border-pastel-pink/30 py-1.5 px-3 text-[10px] font-bold rounded-xl"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenDetail(r)}
                        className="text-ink hover:underline font-bold text-xs"
                      >
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted font-medium">
                    Tidak ada antrean reservasi masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedRsv && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Detail Booking Reservasi</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="modal-body space-y-4">
              <div>
                <span className="label-modern mb-0.5">Kode Reservasi</span>
                <p className="text-sm font-bold font-mono text-ink">{selectedRsv.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="label-modern mb-0.5">Nama Penghuni</span>
                  <p className="text-xs font-bold text-ink">{selectedRsv.resident}</p>
                </div>
                <div>
                  <span className="label-modern mb-0.5">Unit Hunian</span>
                  <p className="text-xs font-bold text-ink">{selectedRsv.unit}</p>
                </div>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-soft space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="label-modern mb-0.5">Fasilitas</span>
                    <p className="text-xs font-bold text-ink">{selectedRsv.facility}</p>
                  </div>
                  <div>
                    <span className="label-modern mb-0.5">Biaya Sewa</span>
                    <p className="text-xs font-bold text-ink">{formatRupiah(selectedRsv.cost)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-soft">
                  <div>
                    <span className="label-modern mb-0.5">Tanggal Reservasi</span>
                    <p className="text-xs font-semibold text-muted">{selectedRsv.date}</p>
                  </div>
                  <div>
                    <span className="label-modern mb-0.5">Jam Sesi</span>
                    <p className="text-xs font-mono font-bold text-muted">{selectedRsv.session}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="label-modern mb-0.5">Status Persetujuan</span>
                <span className="badge-base badge-mint mt-1">
                  {selectedRsv.status}
                </span>
              </div>

              <div className="pt-3 border-t border-soft flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
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
