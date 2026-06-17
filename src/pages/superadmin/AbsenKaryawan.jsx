import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, AlertCircle, CheckCircle, X, MapPin, Smartphone, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AbsenKaryawan() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Mei 2026');
  const [divisionFilter, setDivisionFilter] = useState('Semua');
  const [successToast, setSuccessToast] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Mengambil tanggal hari ini dalam format lokal untuk Judul Tabel
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

 useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Sekarang kueri join ini dijamin 100% tembus karena RLS SELECT users sudah dibuka!
        const { data, error } = await supabase
          .from('absensi')
          .select(`
            id, 
            tanggal, 
            jam_masuk, 
            jam_keluar, 
            status, 
            lokasi, 
            karyawan_id,
            users!absensi_karyawan_id_fkey (
              nama, 
              role
            )
          `)
          .eq('tanggal', todayStr);

        if (error) throw error;

        if (data) {
          setEmployees(data.map(item => {
            const userData = item.users; 
            
            // Konversi ke lowercase agar deteksi string role aman
            const role = (userData?.role || '').toLowerCase();
            let divName = 'Lainnya';
            
            if (role.includes('keuangan')) divName = 'Keuangan';
            else if (role.includes('pemeliharaan') || role.includes('teknisi')) divName = 'Pemeliharaan';
            else if (role.includes('keamanan')) divName = 'Keamanan';
            else if (role.includes('kebersihan')) divName = 'Kebersihan';
            else if (role.includes('fasilitas')) divName = 'Fasilitas';
            else if (role.includes('sdm')) divName = 'SDM';
            else if (role.includes('super_admin')) divName = 'Management';

            const dateObj = new Date(item.tanggal);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            let displayStatus = 'Tidak Hadir';
            if (item.status === 'hadir') displayStatus = 'Hadir';
            else if (item.status === 'izin') displayStatus = 'Izin';
            else if (item.status === 'sakit') displayStatus = 'Sakit';
            else if (item.status === 'alpha') displayStatus = 'Alpha';

            return {
              id: item.id,
              name: userData?.nama || 'Tanpa Nama', 
              division: divName,
              checkIn: item.jam_masuk ? item.jam_masuk.substring(0, 5) : '—',
              checkOut: item.jam_keluar ? item.jam_keluar.substring(0, 5) : '—',
              status: displayStatus,
              date: formattedDate,
              device: 'Sistem Presensi Mobilitas', 
              location: item.lokasi || 'Area Apartemen',
              notes: item.status === 'hadir' ? 'Tercatat aktif di sistem' : `Keterangan harian: ${item.status || 'Tanpa keterangan'}`
            };
          }));
        }
      } catch (err) {
        console.error('Error fetching employee attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  // Menghitung statistik KPI secara dinamis berdasarkan data real dari tabel absensi
  const totalHadir = employees.filter(emp => emp.status === 'Hadir').length;
  const totalTidakHadir = employees.filter(emp => emp.status !== 'Hadir').length;

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'badge-lavender';
      case 'Pemeliharaan': return 'badge-yellow';
      case 'Keamanan': return 'badge-dark';
      case 'Kebersihan': return 'badge-mint';
      case 'Fasilitas': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Hadir': return 'badge-mint';
      case 'Izin': case 'Sakit': return 'badge-yellow';
      case 'Tidak Hadir': case 'Alpha': return 'badge-pink';
      default: return 'badge-gray';
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleOpenDetail = (emp) => {
    setSelectedEmployee(emp);
    showToast(`Membuka detail log ${emp.name}`);
  };

  const filteredEmployees = employees.filter(emp => {
    return divisionFilter === 'Semua' || emp.division === divisionFilter;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filters row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Periode:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
            >
              <option value="Mei 2026">Mei 2026</option>
              <option value="April 2026">April 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Divisi:</span>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
            >
              <option value="Semua">Semua Divisi</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Pemeliharaan">Pemeliharaan</option>
              <option value="Keamanan">Keamanan</option>
              <option value="Kebersihan">Kebersihan</option>
              <option value="Fasilitas">Fasilitas</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Row — Validasi Otomatis dari Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-pink flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Hadir Hari Ini</span>
            <div className="card-icon-pink !mb-0">
              <Users size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">{loading ? '...' : `${totalHadir} Staf`}</h4>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Absen / Izin / Sakit</span>
            <div className="card-icon-lavender !mb-0">
              <AlertCircle size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">{loading ? '...' : `${totalTidakHadir} Orang`}</h4>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="card-section p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#EAE6E1] mb-5 gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
              Daftar Absensi — {formattedToday}
            </h3>
            <p className="text-xs text-[#8A857F] font-medium">Data log presensi harian terintegrasi langsung dengan database public.absensi</p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-12">No</th>
                <th>Nama Karyawan</th>
                <th>Divisi</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-xs text-[#8A857F]">Sinkronisasi data Supabase...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-xs text-[#8A857F]">Tidak ada data absensi yang tercatat untuk hari ini ({formattedToday}).</td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td className="text-[#8A857F] font-bold">{idx + 1}</td>
                    <td className="font-bold text-[#1E1E1E]">{emp.name}</td>
                    <td>
                      <span className={`badge-base ${getDivisionBadgeClass(emp.division)}`}>
                        {emp.division}
                      </span>
                    </td>
                    <td className="font-mono text-[#8A857F]">{emp.checkIn}</td>
                    <td className="font-mono text-[#8A857F]">{emp.checkOut}</td>
                    <td>
                      <span className={`badge-base ${getStatusClass(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenDetail(emp)}
                        className="text-xs font-bold text-[#1E1E1E] hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL MONITORING KEHADIRAN (READ ONLY) */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-[#FAF6F0] border border-[#EAE6E1] rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-scale-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#EAE6E1] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#1E1E1E] tracking-tight">Detail Log Keaktifan Staf</h3>
                <p className="text-[11px] text-[#8A857F]">{selectedEmployee.date}</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded-lg text-[#8A857F] hover:bg-[#EAE6E1] hover:text-[#1E1E1E] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#EAE6E1] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1E1E1E]">{selectedEmployee.name}</h4>
                <p className="text-xs text-[#8A857F] mt-0.5">Divisi Sistem: {selectedEmployee.division}</p>
              </div>
              <span className={`badge-base ${getStatusClass(selectedEmployee.status)}`}>
                {selectedEmployee.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <Clock size={14} className="text-[#8A857F] shrink-0" />
                <div className="grid grid-cols-2 w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <div><span className="text-[#8A857F]">Jam Masuk:</span> <strong className="font-mono">{selectedEmployee.checkIn}</strong></div>
                  <div><span className="text-[#8A857F]">Jam Keluar:</span> <strong className="font-mono">{selectedEmployee.checkOut}</strong></div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <Smartphone size={14} className="text-[#8A857F] shrink-0" />
                <div className="w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <span className="text-[#8A857F]">Metode Tracking:</span> <span className="font-medium">{selectedEmployee.device}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <MapPin size={14} className="text-[#8A857F] shrink-0" />
                <div className="w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <span className="text-[#8A857F]">Koordinat / Lokasi:</span> <span className="font-medium">{selectedEmployee.location}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#EAE6E1] space-y-1">
              <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Log Audit Lapangan:</span>
              <p className="text-xs text-[#1E1E1E] font-medium italic">"{selectedEmployee.notes}"</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full bg-[#1E1E1E] hover:bg-[#2e2e2e] text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
              >
                Selesai Meninjau
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <CheckCircle size={16} />
          <div>
            <p className="text-[10px] text-white/70 font-semibold">Sukses</p>
            <p className="text-xs font-bold leading-none mt-0.5">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}