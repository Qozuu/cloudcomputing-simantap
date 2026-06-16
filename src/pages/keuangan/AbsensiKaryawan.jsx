import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Clock, UserX, Plus, X, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AbsensiKaryawan() {
  const [logs, setLogs] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // State pendukung fitur Live Search di dalam dropdown modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch all employees in finance roles
        const { data: employeesData, error: empError } = await supabase
          .from('users')
          .select('id, nama, role')
          .or('role.ilike.%keuangan%,role.ilike.%kasir%,role.ilike.%billing%,role.ilike.%akunting%,role.ilike.%pajak%');

        if (empError) throw empError;

        if (employeesData && employeesData.length > 0) {
          setAvailableEmployees(employeesData.map(e => ({ name: e.nama, desc: e.role, id: e.id })));
        } else {
          // Fallback to mock employees
          setAvailableEmployees([
            { name: 'Ahmad Fauzi', desc: 'Staff Kasir & EBilling' },
            { name: 'Sri Wahyuni', desc: 'Staff Akunting & Pajak' },
            { name: 'Rina Kurnia', desc: 'Supervisor Keuangan' }
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
          setLogs(attData.map(row => ({
            id: row.id,
            name: row.karyawan?.nama || 'Anonim',
            role: row.karyawan?.role || 'Staff',
            date: row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            checkIn: row.jam_masuk || '—',
            checkOut: row.jam_keluar || '—',
            status: row.status || 'Hadir',
            note: row.keterangan || row.note || 'Tepat waktu',
            karyawan_id: row.karyawan_id
          })));
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Effect pelindung: Klik di luar list dropdown akan otomatis menutup menu pencarian
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleOpenModal = () => {
    setFormName(availableEmployees.length > 0 ? availableEmployees[0].name : '');
    setFormStatus('Hadir');
    setFormCheckIn('08:00');
    setFormCheckOut('17:00');
    setFormNote('');
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAbsensi = async (e) => {
    e.preventDefault();

    const matchedEmployee = availableEmployees.find(emp => emp.name === formName);
    if (!matchedEmployee) {
      alert('Silakan pilih nama karyawan yang valid!');
      return;
    }

    try {
      const jamMasuk = formStatus === 'Alpa' || formStatus === 'Izin' || formStatus === 'Sakit' ? '—' : formCheckIn;
      const jamKeluar = formStatus === 'Alpa' || formStatus === 'Izin' || formStatus === 'Sakit' ? '—' : formCheckOut;
      const note = formNote || (formStatus === 'Hadir' ? 'Tepat waktu' : formStatus);

      const { data, error } = await supabase
        .from('absensi')
        .insert({
          karyawan_id: matchedEmployee.id,
          tanggal: new Date().toISOString().split('T')[0],
          jam_masuk: jamMasuk,
          jam_keluar: jamKeluar,
          status: formStatus,
          keterangan: note
        })
        .select('*, karyawan:users(nama, role)')
        .single();

      if (error) throw error;

      if (data) {
        const newLog = {
          id: data.id,
          name: data.karyawan?.nama || matchedEmployee.name,
          role: data.karyawan?.role || matchedEmployee.desc,
          date: new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          checkIn: data.jam_masuk || '—',
          checkOut: data.jam_keluar || '—',
          status: data.status || 'Hadir',
          note: data.keterangan || 'Tepat waktu',
          karyawan_id: data.karyawan_id
        };
        setLogs(prev => [newLog, ...prev]);
      }
      showToast(`Berhasil mencatat absensi manual untuk ${formName}!`);
    } catch (err) {
      console.error('Error saving attendance:', err.message);
    } finally {
      setIsModalOpen(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter logs utama halaman dashboard
  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'Semua' || log.status === statusFilter || (statusFilter === 'Hadir' && log.status === 'Terlambat');
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || log.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter list karyawan di dalam modal pencarian berdasarkan ketikan admin
  const searchedEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(formName.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

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

          {/* Search bar dashboard utama */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 w-52 focus-within:border-gray-400 transition-colors shadow-sm">
            <Search className="text-gray-400 mr-2 flex-shrink-0" size={14} />
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-400"
            />
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
            <div className="modal-header">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-ink">Input Absensi Manual</h4>
                <p className="text-[10px] text-muted font-semibold">Catat data kehadiran luar kantor atau penyesuaian khusus</p>
              </div>
              <button onClick={handleCloseModal} className="text-muted hover:text-ink hover:bg-app-bg p-1.5 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAbsensi} className="modal-body space-y-4 text-xs font-bold text-gray-700">
              
              {/* PERBAIKAN UTAMA: Searchable Custom Combobox Dropdown */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="label-modern">Pilih Nama Karyawan</label>
                
                {/* Input Text box sebagai Search Input */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ketik untuk mencari nama staf..."
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="input-modern w-full pr-10 font-semibold text-gray-800"
                  />
                  <Search className="absolute right-3.5 text-gray-400 pointer-events-none" size={14} />
                </div>

                {/* Floating List hasil filter pencarian nama */}
                {isDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-50 text-xs font-semibold">
                    {searchedEmployees.map((emp, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormName(emp.name);
                          setIsDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col gap-0.5"
                      >
                        <span className="text-gray-800">{emp.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{emp.desc}</span>
                      </div>
                    ))}
                    
                    {/* State Fallback jika input ketikan tidak cocok dengan staf manapun */}
                    {searchedEmployees.length === 0 && (
                      <div className="px-4 py-3 text-center text-gray-400 font-medium italic bg-gray-50">
                        Nama karyawan tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Kehadiran */}
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

              {/* Check-In & Out Timestamps */}
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