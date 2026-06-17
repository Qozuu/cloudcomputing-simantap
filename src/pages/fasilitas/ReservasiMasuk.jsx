import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

export default function ReservasiMasuk() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('Semua Fasilitas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua Status');

  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRsv, setSelectedRsv] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const facilityRef = useRef(null);
  const statusRef = useRef(null);

  const loadReservations = async () => {
    try {
      setLoading(true);

      // ✅ Sama persis seperti DashboardFasilitas yang berhasil
      const { data, error } = await supabase
        .from('reservasi')
        .select('*, fasilitas(nama), penghuni:users(nama)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Raw statuses:', data.map(item => item.status));

      if (data) {
        setReservations(data.map(item => {
          // ✅ Map status dari DB ke label tampilan
          const rawStatus = (item.status || '').toLowerCase();
          let statusText = 'Menunggu';
          if (rawStatus === 'disetujui') statusText = 'Disetujui';
          else if (rawStatus === 'ditolak') statusText = 'Ditolak';
          else if (rawStatus === 'dibatalkan') statusText = 'Dibatalkan';

          return {
            id: item.id,
            resident: item.penghuni?.nama || 'Warga',
            unit: item.nomor_unit || item.unit_no || 'N/A',
            facility: item.fasilitas?.nama || 'Fasilitas',
            date: item.tanggal
              ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'),
            session: `${(item.jam_mulai || '').substring(0, 5)}-${(item.jam_selesai || '').substring(0, 5)}`,
            cost: item.biaya || item.fasilitas?.harga_sewa || 0,
            // ✅ Simpan status asli dari DB untuk keperluan filter & update
            statusRaw: item.status || 'menunggu',
            status: statusText,
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load reservations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();

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

  const handleSetujui = async (id) => {
    try {
      setLoading(true);

      // 1. Update status reservasi
      const { data: rsvData, error: rsvError } = await supabase
        .from('reservasi')
        .update({ status: 'disetujui' })
        .eq('id', id)
        .select('*, fasilitas(nama, harga_sewa)')
        .single();

      if (rsvError) throw rsvError;

      // 2. Otomatis buat tagihan
      const { error: tagihanError } = await supabase
        .from('tagihan_fasilitas')
        .insert({
          fasilitas_id: rsvData.fasilitas_id,
          penghuni_id: rsvData.penghuni_id,
          tgl_reservasi: rsvData.tanggal,
          sesi_waktu: `${(rsvData.jam_mulai || '').substring(0, 5)}-${(rsvData.jam_selesai || '').substring(0, 5)}`,
          total_tarif: rsvData.fasilitas?.harga_sewa || 0,
          status: 'Menunggu',
        });

      if (tagihanError) throw tagihanError;

      showToast('Reservasi berhasil disetujui & tagihan dibuat!');
      await loadReservations();
    } catch (err) {
      console.error('Failed:', err.message);
      showToast(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTolak = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('reservasi')
        .update({ status: 'ditolak' })
        .eq('id', id);

      if (error) throw error;
      showToast('Reservasi telah ditolak.');
      await loadReservations();
    } catch (err) {
      console.error('Failed to reject reservation:', err.message);
      showToast(`Gagal menolak: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredReservations.length === 0) {
    showToast('Tidak ada data untuk diexport.');
    return;
  }

  const exportData = filteredReservations.map((r, index) => ({
    'No': index + 1,
    'Nama Penghuni': r.resident,
    'Unit': r.unit,
    'Fasilitas': r.facility,
    'Tanggal': r.date,
    'Sesi': r.session,
    'Biaya': formatRupiah(r.cost),
    'Status': r.status,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reservasi');
  XLSX.writeFile(wb, 'Data_Reservasi.xlsx');

  showToast('Data_Reservasi.xlsx berhasil diunduh!');
};

  const handleOpenDetail = (rsv) => {
    setSelectedRsv(rsv);
    setDetailModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ✅ Filter menggunakan statusText (label tampilan) agar konsisten dengan dropdown
  const filteredReservations = reservations.filter(r => {
    const matchFac = selectedFacilityFilter === 'Semua Fasilitas' || r.facility === selectedFacilityFilter;
    const matchStat = selectedStatusFilter === 'Semua Status' || r.status === selectedStatusFilter;
    return matchFac && matchStat;
  });

  const formatRupiah = (val) => {
    if (!val || val === 0 || val === 'Gratis') return 'Gratis';
    const num = Number(val);
    return isNaN(num) || num === 0 ? 'Gratis' : `Rp ${num.toLocaleString('id-ID')}`;
  };

  const getCostClass = (cost) => {
    if (!cost || cost === 0 || cost === 'Gratis') return 'badge-base badge-mint uppercase';
    return 'text-ink font-bold';
  };

  // ✅ Opsi fasilitas dinamis dari data yang sudah di-fetch
  const facilityOptions = ['Semua Fasilitas', ...new Set(reservations.map(r => r.facility).filter(f => f && f !== 'Fasilitas'))];
  const statusOptions = ['Semua Status', 'Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan'];

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl animate-fade-up">
          {toastMessage}
        </div>
      )}

      {/* Filter and Export Action Row */}
      <div className="bg-white border border-soft rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative" style={{ zIndex: 50 }}>
        <div className="flex flex-wrap items-center gap-3">

          {/* Facility Filter */}
          <div className="relative" ref={facilityRef} style={{ zIndex: 999 }}>
            <button
              onClick={() => { setFacilityDropdownOpen(!facilityDropdownOpen); setStatusDropdownOpen(false); }}
              className="px-4 py-2 bg-[#FAF6F0] border border-soft hover:bg-[#F0EDE8] rounded-xl text-xs font-bold text-ink flex items-center gap-2 transition"
            >
              <span>{selectedFacilityFilter}</span>
              <svg className={`w-4 h-4 text-muted transition-transform ${facilityDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {facilityDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white border border-soft rounded-2xl shadow-xl py-1 overflow-hidden animate-scaleUp" style={{ zIndex: 9999 }}>
                {facilityOptions.map((opt) => (
                  <button key={opt} onClick={() => { setSelectedFacilityFilter(opt); setFacilityDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#FAF6F0] transition ${selectedFacilityFilter === opt ? 'text-[#A05820] bg-[#FAF6F0] font-black' : 'text-ink'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusRef} style={{ zIndex: 999 }}>
            <button
              onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setFacilityDropdownOpen(false); }}
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
                  <button key={opt} onClick={() => { setSelectedStatusFilter(opt); setStatusDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#FAF6F0] transition ${selectedStatusFilter === opt ? 'text-[#A05820] bg-[#FAF6F0] font-black' : 'text-ink'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        <button onClick={handleExport} className="w-full sm:w-auto px-5 py-2.5 btn-ghost rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Data</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-visible">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-soft mb-6 gap-2">
          <div>
            <h2 className="text-base font-bold text-ink">Daftar Reservasi Masuk</h2>
            <p className="text-xs text-muted">Kelola konfirmasi penggunaan area warga</p>
          </div>
          <span className="text-xs text-muted font-semibold italic">Masuk otomatis dari permintaan penghuni</span>
        </div>

        <div className="table-wrap">
          <table className="table-modern text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">NO</th>
                <th className="p-3">PENGHUNI</th>
                <th className="p-3">UNIT</th>
                <th className="p-3">FASILITAS</th>
                <th className="p-3">TANGGAL</th>
                <th className="p-3">SESI</th>
                <th className="p-3">BIAYA</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((r, index) => (
                <tr key={r.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-3 font-mono text-muted">{index + 1}</td>
                  <td className="p-3 font-bold text-ink">{r.resident}</td>
                  <td className="p-3">{r.unit}</td>
                  <td className="p-3 font-bold text-ink">{r.facility}</td>
                  <td className="p-3 text-muted">{r.date}</td>
                  <td className="p-3">
                    <span className="font-mono text-ink bg-[#FAF6F0] rounded-xl px-2.5 py-1 border border-soft text-[11px]">
                      {r.session}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={getCostClass(r.cost)}>{formatRupiah(r.cost)}</span>
                  </td>
                  <td className="p-3">
                    <span className={`badge-base ${
                      r.status === 'Menunggu' ? 'badge-yellow' :
                      r.status === 'Ditolak' ? 'badge-red' :
                      r.status === 'Disetujui' ? 'badge-mint' : 'badge-gray'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.statusRaw === 'menunggu' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleSetujui(r.id)} className="btn-primary py-1.5 px-3 text-[10px] font-bold rounded-xl">
                          Setujui
                        </button>
                        <button onClick={() => handleTolak(r.id)} className="btn-ghost hover:bg-pastel-pink-bg hover:text-[#B85040] hover:border-pastel-pink/30 py-1.5 px-3 text-[10px] font-bold rounded-xl">
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleOpenDetail(r)} className="text-ink hover:underline font-bold text-xs">
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
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Detail Booking Reservasi</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
                <span className={`badge-base mt-1 ${
                  selectedRsv.status === 'Disetujui' ? 'badge-mint' :
                  selectedRsv.status === 'Ditolak' ? 'badge-red' : 'badge-yellow'
                }`}>
                  {selectedRsv.status}
                </span>
              </div>

              <div className="pt-3 border-t border-soft flex justify-end gap-2">
                <button onClick={() => setDetailModalOpen(false)} className="btn-ghost px-4 py-2 text-xs font-bold rounded-xl">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}