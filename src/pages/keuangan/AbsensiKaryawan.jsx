import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Clock, UserX, Plus, X, Search, CheckCircle2 } from 'lucide-react';
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
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState('hadir'); 
  const [formCheckIn, setFormCheckIn] = useState('08:00');
  const [formCheckOut, setFormCheckOut] = useState('17:00');
  const [formNote, setFormNote] = useState('');

  // State pendukung fitur Live Search di dalam dropdown modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fungsi utilitas untuk mendapatkan tanggal lokal YYYY-MM-DD dengan aman
  const getLocalDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
    return localISOTime;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 🚀 FIX: Murni hanya role admin operasional yang nyata di database Anda (admin_sdm dihapus)
        const validRoles = [
          'admin_keuangan', 
          'admin_pemeliharaan', 
          'admin_kebersihan', 
          'admin_keamanan', 
          'admin_fasilitas'
        ];

        const { data: employeesData, error: empError } = await supabase
          .from('users')
          .select('id, nama, role')
          .in('role', validRoles);

        if (empError) throw empError;

        if (employeesData && employeesData.length > 0) {
          setAvailableEmployees(employeesData.map(e => ({ name: e.nama, desc: e.role, id: e.id })));
        } else {
          setAvailableEmployees([]);
        }

        // Ambil data absensi berdasarkan tanggal hari ini (Format YYYY-MM-DD sesuai tipe DATE postgres)
        const todayStr = getLocalDateString();
        const { data: attData, error: attError } = await supabase
          .from('absensi')
          .select('id, karyawan_id, tanggal, jam_masuk, jam_keluar, status, lokasi, users!absensi_karyawan_id_fkey(nama, role)')
          .eq('tanggal', todayStr);

        if (attError) throw attError;

        if (attData && attData.length > 0) {
          setLogs(attData.map(row => ({
            id: row.id,
            name: row.users?.nama || 'Anonim',
            role: row.users?.role || 'Staff',
            date: row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            checkIn: row.jam_masuk || '—',
            checkOut: row.jam_keluar || '—',
            status: row.status || 'hadir',
            note: row.lokasi || 'Tepat waktu', 
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

  const handleOpenModal = () => {
    setFormName(availableEmployees.length > 0 ? availableEmployees[0].name : '');
    setFormStatus('hadir');
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
      alert('Silakan pilih nama karyawan yang valid dari daftar!');
      return;
    }

    try {
      const isAbsent = ['izin', 'sakit', 'alpha'].includes(formStatus.toLowerCase());
      
      // SINKRONISASI JURUS TIME: Sesuai tipe data TIME WITHOUT TIME ZONE (Format: HH:MM:SS)
      const jamMasuk = isAbsent ? null : `${formCheckIn}:00`;
      const jamKeluar = isAbsent ? null : `${formCheckOut}:00`;
      const note = formNote || 'Tepat waktu';
      const tanggalInput = getLocalDateString();

      const { data, error } = await supabase
        .from('absensi')
        .insert({
          karyawan_id: matchedEmployee.id,
          tanggal: tanggalInput,
          jam_masuk: jamMasuk,
          jam_keluar: jamKeluar,
          status: formStatus.toLowerCase(), 
          lokasi: note                      
        })
        .select('id, karyawan_id, tanggal, jam_masuk, jam_keluar, status, lokasi, users!absensi_karyawan_id_fkey(nama, role)')
        .single();

      if (error) throw error;

      if (data) {
        const newLog = {
          id: data.id,
          name: data.users?.nama || matchedEmployee.name,
          role: data.users?.role || matchedEmployee.desc,
          date: new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          checkIn: data.jam_masuk || '—',
          checkOut: data.jam_keluar || '—',
          status: data.status || 'hadir',
          note: data.lokasi || 'Tepat waktu',
          karyawan_id: data.karyawan_id
        };
        setLogs(prev => [newLog, ...prev]);
        showToast(`Berhasil mencatat absensi manual untuk ${formName}!`);
      }
    } catch (err) {
      console.error('Detailed Supabase Error:', err);
      alert(`Gagal menyimpan ke database!\nPesan: ${err.message}\nDetail: ${err.details || 'Gagal validasi RLS atau tipe data'}`);
    } finally {
      setIsModalOpen(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'Semua' || log.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || log.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const searchedEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(formName.toLowerCase())
  );

  const totalStaf = availableEmployees.length;
  const totalHadir = logs.filter(l => l.status === 'hadir').length;
  const totalAbsen = logs.filter(l => ['izin', 'sakit', 'alpha'].includes(l.status)).length;

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat data dari database...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {successToast && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg z-50">
          {successToast}
        </div>
      )}

      <div className="card-section p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-xl px-3 py-2 text-xs font-bold text-gray-700 bg-white shadow-sm outline-none w-44"
            >
              <option value="Semua">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 w-52 shadow-sm focus-within:border-gray-400 transition-colors">
            <Search className="text-gray-400 mr-2 flex-shrink-0" size={14} />
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-gray-800 outline-none border-none p-0 focus:ring-0 placeholder-gray-400"
            />
          </div>
        </div>

        <button onClick={handleOpenModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm">
          <Plus size={14} />
          <span>Input Absensi Manual</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Total Staf Terdaftar</span>
            <h4 className="text-gray-900 font-black text-2xl mt-1">{totalStaf} Orang</h4>
          </div>
          <div className="p-3 rounded-xl bg-gray-100 text-gray-700"><UserCheck size={18} /></div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider">Hadir Hari Ini</span>
            <h4 className="text-emerald-900 font-black text-2xl mt-1">{totalHadir} Orang</h4>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={18} /></div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-rose-700 font-semibold text-xs uppercase tracking-wider">Absen / Cuti</span>
            <h4 className="text-rose-900 font-black text-2xl mt-1">{totalAbsen} Orang</h4>
          </div>
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700"><UserX size={18} /></div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Log Kehadiran Semua Divisi Admin</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Riwayat absensi harian staf pengelola apartemen</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-gray-800">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b">
                <th className="p-3.5">Nama Staf</th>
                <th className="p-3.5">Jabatan / Role</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Masuk</th>
                <th className="p-3.5">Keluar</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Catatan / Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3.5 font-bold text-gray-900">{row.name}</td>
                  <td className="p-3.5 text-gray-500 capitalize">{row.role.replace('_', ' ')}</td>
                  <td className="p-3.5 text-gray-400">{row.date}</td>
                  <td className="p-3.5 font-mono font-bold text-gray-900">{row.checkIn}</td>
                  <td className="p-3.5 font-mono text-gray-400">{row.checkOut}</td>
                  <td className="p-3.5">
                    <span className={`uppercase text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      row.status === 'hadir' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-500 font-medium max-w-[180px] truncate" title={row.note}>{row.note}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-bold">Tidak ada data absensi yang ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="modal-box bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl border">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="text-sm font-bold uppercase text-gray-800">Input Absensi Manual</h4>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveAbsensi} className="space-y-4 text-xs font-bold text-gray-700">
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-gray-600">Pilih Nama Karyawan</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setIsDropdownOpen(true); }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full border rounded-xl p-2.5 font-semibold text-gray-800 outline-none focus:border-indigo-500 shadow-sm"
                  placeholder="Ketik nama staf..."
                />

                {isDropdownOpen && searchedEmployees.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-36 overflow-y-auto divide-y">
                    {searchedEmployees.map((emp, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setFormName(emp.name); setIsDropdownOpen(false); }}
                        className="p-2.5 hover:bg-gray-50 cursor-pointer transition flex flex-col"
                      >
                        <span className="font-bold text-gray-800">{emp.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium capitalize">{emp.desc.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-600">Status Kehadiran</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full border rounded-xl p-2.5 bg-white shadow-sm outline-none text-gray-800"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              {formStatus === 'hadir' && (
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-gray-600">Jam Masuk</label>
                    <input type="time" value={formCheckIn} onChange={(e) => setFormCheckIn(e.target.value)} className="w-full border rounded-xl p-2.5 text-gray-800 shadow-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-600">Jam Keluar</label>
                    <input type="time" value={formCheckOut} onChange={(e) => setFormCheckOut(e.target.value)} className="w-full border rounded-xl p-2.5 text-gray-800 shadow-sm outline-none" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-gray-600">Catatan Lokasi / Keterangan</label>
                <input type="text" value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="Contoh: Kantor Utama / WFH" className="w-full border rounded-xl p-2.5 text-gray-800 shadow-sm outline-none" />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-2.5 font-bold hover:bg-indigo-700 transition mt-2 shadow-md">
                Simpan Absensi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}