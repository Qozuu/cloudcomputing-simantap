import React, { useState } from 'react';
import { Search, Calendar, Users, AlertCircle, CheckCircle, X, MapPin, Smartphone, Clock } from 'lucide-react';

export default function AbsenKaryawan() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Rina Kurnia', division: 'Keuangan', checkIn: '08:02', checkOut: '17:05', status: 'Hadir', date: '20 Mei 2026', device: 'iPhone 13 (iOS)', location: 'Area Kantor Pengelola - Lantai 1', notes: 'Masuk tepat waktu' },
    { id: 2, name: 'Doni Praetya', division: 'Pemeliharaan', checkIn: '07:55', checkOut: '17:00', status: 'Hadir', date: '20 Mei 2026', device: 'Samsung Galaxy S22', location: 'Gedung Tower A - Engineering Room', notes: 'Standby perawatan lift' },
    { id: 3, name: 'Agus Wibowo', division: 'Keamanan', checkIn: '08:10', checkOut: '—', status: 'Hadir', date: '20 Mei 2026', device: 'Xiaomi Poco X5', location: 'Pos Gerbang Utama Barat', notes: 'Tugas Shift Pagi' },
    { id: 4, name: 'Siti Rahayu', division: 'Kebersihan', checkIn: '06:00', checkOut: '14:00', status: 'Hadir', date: '20 Mei 2026', device: 'Oppo A78', location: 'Area Lobby & Koridor Tower B', notes: 'Selesai membersihkan sektor tengah' },
    { id: 5, name: 'Pak Heri', division: 'Pemeliharaan', checkIn: '—', checkOut: '—', status: 'Tidak Hadir', date: '20 Mei 2026', device: '—', location: '—', notes: 'Izin (Sakit dengan surat keterangan dokter)' },
    { id: 6, name: 'Pak Roni', division: 'Pemeliharaan', checkIn: '09:30', checkOut: '—', status: 'Hadir', date: '20 Mei 2026', device: 'Vivo Y35', location: 'Gedung Parkir P2', notes: 'Terlambat karena kendala pengiriman material' },
    { id: 7, name: 'Budi Santoso', division: 'Fasilitas', checkIn: '09:00', checkOut: '—', status: 'Hadir', date: '20 Mei 2026', device: 'iPad Pro (iPadOS)', location: 'Ruang Direksi Utama', notes: 'Agenda rapat eksternal' },
    { id: 8, name: 'Dewi Puspita', division: 'Kebersihan', checkIn: '—', checkOut: '—', status: 'Tidak Hadir', date: '20 Mei 2026', device: '—', location: '—', notes: 'Alpa (Tanpa keterangan tanpa respon)' }
  ]);

  const [period, setPeriod] = useState('April 2026');
  const [divisionFilter, setDivisionFilter] = useState('Semua');
  const [successToast, setSuccessToast] = useState('');
  
  // State baru untuk mengatur modal detail simulasi
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
      case 'Tidak Hadir': return 'badge-pink';
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
              <option value="April 2026">April 2026</option>
              <option value="Maret 2026">Maret 2026</option>
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

      {/* KPI Stats Row — Cleaned Up for GM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-pink flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Hadir Hari Ini</span>
            <div className="card-icon-pink !mb-0">
              <Users size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">34 Staff</h4>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Tidak Hadir</span>
            <div className="card-icon-lavender !mb-0">
              <AlertCircle size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">4 Orang</h4>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="card-section p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#EAE6E1] mb-5 gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
              Daftar Absensi — Rabu, 20 Mei 2026
            </h3>
            <p className="text-xs text-[#8A857F] font-medium">Data check-in harian yang tercatat di sistem apartemen</p>
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
              {filteredEmployees.map((emp, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL SIMULASI DETAIL KEHADIRAN (HANYA VIEW UNTUK GM) */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-[#FAF6F0] border border-[#EAE6E1] rounded-2xl max-w-md w-full shadow-2xl p-6 relative animate-scale-up space-y-4">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#EAE6E1] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#1E1E1E] tracking-tight">Detail Log Keaktifan Karyawan</h3>
                <p className="text-[11px] text-[#8A857F]">{selectedEmployee.date}</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1 rounded-lg text-[#8A857F] hover:bg-[#EAE6E1] hover:text-[#1E1E1E] transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Singkat */}
            <div className="bg-white p-4 rounded-xl border border-[#EAE6E1] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1E1E1E]">{selectedEmployee.name}</h4>
                <p className="text-xs text-[#8A857F] mt-0.5">Divisi: {selectedEmployee.division}</p>
              </div>
              <span className={`badge-base ${getStatusClass(selectedEmployee.status)}`}>
                {selectedEmployee.status}
              </span>
            </div>

            {/* Data Log Kehadiran Teknis */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <Clock size={14} className="text-[#8A857F] shrink-0" />
                <div className="grid grid-cols-2 w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <div><span className="text-[#8A857F]">Masuk:</span> <strong className="font-mono">{selectedEmployee.checkIn}</strong></div>
                  <div><span className="text-[#8A857F]">Keluar:</span> <strong className="font-mono">{selectedEmployee.checkOut}</strong></div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <Smartphone size={14} className="text-[#8A857F] shrink-0" />
                <div className="w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <span className="text-[#8A857F]">Perangkat Absen:</span> <span className="font-medium">{selectedEmployee.device}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#1E1E1E]">
                <MapPin size={14} className="text-[#8A857F] shrink-0" />
                <div className="w-full bg-white px-3 py-2 rounded-lg border border-[#EAE6E1]">
                  <span className="text-[#8A857F]">Titik Lokasi GPS:</span> <span className="font-medium">{selectedEmployee.location}</span>
                </div>
              </div>
            </div>

            {/* Keterangan Tambahan / Catatan Lapangan */}
            <div className="bg-white p-3 rounded-xl border border-[#EAE6E1] space-y-1">
              <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Catatan Sistem / HRD:</span>
              <p className="text-xs text-[#1E1E1E] font-medium italic">"{selectedEmployee.notes}"</p>
            </div>

            {/* Footer Modal */}
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