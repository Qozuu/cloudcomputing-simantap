import React, { useState } from 'react';
import {
  ChevronDown,
  Download,
  Plus,
  CheckCircle2,
  X,
  Save,
  Check
} from 'lucide-react';

export default function AbsensiSatpam() {
  const [successToast, setSuccessToast] = useState('');
  const [month, setMonth] = useState('April 2026');
  
  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);

  // Form states
  const [formPetugas, setFormPetugas] = useState('Eko Susanto');
  const [formShift, setFormShift] = useState('Pagi 06-14');
  const [formMasuk, setFormMasuk] = useState('06:00');
  const [formKeluar, setFormKeluar] = useState('14:00');
  const [formStatus, setFormStatus] = useState('Hadir');

  const petugasList = [
    'Eko Susanto',
    'Tanto Wirawan',
    'Hari Purnomo',
    'Dimas Saputra',
    'Wahyu Nugroho',
    'Roni Setiawan',
    'Agus Setiadi',
    'Prasetyo Utomo'
  ];

  const [attendance, setAttendance] = useState([
    { id: 1, nama: 'Eko Susanto', shift: 'Pagi 06-14', masuk: '05:58', keluar: '14:05', status: 'Hadir' },
    { id: 2, nama: 'Tanto Wirawan', shift: 'Pagi 06-14', masuk: '06:03', keluar: '14:00', status: 'Hadir' },
    { id: 3, nama: 'Hari Purnomo', shift: 'Siang 14-22', masuk: '13:55', keluar: '22:10', status: 'Hadir' },
    { id: 4, nama: 'Dimas Saputra', shift: 'Siang 14-22', masuk: '14:10', keluar: '-', status: 'Hadir' },
    { id: 5, nama: 'Wahyu Nugroho', shift: 'Malam 22-06', masuk: '-', keluar: '-', status: 'Izin' },
    { id: 6, nama: 'Roni Setiawan', shift: 'Malam 22-06', masuk: '21:50', keluar: '-', status: 'Hadir' }
  ]);

  const [rekap] = useState([
    { nama: 'Eko Susanto', persen: 96 },
    { nama: 'Tanto Wirawan', persen: 100 },
    { nama: 'Hari Purnomo', persen: 88 },
    { nama: 'Dimas Saputra', persen: 92 },
    { nama: 'Wahyu Nugroho', persen: 84 },
    { nama: 'Roni Setiawan', persen: 96 }
  ]);

  const getShiftColor = (shift) => {
    if (shift.includes('Pagi')) return 'text-[#4840B0]';
    if (shift.includes('Siang')) return 'text-[#A05820]';
    return 'text-[#187050]';
  };

  const handleExport = () => {
    setSuccessToast('Absensi_Satpam.xlsx berhasil diunduh!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleOpenEdit = (item) => {
    setSelectedAbsensi(item);
    setFormShift(item.shift);
    setFormMasuk(item.masuk);
    setFormKeluar(item.keluar);
    setFormStatus(item.status);
    setEditModalOpen(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setAttendance(prev =>
      prev.map(item =>
        item.id === selectedAbsensi.id
          ? { ...item, shift: formShift, masuk: formMasuk, keluar: formKeluar, status: formStatus }
          : item
      )
    );
    setEditModalOpen(false);
    
    // Edit Save Toast
    setSuccessToast('Data diedit');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleAddAbsensi = (e) => {
    e.preventDefault();
    const newAbs = {
      id: Date.now(),
      nama: formPetugas,
      shift: formShift,
      masuk: formStatus === 'Hadir' ? formMasuk : '-',
      keluar: formStatus === 'Hadir' ? formKeluar : '-',
      status: formStatus
    };

    setAttendance(prev => [...prev, newAbs]);
    setAddModalOpen(false);

    setSuccessToast('Absensi petugas berhasil dicatat.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Recalculating stats based on local state
  const totalPetugas = 8;
  const hadirHariIni = attendance.filter(a => a.status === 'Hadir').length;
  const izinHariIni = attendance.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
  const hadirPercentage = `${Math.round((hadirHariIni / (attendance.length || 1)) * 100)}%`;

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls row */}
      <div className="card-section p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-44">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full pl-4 pr-10 py-2 input-modern select-modern text-xs font-bold shadow-sm"
          >
            <option value="April 2026">April 2026</option>
            <option value="Maret 2026">Maret 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Catat Absensi</span>
          </button>
          
          <button
            onClick={handleExport}
            className="btn-ghost py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div className="card-pink flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Total Petugas</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">{totalPetugas}</p>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Satpam aktif</p>
        </div>

        {/* Stat 2 */}
        <div className="card-yellow flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Hadir Hari Ini</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[#1E1E1E] font-black text-2xl">{hadirHariIni}</p>
              <span className="badge-base text-[9px]" style={{ backgroundColor: 'rgba(252,214,165,0.6)', color: '#A05820' }}>
                {hadirPercentage}
              </span>
            </div>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Absensi masuk</p>
        </div>

        {/* Stat 3 */}
        <div className="card-lavender flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Izin / Sakit</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">{izinHariIni}</p>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Hari ini</p>
        </div>

        {/* Stat 4 */}
        <div className="card-mint flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Rata-rata Kehadiran</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">93.2%</p>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Bulan April</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5">
          Absensi Satpam — 22 April 2026
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama Petugas</th>
                <th>Shift</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-ink">{item.nama}</td>
                  <td className={`font-extrabold ${getShiftColor(item.shift)}`}>{item.shift}</td>
                  <td className="font-bold text-ink">{item.masuk}</td>
                  <td className="text-muted">{item.keluar}</td>
                  <td>
                    {item.status === 'Hadir' ? (
                      <span className="badge-base badge-mint">
                        <Check size={10} className="stroke-[3]" />
                        <span>Hadir</span>
                      </span>
                    ) : (
                      <span className="badge-base badge-pink">
                        <span>Izin</span>
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="text-ink hover:underline font-bold text-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rekap Kehadiran Bulan Ini Section */}
      <div className="card-section p-6 space-y-6">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-4">
          Rekap Kehadiran Bulan Ini
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {rekap.map((item, idx) => {
            const isGreen = item.persen >= 90;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink">
                  <span className="font-bold">{item.nama}</span>
                  <span className="font-extrabold">{item.persen}%</span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="progress-track">
                  <div
                    className={`progress-fill ${
                      isGreen ? 'progress-mint' : 'progress-pink'
                    }`}
                    style={{ width: `${item.persen}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && selectedAbsensi && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Edit Absensi: {selectedAbsensi.nama}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="modal-body space-y-4">
              <div>
                <label className="label-modern">
                  Shift Kerja
                </label>
                <select
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Pagi 06-14">Pagi 06-14</option>
                  <option value="Siang 14-22">Siang 14-22</option>
                  <option value="Malam 22-06">Malam 22-06</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">
                    Jam Masuk
                  </label>
                  <input
                    type="text"
                    required
                    value={formMasuk}
                    onChange={(e) => setFormMasuk(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">
                    Jam Keluar
                  </label>
                  <input
                    type="text"
                    required
                    value={formKeluar}
                    onChange={(e) => setFormKeluar(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  <Save size={13} />
                  <span>Simpan Perubahan</span>
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

      {/* ADD MODAL */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Catat Absensi Petugas Baru
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAbsensi} className="modal-body space-y-4">
              <div>
                <label className="label-modern">
                  Nama Petugas
                </label>
                <select
                  value={formPetugas}
                  onChange={(e) => setFormPetugas(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  {petugasList.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-modern">
                  Shift Kerja
                </label>
                <select
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Pagi 06-14">Pagi 06-14</option>
                  <option value="Siang 14-22">Siang 14-22</option>
                  <option value="Malam 22-06">Malam 22-06</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">
                    Jam Masuk
                  </label>
                  <input
                    type="text"
                    required
                    value={formMasuk}
                    onChange={(e) => setFormMasuk(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">
                    Jam Keluar
                  </label>
                  <input
                    type="text"
                    required
                    value={formKeluar}
                    onChange={(e) => setFormKeluar(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  <CheckCircle2 size={13} />
                  <span>Catat Absensi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Export Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
