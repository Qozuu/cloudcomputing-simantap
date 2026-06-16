import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function AbsensiTeknisi() {
  // 1. State Utama Absensi (Tabel)
  const [attendance, setAttendance] = useState([]);
  const [masterTeknisi, setMasterTeknisi] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. State UI Tambahan
  const [activeMonth, setActiveMonth] = useState('April 2026');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' atau 'edit'
  const [selectedTechIndex, setSelectedTechIndex] = useState(null);

  // 4. Form States
  const [selectedTech, setSelectedTech] = useState(null); // Menyimpan objek teknisi yang terpilih
  const [searchQuery, setSearchQuery] = useState(''); // Menyimpan teks pencarian
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); // Mengontrol buka/tutup list pencarian
  const [formCheckIn, setFormCheckIn] = useState('08:00');
  const [formCheckOut, setFormCheckOut] = useState('-');
  const [formStatus, setFormStatus] = useState('Hadir');

  const searchDropdownRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch master technicians
        const { data: techData, error: techError } = await supabase
          .from('users')
          .select('id, nama, role')
          .ilike('role', '%teknisi%');

        if (techError) throw techError;

        if (techData && techData.length > 0) {
          setMasterTeknisi(techData);
        } else {
          // Fallback to mock technicians
          setMasterTeknisi([
            { id: 'T-01', name: 'Doni Prasetya', role: 'Admin Pemeliharaan' },
            { id: 'T-02', name: 'Agus Maulana', role: 'Teknisi Listrik' },
            { id: 'T-03', name: 'Ridwan Saputra', role: 'Teknisi AC & Plumbing' },
            { id: 'T-04', name: 'Fajar Kurniawan', role: 'Teknisi Lift & Mekanikal' },
            { id: 'T-05', name: 'Hendra Setiawan', role: 'Teknisi Umum' },
            { id: 'T-06', name: 'Riko Prabowo', role: 'Teknisi Umum' }
          ]);
        }

        // Fetch attendance for today
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: attData, error: attError } = await supabase
          .from('absensi')
          .select('*, karyawan:users(nama, role)')
          .eq('tanggal', todayStr);

        if (attError) throw attError;

        if (attData && attData.length > 0) {
          setAttendance(attData.map(row => ({
            id: row.id,
            name: row.karyawan?.nama || 'Anonim',
            role: row.karyawan?.role || 'Teknisi',
            checkIn: row.jam_masuk || '-',
            checkOut: row.jam_keluar || '-',
            status: row.status || 'Hadir',
            karyawan_id: row.karyawan_id
          })));
        } else {
          setAttendance([]);
        }
      } catch (err) {
        console.error('Error loading attendance data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Menutup dropdown pencarian jika mendeteksi klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = () => {
    showToast('Absensi_Teknisi.xlsx berhasil diunduh!');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedTech(null);
    setSearchQuery('');
    setFormCheckIn('08:00');
    setFormCheckOut('-');
    setFormStatus('Hadir');
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const tech = attendance[index];
    setModalMode('edit');
    setSelectedTechIndex(index);
    
    const matchedMaster = masterTeknisi.find(m => m.id === tech.karyawan_id || m.name === tech.name);
    setSelectedTech(matchedMaster || { id: tech.karyawan_id, name: tech.name, role: tech.role });
    setSearchQuery(tech.name);
    
    setFormCheckIn(tech.checkIn);
    setFormCheckOut(tech.checkOut);
    setFormStatus(tech.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTech) {
      alert('Silakan pilih nama teknisi terlebih dahulu!');
      return;
    }

    try {
      const jamMasuk = formStatus === 'Izin' || formStatus === 'Sakit' || formStatus === 'Alpa' ? '-' : formCheckIn;
      const jamKeluar = formStatus === 'Izin' || formStatus === 'Sakit' || formStatus === 'Alpa' ? '-' : formCheckOut;

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
          const newRecord = {
            id: data.id,
            name: data.karyawan?.nama || selectedTech.name,
            role: data.karyawan?.role || selectedTech.role,
            checkIn: data.jam_masuk || '-',
            checkOut: data.jam_keluar || '-',
            status: data.status || 'Hadir',
            karyawan_id: data.karyawan_id
          };
          setAttendance(prev => [...prev, newRecord]);
        }
        showToast('Absensi berhasil dicatat');
      } else {
        const targetRecord = attendance[selectedTechIndex];
        const { error } = await supabase
          .from('absensi')
          .update({
            jam_masuk: jamMasuk,
            jam_keluar: jamKeluar,
            status: formStatus
          })
          .eq('id', targetRecord.id);

        if (error) throw error;

        setAttendance(prev =>
          prev.map((item, idx) =>
            idx === selectedTechIndex
              ? {
                  ...item,
                  checkIn: jamMasuk,
                  checkOut: jamKeluar,
                  status: formStatus
                }
              : item
          )
        );
        showToast('Data berhasil diperbarui');
      }
    } catch (err) {
      console.error('Error saving attendance:', err.message);
    }
    setModalOpen(false);
  };

  // Filter list master berdasarkan apa yang diketik oleh pengguna
  const filteredKaryawan = masterTeknisi.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kalkulasi statistik data widget atas
  const totalTeknisi = attendance.length;
  const hadirCount = attendance.filter(a => a.status === 'Hadir').length;
  const izinCount = attendance.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
  const hadirPercentage = totalTeknisi > 0 ? ((hadirCount / totalTeknisi) * 100).toFixed(1) : '0';

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

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
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar avatar-sm avatar-lavender">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-ink">{row.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{row.role}</td>
                  <td className="font-mono text-ink">{row.checkIn}</td>
                  <td className="font-mono text-muted">{row.checkOut}</td>
                  <td>
                    <span className={`badge-base ${row.status === 'Hadir' ? 'badge-mint' : 'badge-yellow'}`}>
                      {row.status}
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

      {/* ATTENDANCE MODAL (SUDAH FIX FITUR PENCARIANNYA) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md w-full">
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
              
              {/* CUSTOM SEARCHABLE DROPDOWN COMPONENT */}
              <div className="relative" ref={searchDropdownRef}>
                <label className="label-modern">Pilih Nama Karyawan / Teknisi</label>
                
                {modalMode === 'create' ? (
                  <>
                    {/* Input teks pembungkus yang berfungsi sebagai kolom ketik sekaligus pemicu dropdown */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        className="input-modern font-semibold pr-10 text-xs"
                        placeholder="Ketik untuk mencari nama karyawan..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchDropdownOpen(true);
                        }}
                        onFocus={() => setIsSearchDropdownOpen(true)}
                      />
                      <div className="absolute right-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Menu Pilihan Dropdown Hasil Pencarian */}
                    {isSearchDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 max-h-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto z-50 py-1 divide-y divide-gray-50">
                        {filteredKaryawan.length > 0 ? (
                          filteredKaryawan.map((tech) => (
                            <button
                              key={tech.id}
                              type="button"
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs flex flex-col transition"
                              onClick={() => {
                                setSelectedTech(tech);
                                setSearchQuery(tech.name);
                                setIsSearchDropdownOpen(false);
                              }}
                            >
                              <span className="font-bold text-gray-900">{tech.name}</span>
                              <span className="text-[10px] text-gray-500 font-medium">{tech.role}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-center text-gray-400 font-medium">
                            Karyawan tidak ditemukan...
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // Jika mode EDIT, tidak bisa diubah namanya (Read Only)
                  <input
                    type="text"
                    readOnly
                    value={selectedTech ? `${selectedTech.name} — ${selectedTech.role}` : ''}
                    className="input-modern bg-gray-50 border border-soft text-muted font-bold cursor-not-allowed outline-none text-xs"
                  />
                )}
              </div>

              {/* JABATAN / SPESIALISASI OTOMATIS */}
              <div>
                <label className="label-modern">Spesialisasi / Divisi Kerja</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Terisi otomatis sesuai pilihan di atas..."
                  value={selectedTech ? selectedTech.role : ''}
                  className="input-modern bg-gray-50 border border-soft text-gray-500 font-bold cursor-not-allowed outline-none text-xs"
                />
              </div>

              {/* Status Kehadiran */}
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
                      placeholder="17:00"
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

      {/* Toast Messages */}
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