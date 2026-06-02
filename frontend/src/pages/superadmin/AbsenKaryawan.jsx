import React, { useState } from 'react';
import { Plus, X, Search, FileDown, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function AbsenKaryawan() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Rina Kurnia', division: 'Keuangan', checkIn: '08:02', checkOut: '17:05', status: 'Hadir' },
    { id: 2, name: 'Doni Praetya', division: 'Pemeliharaan', checkIn: '07:55', checkOut: '17:00', status: 'Hadir' },
    { id: 3, name: 'Agus Wibowo', division: 'Keamanan', checkIn: '08:10', checkOut: '—', status: 'Hadir' },
    { id: 4, name: 'Siti Rahayu', division: 'Kebersihan', checkIn: '06:00', checkOut: '14:00', status: 'Hadir' },
    { id: 5, name: 'Pak Heri', division: 'Pemeliharaan', checkIn: '—', checkOut: '—', status: 'Izin' },
    { id: 6, name: 'Pak Roni', division: 'Pemeliharaan', checkIn: '09:30', checkOut: '—', status: 'Hadir' },
    { id: 7, name: 'Budi Santoso', division: 'Management', checkIn: '09:00', checkOut: '—', status: 'Hadir' },
    { id: 8, name: 'Dewi Puspita', division: 'Kebersihan', checkIn: '—', checkOut: '—', status: 'Sakit' }
  ]);

  const [period, setPeriod] = useState('April 2026');
  const [divisionFilter, setDivisionFilter] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const [newAbsence, setNewAbsence] = useState({
    name: '',
    division: 'Keuangan',
    checkIn: '',
    checkOut: '',
    status: 'Hadir'
  });

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'badge-lavender';
      case 'Pemeliharaan': return 'badge-yellow';
      case 'Keamanan': return 'badge-dark';
      case 'Kebersihan': return 'badge-mint';
      case 'Management': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Hadir': return 'badge-mint';
      case 'Izin': return 'badge-yellow';
      case 'Sakit': return 'badge-pink';
      default: return 'badge-gray';
    }
  };

  const handleExport = () => {
    showToast('Rekapitulasi_Karyawan_April_2026.xlsx berhasil diunduh!');
  };

  const handleManualAbsence = (e) => {
    e.preventDefault();
    if (!newAbsence.name) return;

    const added = {
      id: Date.now(),
      name: newAbsence.name,
      division: newAbsence.division,
      checkIn: newAbsence.checkIn || '—',
      checkOut: newAbsence.checkOut || '—',
      status: newAbsence.status
    };

    setEmployees(prev => [added, ...prev]);
    setModalOpen(false);
    showToast(`Absensi manual ${newAbsence.name} berhasil dicatat!`);
    setNewAbsence({ name: '', division: 'Keuangan', checkIn: '', checkOut: '', status: 'Hadir' });
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    return divisionFilter === 'Semua' || emp.division === divisionFilter;
  });

  const departmentRecap = [
    { name: 'Keuangan', pct: 99, progressClass: 'progress-lavender' },
    { name: 'Pemeliharaan', pct: 93, progressClass: 'progress-pink' },
    { name: 'Keamanan', pct: 92, progressClass: 'progress-dark' },
    { name: 'Kebersihan', pct: 88, progressClass: 'progress-mint' },
    { name: 'Management', pct: 100, progressClass: 'progress-lavender' }
  ];

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
              <option value="Management">Management</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="btn-ghost btn-sm"
        >
          <FileDown size={14} />
          <span>Export Rekapitulasi</span>
        </button>
      </div>

      {/* KPI Stats Row - Rotation Applied */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Hadir Hari Ini</span>
            <div className="card-icon-pink !mb-0">
              <Users size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">34 Staff</h4>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">dari 38 karyawan</span>
        </div>

        <div className="card-yellow flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Izin / Sakit</span>
            <div className="card-icon-yellow !mb-0">
              <Calendar size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">3 Karyawan</h4>
          <span className="text-[10px] text-[#8A857F] font-bold mt-1">2 izin, 1 sakit</span>
        </div>

        <div className="card-lavender flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Tidak Hadir</span>
            <div className="card-icon-lavender !mb-0">
              <AlertCircle size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">1 Orang</h4>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Tanpa keterangan</span>
        </div>

        <div className="card-mint flex flex-col justify-between min-h-[120px] hover:scale-[1.01] transition">
          <div className="flex justify-between items-start">
            <span className="text-[#8A857F] font-semibold text-xs">Rata Kehadiran</span>
            <div className="card-icon-mint !mb-0">
              <CheckCircle size={16} />
            </div>
          </div>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">91.4%</h4>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Bulan April 2026</span>
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
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary btn-sm self-start md:self-auto"
          >
            <Plus size={14} />
            <span>+ Input Absen Manual</span>
          </button>
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
                      onClick={() => showToast(`Detail kehadiran ${emp.name} (Simulasi)`)}
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

      {/* Recap Progress Bars Section */}
      <div className="card-section p-6">
        <div className="pb-4 border-b border-[#EAE6E1] mb-5">
          <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
            Rekapitulasi Kehadiran — April 2026
          </h3>
          <p className="text-xs text-[#8A857F] font-medium">Persentase tingkat kehadiran karyawan per divisi</p>
        </div>

        <div className="space-y-5 max-w-2xl">
          {departmentRecap.map((recap, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="w-1/4 min-w-[120px]">
                <span className="text-xs font-bold text-[#1E1E1E]">{recap.name}</span>
              </div>
              
              <div className="flex-1 progress-track">
                <div 
                  className={`progress-fill ${recap.progressClass}`} 
                  style={{ width: `${recap.pct}%` }}
                />
              </div>

              <div className="w-12 text-right">
                <span className="text-xs font-bold text-[#1E1E1E]">{recap.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Input Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">Input Absen Manual</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Tambah data kehadiran karyawan</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleManualAbsence} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Karyawan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Roni Wijaya"
                  value={newAbsence.name}
                  onChange={(e) => setNewAbsence(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Divisi</label>
                  <select
                    value={newAbsence.division}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, division: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Keuangan">Keuangan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Status Kehadiran</label>
                  <select
                    value={newAbsence.status}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, status: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Masuk (Opsional)</label>
                  <input
                    type="time"
                    value={newAbsence.checkIn}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Keluar (Opsional)</label>
                  <input
                    type="time"
                    value={newAbsence.checkOut}
                    onChange={(e) => setNewAbsence(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="input-modern"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                >
                  Simpan Absen
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost"
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
