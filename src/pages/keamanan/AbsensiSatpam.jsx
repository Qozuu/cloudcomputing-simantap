import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Download,
  Plus,
  CheckCircle2,
  X,
  Save,
  Check,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AbsensiSatpam() {
  const [successToast, setSuccessToast] = useState('');
  const [month, setMonth] = useState('April 2026');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState(null);

  // Form states
  const [formPetugas, setFormPetugas] = useState('');
  const [formShift, setFormShift] = useState('Pagi 06-14');
  const [formMasuk, setFormMasuk] = useState('06:00');
  const [formKeluar, setFormKeluar] = useState('14:00');
  const [formStatus, setFormStatus] = useState('Hadir');

  // State untuk mengontrol dropdown kustom (Anti-Bug)
  const [openDropdownPetugas, setOpenDropdownPetugas] = useState(false);
  const [openDropdownShift, setOpenDropdownShift] = useState(false);
  const [openDropdownStatus, setOpenDropdownStatus] = useState(false);

  // State pencarian nama petugas di dalam dropdown modal
  const [searchPetugasInput, setSearchPetugasInput] = useState('');

  const [petugasList, setPetugasList] = useState([]);
  const [petugasMap, setPetugasMap] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const shiftList = ['Pagi 06-14', 'Siang 14-22', 'Malam 22-06'];
  const statusList = ['Hadir', 'Izin'];

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch today's attendance
      const { data: absData } = await supabase
        .from('absensi')
        .select('*, karyawan:users(nama,role)')
        .eq('tanggal', todayStr);

      if (absData) {
        setAttendance(absData.map(item => ({
          id: item.id,
          nama: item.karyawan?.nama || '—',
          shift: item.shift || 'Pagi 06-14',
          masuk: item.jam_masuk || '-',
          keluar: item.jam_keluar || '-',
          status: item.status === 'hadir' ? 'Hadir' : 'Izin'
        })));
      }

      // 2. Fetch security users / karyawan
      const { data: userData } = await supabase
        .from('users')
        .select('id, nama, role')
        .neq('role', 'penghuni')
        .neq('role', 'super_admin');

      if (userData) {
        const securityStaff = userData.filter(u => u.role === 'div_keamanan');
        const staffToUse = securityStaff.length > 0 ? securityStaff : userData;
        setPetugasList(staffToUse.map(u => u.nama));
        setPetugasMap(staffToUse);
        if (staffToUse.length > 0 && !formPetugas) {
          setFormPetugas(staffToUse[0].nama);
        }
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    setOpenDropdownShift(false);
    setOpenDropdownStatus(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!selectedAbsensi) return;

    try {
      const { error } = await supabase
        .from('absensi')
        .update({
          shift: formShift,
          jam_masuk: formStatus === 'Hadir' ? formMasuk : null,
          jam_keluar: formStatus === 'Hadir' ? formKeluar : null,
          status: formStatus.toLowerCase()
        })
        .eq('id', selectedAbsensi.id);

      if (error) throw error;

      setEditModalOpen(false);
      setSuccessToast('Data diedit');
      setTimeout(() => setSuccessToast(''), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to update attendance:', err.message);
    }
  };

  const handleAddAbsensi = async (e) => {
    e.preventDefault();
    const matched = petugasMap.find(p => p.nama === formPetugas);
    if (!matched) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('absensi')
        .insert({
          karyawan_id: matched.id,
          tanggal: todayStr,
          shift: formShift,
          jam_masuk: formStatus === 'Hadir' ? formMasuk : null,
          jam_keluar: formStatus === 'Hadir' ? formKeluar : null,
          status: formStatus.toLowerCase()
        });

      if (error) throw error;

      setAddModalOpen(false);
      setSearchPetugasInput('');
      setSuccessToast('Absensi petugas berhasil dicatat.');
      setTimeout(() => setSuccessToast(''), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to add attendance:', err.message);
    }
  };

  const filteredAttendance = attendance.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPetugas = petugasList.length || 8;
  const hadirHariIni = attendance.filter(a => a.status === 'Hadir').length;
  const izinHariIni = attendance.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
  const hadirPercentage = `${Math.round((hadirHariIni / (attendance.length || 1)) * 100)}%`;


  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls row */}
      <div className="card-section p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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

          {/* Search Bar - SOLVED OVERLAP BUG */}
          <div className="relative flex items-center w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#8A857F]">
              <Search size={14} className="stroke-[2.5]" />
            </div>
            <input
              type="text"
              placeholder="Cari nama petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 py-2 input-modern text-xs font-semibold shadow-sm"
              style={{ paddingLeft: '2.75rem' }} 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormPetugas('Eko Susanto');
              setFormShift('Pagi 06-14');
              setFormStatus('Hadir');
              setFormMasuk('06:00');
              setFormKeluar('14:00');
              setOpenDropdownPetugas(false);
              setOpenDropdownShift(false);
              setOpenDropdownStatus(false);
              setSearchPetugasInput('');
              setAddModalOpen(true);
            }}
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
        <div className="card-pink flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Total Petugas</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">{totalPetugas}</p>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Satpam aktif</p>
        </div>

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

        <div className="card-lavender flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-[#8A857F] font-semibold text-xs">Izin / Sakit</p>
            <p className="text-[#1E1E1E] font-black text-2xl mt-1">{izinHariIni}</p>
          </div>
          <p className="text-[#8A857F] font-semibold text-xs mt-1">Hari ini</p>
        </div>

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
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((item) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-xs font-semibold text-muted">
                    Petugas dengan nama "{searchTerm}" tidak ditemukan.
                  </td>
                </tr>
              )}
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
                <div className="progress-track">
                  <div
                    className={`progress-fill ${isGreen ? 'progress-mint' : 'progress-pink'}`}
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
          <div className="modal-box !overflow-visible">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Edit Absensi: {selectedAbsensi.nama}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="modal-body space-y-4">
              {/* Custom Dropdown: Shift Kerja */}
              <div className="relative">
                <label className="label-modern">Shift Kerja</label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdownShift(!openDropdownShift);
                    setOpenDropdownStatus(false);
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{formShift}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${openDropdownShift ? 'rotate-180' : ''}`} />
                </button>
                {openDropdownShift && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden">
                    {shiftList.map((shift, i) => (
                      <div
                        key={i}
                        onClick={() => { setFormShift(shift); setOpenDropdownShift(false); }}
                        className="px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft cursor-pointer transition text-left"
                      >
                        {shift}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid Jam Masuk dan Keluar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">Jam Masuk</label>
                  <input
                    type="text"
                    required
                    value={formMasuk}
                    onChange={(e) => setFormMasuk(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Keluar</label>
                  <input
                    type="text"
                    required
                    value={formKeluar}
                    onChange={(e) => setFormKeluar(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              {/* Custom Dropdown: Status */}
              <div className="relative">
                <label className="label-modern">Status</label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdownStatus(!openDropdownStatus);
                    setOpenDropdownShift(false);
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{formStatus}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${openDropdownStatus ? 'rotate-180' : ''}`} />
                </button>
                {openDropdownStatus && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden">
                    {statusList.map((st, i) => (
                      <div
                        key={i}
                        onClick={() => { setFormStatus(st); setOpenDropdownStatus(false); }}
                        className="px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft cursor-pointer transition text-left"
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                )}
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

      {/* ADD MODAL — WITH SEARCH BAR IN DROPDOWN */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box !overflow-visible">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Catat Absensi Petugas Baru
              </h3>
              <button 
                onClick={() => {
                  setAddModalOpen(false);
                  setSearchPetugasInput('');
                }} 
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAbsensi} className="modal-body space-y-4">
              {/* Custom Dropdown: Nama Petugas + Fitur Search */}
              <div className="relative">
                <label className="label-modern">Nama Petugas</label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdownPetugas(!openDropdownPetugas);
                    setOpenDropdownShift(false);
                    setOpenDropdownStatus(false);
                    setSearchPetugasInput('');
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{formPetugas}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${openDropdownPetugas ? 'rotate-180' : ''}`} />
                </button>
                
                {openDropdownPetugas && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden flex flex-col max-h-56">
                    {/* Search Bar Input inside dropdown */}
                    <div className="p-2 border-b border-soft bg-[#FAFAFA] sticky top-0 z-10 flex items-center gap-2">
                      <Search size={12} className="text-muted ml-1" />
                      <input
                        type="text"
                        placeholder="Ketik nama petugas..."
                        value={searchPetugasInput}
                        onChange={(e) => setSearchPetugasInput(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-soft rounded-lg text-xs font-semibold outline-none focus:border-ink"
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </div>

                    {/* Filtered list */}
                    <div className="overflow-y-auto flex-1 max-h-40">
                      {petugasList.filter(p => 
                        p.toLowerCase().includes(searchPetugasInput.toLowerCase())
                      ).length > 0 ? (
                        petugasList
                          .filter(p => p.toLowerCase().includes(searchPetugasInput.toLowerCase()))
                          .map((p, idx) => (
                            <div
                              key={idx}
                              onClick={() => { 
                                setFormPetugas(p); 
                                setOpenDropdownPetugas(false); 
                                setSearchPetugasInput(''); 
                              }}
                              className="px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft cursor-pointer transition text-left flex justify-between items-center"
                            >
                              <span>{p}</span>
                              {formPetugas === p && <Check size={12} className="text-emerald-600 stroke-[3]" />}
                            </div>
                          ))
                      ) : (
                        <div className="px-4 py-3 text-center text-[11px] font-medium text-muted">
                          Nama tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Dropdown: Shift Kerja */}
              <div className="relative">
                <label className="label-modern">Shift Kerja</label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdownShift(!openDropdownShift);
                    setOpenDropdownPetugas(false);
                    setOpenDropdownStatus(false);
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{formShift}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${openDropdownShift ? 'rotate-180' : ''}`} />
                </button>
                {openDropdownShift && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden">
                    {shiftList.map((shift, i) => (
                      <div
                        key={i}
                        onClick={() => { setFormShift(shift); setOpenDropdownShift(false); }}
                        className="px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft cursor-pointer transition text-left"
                      >
                        {shift}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid Jam Masuk dan Keluar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">Jam Masuk</label>
                  <input
                    type="text"
                    required
                    value={formMasuk}
                    onChange={(e) => setFormMasuk(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Keluar</label>
                  <input
                    type="text"
                    required
                    value={formKeluar}
                    onChange={(e) => setFormKeluar(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              {/* Custom Dropdown: Status */}
              <div className="relative">
                <label className="label-modern">Status</label>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdownStatus(!openDropdownStatus);
                    setOpenDropdownPetugas(false);
                    setOpenDropdownShift(false);
                  }}
                  className="w-full flex items-center justify-between input-modern text-xs font-semibold bg-[#FAFAFA]"
                >
                  <span>{formStatus}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${openDropdownStatus ? 'rotate-180' : ''}`} />
                </button>
                {openDropdownStatus && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-soft rounded-xl shadow-xl z-[9999] overflow-hidden">
                    {statusList.map((st, i) => (
                      <div
                        key={i}
                        onClick={() => { setFormStatus(st); setOpenDropdownStatus(false); }}
                        className="px-4 py-2.5 text-xs font-semibold text-ink hover:bg-soft cursor-pointer transition text-left"
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                )}
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
                  onClick={() => {
                    setAddModalOpen(false);
                    setSearchPetugasInput('');
                  }}
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