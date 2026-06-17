import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

// =========================================================================
// DATA SIMULASI HISTORIS 6 BULAN TERAKHIR (JANUARI - JUNI 2026)
// Murni hanya berisi Teknisi lapangan (Admin Pemeliharaan tidak dimasukkan)
// =========================================================================
const MOCK_MONTHLY_DATA = {
  'Juni 2026': {
    stats: { total: 9, hadir: 6, izin: 2, alpha: 1, percent: '66.7' },
    details: [
      { name: 'Supriadi', role: 'teknisi', checkIn: '07:45:00', checkOut: '17:00:00', status: 'hadir', karyawan_id: 'tech-d1' },
      { name: 'Ahmad Fauzi', role: 'teknisi', checkIn: '07:55:00', checkOut: '17:00:00', status: 'hadir', karyawan_id: 'tech-d2' },
      { name: 'Dedi Kurniawan', role: 'teknisi', checkIn: '08:15:00', checkOut: '-', status: 'hadir', karyawan_id: 'tech-d3' },
      { name: 'Hendro Setiawan', role: 'teknisi', checkIn: '07:50:00', checkOut: '17:00:00', status: 'hadir', karyawan_id: 'tech-d4' },
      { name: 'Rian Hidayat', role: 'teknisi', checkIn: '08:30:00', checkOut: '-', status: 'hadir', karyawan_id: 'tech-d5' },
      { name: 'Eko Prasetyo', role: 'teknisi', checkIn: '07:40:00', checkOut: '17:00:00', status: 'hadir', karyawan_id: 'tech-d6' },
      { name: 'Bambang Utomo', role: 'teknisi', checkIn: '-', checkOut: '-', status: 'izin', karyawan_id: 'tech-d7' },
      { name: 'Rizky Ramadhan', role: 'teknisi', checkIn: '-', checkOut: '-', status: 'sakit', karyawan_id: 'tech-d8' },
      { name: 'Adi Wijaya', role: 'teknisi', checkIn: '-', checkOut: '-', status: 'alpha', karyawan_id: 'tech-d9' }
    ]
  },
  'Mei 2026': {
    stats: { total: 9, hadir: 185, izin: 9, alpha: 4, percent: '93.4' },
    details: [
      { name: 'Supriadi', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Ahmad Fauzi', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Dedi Kurniawan', role: 'teknisi', hadir: 20, izin: 2, alpha: 0 },
      { name: 'Hendro Setiawan', role: 'teknisi', hadir: 19, izin: 1, alpha: 2 },
      { name: 'Rian Hidayat', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Eko Prasetyo', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Bambang Utomo', role: 'teknisi', hadir: 18, izin: 4, alpha: 0 },
      { name: 'Rizky Ramadhan', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Adi Wijaya', role: 'teknisi', hadir: 20, izin: 0, alpha: 2 }
    ]
  },
  'April 2026': {
    stats: { total: 9, hadir: 189, izin: 7, alpha: 2, percent: '95.4' },
    details: [
      { name: 'Supriadi', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Ahmad Fauzi', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Dedi Kurniawan', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Hendro Setiawan', role: 'teknisi', hadir: 20, izin: 2, alpha: 0 },
      { name: 'Rian Hidayat', role: 'teknisi', hadir: 21, izin: 0, alpha: 1 },
      { name: 'Eko Prasetyo', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Bambang Utomo', role: 'teknisi', hadir: 19, izin: 3, alpha: 0 },
      { name: 'Rizky Ramadhan', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Adi Wijaya', role: 'teknisi', hadir: 21, izin: 1, alpha: 1 }
    ]
  },
  'Maret 2026': {
    stats: { total: 9, hadir: 178, izin: 14, alpha: 6, percent: '89.8' },
    details: [
      { name: 'Supriadi', role: 'teknisi', hadir: 19, izin: 3, alpha: 0 },
      { name: 'Ahmad Fauzi', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Dedi Kurniawan', role: 'teknisi', hadir: 18, izin: 2, alpha: 2 },
      { name: 'Hendro Setiawan', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Rian Hidayat', role: 'teknisi', hadir: 20, izin: 1, alpha: 1 },
      { name: 'Eko Prasetyo', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Bambang Utomo', role: 'teknisi', hadir: 17, izin: 5, alpha: 0 },
      { name: 'Rizky Ramadhan', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Adi Wijaya', role: 'teknisi', hadir: 18, izin: 1, alpha: 3 }
    ]
  },
  'Februari 2026': {
    stats: { total: 9, hadir: 172, izin: 5, alpha: 3, percent: '95.5' },
    details: [
      { name: 'Supriadi', role: 'teknisi', hadir: 20, izin: 0, alpha: 0 },
      { name: 'Ahmad Fauzi', role: 'teknisi', hadir: 20, izin: 0, alpha: 0 },
      { name: 'Dedi Kurniawan', role: 'teknisi', hadir: 19, izin: 1, alpha: 0 },
      { name: 'Hendro Setiawan', role: 'teknisi', hadir: 18, izin: 1, alpha: 1 },
      { name: 'Rian Hidayat', role: 'teknisi', hadir: 20, izin: 0, alpha: 0 },
      { name: 'Eko Prasetyo', role: 'teknisi', hadir: 20, izin: 0, alpha: 0 },
      { name: 'Bambang Utomo', role: 'teknisi', hadir: 17, izin: 3, alpha: 0 },
      { name: 'Rizky Ramadhan', role: 'teknisi', hadir: 20, izin: 0, alpha: 0 },
      { name: 'Adi Wijaya', role: 'teknisi', hadir: 18, izin: 0, alpha: 2 }
    ]
  },
  'Januari 2026': {
    stats: { total: 9, hadir: 182, izin: 11, alpha: 5, percent: '91.9' },
    details: [
      { name: 'Supriadi', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Ahmad Fauzi', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Dedi Kurniawan', role: 'teknisi', hadir: 19, izin: 2, alpha: 1 },
      { name: 'Hendro Setiawan', role: 'teknisi', hadir: 20, izin: 1, alpha: 1 },
      { name: 'Rian Hidayat', role: 'teknisi', hadir: 22, izin: 0, alpha: 0 },
      { name: 'Eko Prasetyo', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Bambang Utomo', role: 'teknisi', hadir: 18, izin: 4, alpha: 0 },
      { name: 'Rizky Ramadhan', role: 'teknisi', hadir: 21, izin: 1, alpha: 0 },
      { name: 'Adi Wijaya', role: 'teknisi', hadir: 18, izin: 1, alpha: 3 }
    ]
  }
};

export default function AbsensiTeknisi() {
  // 1. State Utama Absensi (Sinkronisasi Database)
  const [attendance, setAttendance] = useState([]);
  const [masterTeknisi, setMasterTeknisi] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. State UI & Filter Bulanan Berjalan 6 Bulan Terakhir
  const [activeMonth, setActiveMonth] = useState('Juni 2026');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedTechIndex, setSelectedTechIndex] = useState(null);

  // 3. Form States
  const [selectedTech, setSelectedTech] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false); 
  const [formCheckIn, setFormCheckIn] = useState('08:00:00');
  const [formCheckOut, setFormCheckOut] = useState('17:00:00');
  const [formStatus, setFormStatus] = useState('hadir'); 

  const searchDropdownRef = useRef(null);

  // Fetch data riil dari Supabase (Dengan proteksi anti-admin masuk)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Ambil data user yang HANYA ber-role teknisi (Blokir admin_pemeliharaan)
        const { data: techData, error: techError } = await supabase
          .from('users')
          .select('id, nama, role')
          .eq('role', 'teknisi');

        if (techError) throw techError;
        let initialMaster = techData || [];

        const todayStr = new Date().toISOString().split('T')[0];
        
        // 2. Ambil data absensi hari ini
        const { data: attData, error: attError } = await supabase
          .from('absensi')
          .select('*, karyawan:users(nama, role)')
          .eq('tanggal', todayStr);

        if (attError) throw attError;

        let uniqueRecords = [];
        if (attData) {
          const seenKaryawanIds = new Set();
          const sortedAttData = [...attData].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });

          sortedAttData.forEach(row => {
            // Lapis Satpam 1: Abaikan jika terdeteksi data milik admin_pemeliharaan
            if (row.karyawan?.role === 'admin_pemeliharaan') {
              return; 
            }

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

        // 3. Gabungkan dengan data dasar dummy Juni 2026 (9 orang murni teknisi)
        const baseJuneDummy = MOCK_MONTHLY_DATA['Juni 2026'].details;

        const dynamicJune = [...uniqueRecords];
        baseJuneDummy.forEach(dummy => {
          const IsAlreadyExist = uniqueRecords.some(r => r.name.toLowerCase() === dummy.name.toLowerCase());
          if (!IsAlreadyExist) {
            dynamicJune.push(dummy);
          }
        });

        // Lapis Satpam 2: Filter akhir untuk memastikan tidak ada admin lolos ke state tabel
        const finalCleanJune = dynamicJune.filter(item => item.role !== 'admin_pemeliharaan');

        setAttendance(finalCleanJune);

        const dummyMaster = baseJuneDummy.map(d => ({ id: d.karyawan_id, nama: d.name, role: d.role }));
        setMasterTeknisi([...initialMaster, ...dummyMaster]);

      } catch (err) {
        console.error('Error loading data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Menutup dropdown klik luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset otomatis formulir jam masuk/keluar jika status diganti
  useEffect(() => {
    if (formStatus !== 'hadir') {
      setFormCheckIn('-');
      setFormCheckOut('-');
    } else {
      if (formCheckIn === '-') setFormCheckIn('08:00:00');
      if (formCheckOut === '-') setFormCheckOut('17:00:00');
    }
  }, [formStatus]);

  // Fungsi Export Excel Dinamis Mengikuti Bulan yang Dipilih
  const handleExport = () => {
    try {
      const fileName = `Absensi_Teknisi_${activeMonth.replace(' ', '_')}.xls`;
      const isCurrentMonth = activeMonth === 'Juni 2026';
      
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
            .txt-format { mso-number-format:"\\@"; text-align: center; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="5" class="title">LAPORAN ABSENSI TEKNISI - SiManTap</td></tr>
            <tr><td colspan="5" class="subtitle">Periode Laporan: ${activeMonth}</td></tr>
            <tr><td colspan="5" style="height: 10px;"></td></tr>
            <thead>
              <tr>
                <th style="width: 180px;">NAMA TEKNISI</th>
                <th style="width: 120px;">ROLE</th>
                ${isCurrentMonth ? `
                  <th style="width: 100px; text-align: center;">JAM MASUK</th>
                  <th style="width: 100px; text-align: center;">JAM KELUAR</th>
                  <th style="width: 120px; text-align: center;">STATUS</th>
                ` : `
                  <th style="width: 100px; text-align: center;">TOTAL HADIR</th>
                  <th style="width: 120px; text-align: center;">TOTAL IZIN/SAKIT</th>
                  <th style="width: 100px; text-align: center;">TOTAL ALPHA</th>
                `}
              </tr>
            </thead>
            <tbody>
      `;

      const activeList = isCurrentMonth ? attendance : MOCK_MONTHLY_DATA[activeMonth].details;

      activeList.forEach((row) => {
        excelTemplate += `
          <tr>
            <td class="text-bold">${row.name}</td>
            <td>${row.role || 'teknisi'}</td>
            ${isCurrentMonth ? `
              <td class="txt-format">${row.checkIn}</td>
              <td class="txt-format">${row.checkOut}</td>
              <td style="text-align: center;">${formatStatusUI(row.status)}</td>
            ` : `
              <td class="txt-format">${row.hadir} Hari</td>
              <td class="txt-format">${row.izin} Hari</td>
              <td class="txt-format" style="color: red;">${row.alpha} Alpha</td>
            `}
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
      showToast(`Laporan ${activeMonth} Berhasil Diunduh!`);
    } catch (error) {
      console.error(error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTech) {
      alert('Silakan pilih nama teknisi terlebih dahulu!');
      return;
    }

    const jamMasuk = formStatus === 'hadir' ? formCheckIn : null;
    const jamKeluar = formStatus === 'hadir' ? formCheckOut : null;
    const isDummy = selectedTech.id?.startsWith('tech-d') || !selectedTech.id;

    try {
      if (modalMode === 'create') {
        if (!isDummy) {
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
          if (data && data.karyawan?.role !== 'admin_pemeliharaan') {
            setAttendance(prev => [{
              id: data.id,
              name: data.karyawan?.nama || selectedTech.nama,
              role: data.karyawan?.role || selectedTech.role,
              checkIn: data.jam_masuk || '-',
              checkOut: data.jam_keluar || '-',
              status: data.status,
              karyawan_id: data.karyawan_id
            }, ...prev]);
          }
          showToast('Absensi berhasil dicatat ke Supabase');
        } else {
          setAttendance(prev => [{
            id: 'att-local-' + Math.random(),
            name: selectedTech.nama,
            role: selectedTech.role,
            checkIn: jamMasuk || '-',
            checkOut: jamKeluar || '-',
            status: formStatus,
            karyawan_id: selectedTech.id
          }, ...prev]);
          showToast('Absensi simulasi berhasil ditambahkan');
        }
      } else {
        const targetRecord = attendance[selectedTechIndex];
        const isRecordDummy = targetRecord.karyawan_id?.startsWith('tech-d') || targetRecord.id?.startsWith('att-local');

        if (!isRecordDummy) {
          const { data, error } = await supabase
            .from('absensi')
            .update({ jam_masuk: jamMasuk, jam_keluar: jamKeluar, status: formStatus })
            .eq('id', targetRecord.id)
            .select('*, karyawan:users(nama, role)')
            .single();

          if (error) throw error;
          if (data) {
            setAttendance(prev => prev.map((item, idx) => idx === selectedTechIndex ? { ...item, checkIn: data.jam_masuk || '-', checkOut: data.jam_keluar || '-', status: data.status } : item));
          }
          showToast('Data Supabase berhasil diperbarui');
        } else {
          setAttendance(prev => prev.map((item, idx) => idx === selectedTechIndex ? { ...item, checkIn: jamMasuk || '-', checkOut: jamKeluar || '-', status: formStatus } : item));
          showToast('Data simulasi berhasil diperbarui');
        }
      }
    } catch (err) {
      console.error(err.message);
    }
    setModalOpen(false);
  };

  const filteredKaryawan = masterTeknisi.filter(tech => (tech.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) && tech.role !== 'admin_pemeliharaan');

  // =========================================================================
  // DYNAMIC STATS KALKULATOR (Otomatis membaca data dari Bulan Aktif yang dipilih)
  // =========================================================================
  const currentMonthStats = MOCK_MONTHLY_DATA[activeMonth].stats;
  const isCurrentMonth = activeMonth === 'Juni 2026';

  const totalDisplay = isCurrentMonth ? attendance.length : currentMonthStats.total;
  const hadirDisplay = isCurrentMonth ? attendance.filter(a => a.status === 'hadir').length : currentMonthStats.hadir;
  const izinDisplay = isCurrentMonth ? attendance.filter(a => a.status === 'izin' || a.status === 'sakit').length : currentMonthStats.izin;
  const alphaDisplay = isCurrentMonth ? attendance.filter(a => a.status === 'alpha').length : currentMonthStats.alpha;
  const percentDisplay = isCurrentMonth 
    ? (totalDisplay > 0 ? ((hadirDisplay / totalDisplay) * 100).toFixed(1) : '0')
    : currentMonthStats.percent;

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

      {/* Controls Row - Anti Terpotong */}
      <div className="card-section p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 !overflow-visible">
        <div className="relative z-50">
          <button
            onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
            className="btn-ghost btn-sm flex items-center justify-between min-w-[150px] text-left border border-soft rounded-xl px-3 py-2 bg-white shadow-sm font-semibold"
          >
            <span>{activeMonth}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${monthDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {monthDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMonthDropdownOpen(false)}></div>
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-soft rounded-xl shadow-xl z-50 py-1.5 animate-scale-in max-h-60 overflow-y-auto">
                {Object.keys(MOCK_MONTHLY_DATA).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setActiveMonth(m); setMonthDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-app-bg transition ${
                      activeMonth === m ? 'text-ink bg-app-bg font-bold border-l-4 border-ink' : 'text-muted'
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
          {isCurrentMonth && (
            <button onClick={openCreateModal} className="btn-primary btn-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Catat Absensi</span>
            </button>
          )}
          <button onClick={handleExport} className="btn-ghost btn-sm flex items-center gap-1.5 border border-soft bg-white shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Excel ({activeMonth})</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Kapasitas Tim Aktif</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{totalDisplay} Teknisi</h4>
          </div>
        </div>
        <div className="card-yellow flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">
              {isCurrentMonth ? 'Hadir Hari Ini' : 'Akumulasi Hadir'}
            </span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{hadirDisplay} {isCurrentMonth ? 'Orang' : 'Hari'}</h4>
            <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">{percentDisplay}% Rate</span>
          </div>
        </div>
        <div className="card-lavender flex items-center justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">
              {isCurrentMonth ? 'Izin / Sakit' : 'Total Absen Berizin'}
            </span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1 text-amber-700">{izinDisplay} {isCurrentMonth ? 'Orang' : 'Hari'}</h4>
          </div>
        </div>
        <div className="card-section p-5 flex items-center justify-between border border-soft bg-white rounded-2xl shadow-sm">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Tanpa Keterangan</span>
            <h4 className="text-red-600 font-black text-2xl mt-1">{alphaDisplay} {isCurrentMonth ? 'Orang' : 'Hari'}</h4>
          </div>
        </div>
      </div>

      {/* Dynamic Table Section */}
      <div className="card-section flex flex-col shadow-sm bg-white border border-soft rounded-2xl overflow-hidden">
        <div className="card-section-header px-6 py-4 border-b border-soft bg-gray-50/50">
          <h3 className="text-sm font-bold text-ink">
            {isCurrentMonth ? `Log Absensi Lapangan — Hari Ini (${activeMonth})` : `Laporan Ringkasan Performa Bulanan — ${activeMonth}`}
          </h3>
        </div>

        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-soft">
                <th className="px-6 py-3 text-xs font-bold text-ink uppercase tracking-wider">NAMA TEKNISI</th>
                <th className="px-6 py-3 text-xs font-bold text-ink uppercase tracking-wider">ROLE</th>
                {isCurrentMonth ? (
                  <>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">JAM MASUK</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">JAM KELUAR</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase tracking-wider">AKSI</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">TOTAL HADIR</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">TOTAL IZIN / SAKIT</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-ink uppercase tracking-wider">KETELEDORAN (ALPHA)</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase tracking-wider">KETERANGAN</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-soft text-xs font-semibold text-gray-800 bg-white">
              {isCurrentMonth ? (
                // VIEW BULAN SEKARANG: ABSENSI HARIAN LOG
                attendance.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-app-bg transition">
                    <td className="px-6 py-3.5"><span className="font-bold text-ink">{row.name}</span></td>
                    <td className="px-6 py-3.5 text-muted text-[11px] font-mono">{row.role || 'teknisi'}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-ink">{row.checkIn}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-muted">{row.checkOut}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`badge-base ${row.status === 'hadir' ? 'badge-mint' : row.status === 'alpha' ? 'badge-red' : 'badge-yellow'}`}>
                        {formatStatusUI(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button onClick={() => openEditModal(idx)} className="text-ink hover:underline font-bold">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                // VIEW 5 BULAN SEBELUMNYA: REKAP BULANAN TIM
                MOCK_MONTHLY_DATA[activeMonth].details.map((row, idx) => (
                  <tr key={'hist-' + idx} className="hover:bg-app-bg transition">
                    <td className="px-6 py-3.5"><span className="font-bold text-ink">{row.name}</span></td>
                    <td className="px-6 py-3.5 text-muted text-[11px] font-mono">{row.role || 'teknisi'}</td>
                    <td className="px-6 py-3.5 text-center font-mono text-emerald-600 font-bold">{row.hadir} Hari</td>
                    <td className="px-6 py-3.5 text-center font-mono text-amber-600">{row.izin} Hari</td>
                    <td className="px-6 py-3.5 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${row.alpha > 0 ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}>
                        {row.alpha} Hari
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-muted text-[11px] italic font-normal">Arsip Terkunci</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDANCE MODAL (Hanya Terbuka di Bulan Berjalan) */}
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
                      <div className="absolute left-0 right-0 mt-1 max-h-56 bg-white border border-soft rounded-xl shadow-xl overflow-y-auto z-50 py-1">
                        {filteredKaryawan.map((tech) => (
                          <button
                            key={tech.id || tech.nama}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs flex flex-col border-b border-soft last:border-0"
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
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="select-modern input-modern font-semibold">
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

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary py-2.5 text-xs font-bold">✓ Simpan</button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost py-2.5 text-xs font-bold border border-soft">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}