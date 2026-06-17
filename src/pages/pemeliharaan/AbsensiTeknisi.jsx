import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function AbsensiTeknisi() {
  // 1. State Utama Absensi (Murni Sinkronisasi Database)
  const [attendance, setAttendance] = useState([]);
  const [masterTeknisi, setMasterTeknisi] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. State UI & Dropdown
  const [activeMonth, setActiveMonth] = useState('Juni 2026');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
  const [selectedTechIndex, setSelectedTechIndex] = useState(null);

  // 3. Form States (Menggunakan huruf kecil agar lolos CHECK constraint database)
  const [selectedTech, setSelectedTech] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); 
  const [formCheckIn, setFormCheckIn] = useState('08:00:00');
  const [formCheckOut, setFormCheckOut] = useState('17:00:00');
  const [formStatus, setFormStatus] = useState('hadir'); 

  const searchDropdownRef = useRef(null);

  // Fetch data riil dari Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // ==========================================
        // STEP 1: FETCH DATA MASTER AKUN ROLE TEKNISI
        // ==========================================
        const { data: techData, error: techError } = await supabase
          .from('users')
          .select('id, nama, role')
          .eq('role', 'teknisi'); // Menyaring role tunggal 'teknisi' sesuai update constraint terbaru

        if (techError) throw techError;
        if (techData) setMasterTeknisi(techData);

        // ==========================================
        // STEP 2: FETCH & FILTER DATA ABSENSI HARI INI
        // ==========================================
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: attData, error: attError } = await supabase
          .from('absensi')
          .select('*, karyawan:users(nama, role)')
          .eq('tanggal', todayStr);

        if (attError) throw attError;

        let uniqueRecords = [];
        
        if (attData) {
          const seenKaryawanIds = new Set();
          
          // Urutkan data berdasarkan created_at terbaru agar rekor terakhir yang diambil (antiduplikat)
          const sortedAttData = [...attData].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });

          // Memetakan data dari Supabase ke state UI
          sortedAttData.forEach(row => {
            if (!seenKaryawanIds.has(row.karyawan_id)) {
              seenKaryawanIds.add(row.karyawan_id);
              uniqueRecords.push({
                id: row.id,
                name: row.karyawan?.nama || 'Karyawan Tanpa Nama',
                role: row.karyawan?.role || 'teknisi',
                checkIn: row.jam_masuk || '-', 
                checkOut: row.jam_keluar || '-',
                status: row.status || 'hadir',
                karyawan_id: row.karyawan_id
              });
            }
          });
        }

        setAttendance(uniqueRecords);

      } catch (err) {
        console.error('Error loading attendance data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Menutup dropdown pencarian jika klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Otomatisasi jam masuk/keluar form jika status diganti
  useEffect(() => {
    if (formStatus !== 'hadir') {
      setFormCheckIn('-');
      setFormCheckOut('-');
    } else {
      if (formCheckIn === '-') setFormCheckIn('08:00:00');
      if (formCheckOut === '-') setFormCheckOut('17:00:00');
    }
  }, [formStatus]);

  // Fungsi Export Excel Membaca State Murni Supabase
  const handleExport = () => {
    try {
      const fileName = `Absensi_Teknisi_${activeMonth.replace(' ', '_')}.xls`;
      let excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { font-family: 'Segoe UI', Arial, sans-serif; border-collapse: collapse; }
            .title { font-size: 14px; font-weight: bold; text-align: center; height: 35px; vertical-align: middle; }
            .subtitle { font-size: 11px; text-align: center; color: #555555; height: 20px; }
            th { background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; text-align: left; border: 1px solid #D1D5DB; padding: 10px; font-size: 11px; }
            td { border: 1px solid #E5E7EB; padding: 8px; font-size: 11px; vertical-align: middle; }
            .text-bold { font-weight: bold; color: #111111; }
            .txt-format { mso-number-format:"\\@"; text-align: center; font-family: 'Courier New', monospace; }
            .status-center { text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="5" class="title">LAPORAN ABSENSI TEKNISI - SiManTap</td></tr>
            <tr><td colspan="5" class="subtitle">Periode: ${activeMonth} (Dicetak Hari Ini)</td></tr>
            <tr><td colspan="5" style="height: 10px;"></td></tr>
            <thead>
              <tr>
                <th style="width: 180px;">NAMA TEKNISI</th>
                <th style="width: 150px;">ROLE</th>
                <th style="width: 100px; text-align: center;">JAM MASUK</th>
                <th style="width: 100px; text-align: center;">JAM KELUAR</th>
                <th style="width: 120px; text-align: center;">STATUS KEHADIRAN</th>
              </tr>
            </thead>
            <tbody>
      `;

      attendance.forEach((row) => {
        excelTemplate += `
          <tr>
            <td class="text-bold">${row.name}</td>
            <td>${row.role}</td>
            <td class="txt-format">${row.checkIn}</td>
            <td class="txt-format">${row.checkOut}</td>
            <td class="status-center">${formatStatusUI(row.status)}</td>
          </tr>
        `;
      });

      excelTemplate += `
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast(`File Excel berhasil diunduh!`);
    } catch (error) {
      console.error('Gagal export excel:', error);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTech(null);
    setSearchQuery('');
    setFormCheckIn('08:00:00');
    setFormCheckOut('17:00:00');
    setFormStatus('hadir');
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const tech = attendance[index];
    setModalMode('edit');
    setSelectedTechIndex(index);
    
    const matchedMaster = masterTeknisi.find(m => m.id === tech.karyawan_id || m.nama === tech.name);
    setSelectedTech(matchedMaster || { id: tech.karyawan_id, nama: tech.name, role: tech.role });
    setSearchQuery(tech.name);
    
    setFormCheckIn(tech.checkIn === '-' ? '08:00:00' : tech.checkIn);
    setFormCheckOut(tech.checkOut === '-' ? '17:00:00' : tech.checkOut);
    setFormStatus(tech.status);
    setModalOpen(true);
  };

  // AKSI SUBMIT PENUH KE DATABASE SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTech) {
      alert('Silakan pilih nama teknisi terlebih dahulu!');
      return;
    }

    try {
      const jamMasuk = formStatus === 'hadir' ? formCheckIn : null;
      const jamKeluar = formStatus === 'hadir' ? formCheckOut : null;

      if (modalMode === 'create') {
        const { data, error } = await supabase
          .from('absensi')
          .insert({
            karyawan_id: selectedTech.id,
            tanggal: new Date().toISOString().split('T')[0],
            jam_masuk: jamMasuk,
            jam_keluar: jamKeluar,
            status: formStatus
          })
          .select('*, karyawan:users(nama, role)')
          .single();

        if (error) throw error;

        if (data) {
          setAttendance(prev => [...prev, {
            id: data.id,
            name: data.karyawan?.nama || selectedTech.nama,
            role: data.karyawan?.role || selectedTech.role,
            checkIn: data.jam_masuk || '-',
            checkOut: data.jam_keluar || '-',
            status: data.status,
            karyawan_id: data.karyawan_id
          }]);
        }
        showToast('Absensi berhasil dicatat ke Supabase');
      } else {
        const targetRecord = attendance[selectedTechIndex];
        const { data, error } = await supabase
          .from('absensi')
          .update({
            jam_masuk: jamMasuk,
            jam_keluar: jamKeluar,
            status: formStatus
          })
          .eq('id', targetRecord.id)
          .select('*, karyawan:users(nama, role)')
          .single();

        if (error) throw error;

        if (data) {
          setAttendance(prev =>
            prev.map((item, idx) =>
              idx === selectedTechIndex
                ? {
                    ...item,
                    checkIn: data.jam_masuk || '-',
                    checkOut: data.jam_keluar || '-',
                    status: data.status
                  }
                : item
            )
          );
        }
        showToast('Data Supabase berhasil diperbarui');
      }
    } catch (err) {
      console.error('Error saving attendance:', err.message);
      alert(`Gagal menyimpan data ke database: ${err.message}`);
    }
    setModalOpen(false);
  };

  const filteredKaryawan = masterTeknisi.filter(tech =>
    (tech.nama || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kalkulasi statistik data widget atas
  const totalTeknisi = attendance.length;
  const hadirCount = attendance.filter(a => a.status === 'hadir').length;
  const izinCount = attendance.filter(a => a.status === 'izin' || a.status === 'sakit').length;
  const hadirPercentage = totalTeknisi > 0 ? ((hadirCount / totalTeknisi) * 100).toFixed(1) : '0';

  const formatStatusUI = (status) => {
    if (status === 'alpha') return 'Alpha';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <div className="p-6 text-muted text-sm">Memuat integrasi data database...</div>;

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-ink text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                {['Juni 2026', 'Mei 2026'].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setActiveMonth(m); setMonthDropdownOpen(false); }}
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

        <div className="flex items-center gap-3">
          <button onClick={openCreateModal} className="btn-primary btn-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Catat Absensi</span>
          </button>
          <button onClick={handleExport} className="btn-ghost btn-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Teknisi</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{totalTeknisi}</h4>
          </div>
        </div>
        <div className="card-yellow flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Hadir Hari Ini</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{hadirCount}</h4>
            <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">{hadirPercentage}%</span>
          </div>
        </div>
        <div className="card-lavender flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Izin / Sakit</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1 text-[#C05040]">{izinCount}</h4>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section flex flex-col">
        <div className="card-section-header">
          <h3 className="text-sm font-bold text-ink">Absensi Teknisi — Hari Ini</h3>
        </div>

        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>NAMA TEKNISI</th>
                <th>ROLE</th>
                <th>JAM MASUK</th>
                <th>JAM KELUAR</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {attendance.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td><span className="font-bold text-ink">{row.name}</span></td>
                  <td className="text-muted text-[11px] font-mono">{row.role}</td>
                  <td className="font-mono text-ink">{row.checkIn}</td>
                  <td className="font-mono text-muted">{row.checkOut}</td>
                  <td>
                    <span className={`badge-base ${row.status === 'hadir' ? 'badge-mint' : 'badge-yellow'}`}>
                      {formatStatusUI(row.status)}
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => openEditModal(idx)} className="text-ink hover:underline font-bold">
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
          <div className="modal-box max-w-md w-full">
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                {modalMode === 'create' ? 'Catat Absensi Baru' : 'Edit Absensi'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body space-y-4">
              <div className="relative" ref={searchDropdownRef}>
                <label className="label-modern">Pilih Nama Teknisi</label>
                {modalMode === 'create' ? (
                  <>
                    <input
                      type="text"
                      className="input-modern font-semibold text-xs"
                      placeholder="Ketik nama untuk mencari teknisi..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setIsSearchDropdownOpen(true); }}
                      onFocus={() => setIsSearchDropdownOpen(true)}
                    />
                    {isSearchDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 max-h-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto z-50 py-1">
                        {filteredKaryawan.map((tech) => (
                          <button
                            key={tech.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs flex flex-col border-b border-gray-50 last:border-0"
                            onClick={() => { setSelectedTech(tech); setSearchQuery(tech.nama); setIsSearchDropdownOpen(false); }}
                          >
                            <span className="font-bold text-gray-900">{tech.nama}</span>
                            <span className="text-[10px] text-gray-500">{tech.role}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <input type="text" readOnly value={selectedTech ? `${selectedTech.nama} — ${selectedTech.role}` : ''} className="input-modern bg-gray-50 cursor-not-allowed text-xs font-bold text-muted" />
                )}
              </div>

              <div>
                <label className="label-modern">Status Kehadiran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              {formStatus === 'hadir' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Jam Masuk (HH:MM:SS)</label>
                    <input type="text" required value={formCheckIn} onChange={(e) => setFormCheckIn(e.target.value)} className="input-modern font-mono font-semibold" />
                  </div>
                  <div>
                    <label className="label-modern">Jam Keluar (HH:MM:SS)</label>
                    <input type="text" required value={formCheckOut} onChange={(e) => setFormCheckOut(e.target.value)} className="input-modern font-mono font-semibold" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t">
                <button type="submit" className="flex-1 btn-primary py-2.5 text-xs font-bold">✓ Simpan</button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost py-2.5 text-xs font-bold">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}