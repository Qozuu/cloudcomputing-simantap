import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// DATA TIM & JADWAL SHIFT REAL SESUAI DATA KAMU
const TIM_DATA = [
  { id: 'usr-01', nama: 'Supri', tim: 'Tim A', area: 'Lobby Utama & Kaca Fasad', shift: '06:00 - 11:00', status: 'Hadir' },
  { id: 'usr-02', nama: 'Slamet', tim: 'Tim A', area: 'Lobby Utama & Kaca Fasad', shift: '06:00 - 11:00', status: 'Hadir' },
  { id: 'usr-03', nama: 'Agus', tim: 'Tim A', area: 'Area Kolam Renang & Shower', shift: '06:00 - 11:00', status: 'Hadir' },
  { id: 'usr-04', nama: 'Dani', tim: 'Tim A', area: 'Area Kolam Renang & Shower', shift: '06:00 - 11:00', status: 'Hadir' },
  { id: 'usr-05', nama: 'Siti', tim: 'Tim B', area: 'Toilet Umum Lantai 1 & Mushola', shift: '12:00 - 17:00', status: 'Hadir' },
  { id: 'usr-06', nama: 'Roni', tim: 'Tim B', area: 'Toilet Umum Lantai 1 & Mushola', shift: '12:00 - 17:00', status: 'Hadir' },
  { id: 'usr-07', nama: 'Dewi', tim: 'Tim B', area: 'Grand Ballroom (Sterilisasi Lantai)', shift: '12:00 - 17:00', status: 'Hadir' },
  { id: 'usr-08', nama: 'Lestari', tim: 'Tim B', area: 'Grand Ballroom (Sterilisasi Lantai)', shift: '12:00 - 17:00', status: 'Hadir' },
  { id: 'usr-09', nama: 'Joko', tim: 'Tim C', area: 'Gym Center & Ruang Loker', shift: '18:00 - 22:00', status: 'Standby' },
  { id: 'usr-10', nama: 'Budi', tim: 'Tim C', area: 'Gym Center & Ruang Loker', shift: '18:00 - 22:00', status: 'Standby' },
  { id: 'usr-11', nama: 'Aris', tim: 'Tim C', area: 'Lift Penumpang & Tangga Darurat', shift: 'Besok (19 Jun)', status: 'Off Duty' },
  { id: 'usr-12', nama: 'Hendro', tim: 'Tim C', area: 'Gym Center & Sanitasi Alat', shift: 'Besok (19 Jun)', status: 'Off Duty' },
  { id: 'usr-13', nama: 'Gilang', tim: 'Tim C', area: 'Area Parkir Basement P1-P2', shift: 'Besok (19 Jun)', status: 'Off Duty' },
  { id: 'usr-14', nama: 'Tono', tim: 'Tim C', area: 'Area Kolam Renang & Kursi Santai', shift: 'Minggu (21 Jun)', status: 'Off Duty' }
];

export default function AbsensiPetugas() {
  const [officers, setOfficers] = useState(TIM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTim, setFilterTim] = useState('Semua');
  const [successToast, setSuccessToast] = useState('');

  // Otomatis split Jam Masuk dan Keluar dari String Shift
  const getJamMasukKeluar = (shiftStr, status) => {
    if (status === 'Off Duty') return { masuk: '—', keluar: '—' };
    const parts = shiftStr.split('-');
    if (parts.length === 2) {
      return { masuk: parts[0].trim(), keluar: parts[1].trim() };
    }
    return { masuk: '—', keluar: '—' };
  };

  // Logika Filter Pencarian & Dropdown Tim
  const filteredOfficers = officers.filter(o => {
    const matchSearch = o.nama.toLowerCase().includes(searchTerm.toLowerCase()) || o.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTim = filterTim === 'Semua' || o.tim === filterTim;
    return matchSearch && matchTim;
  });

  // Export Laporan Instan (.XLS Excel)
  const handleExport = () => {
    try {
      const fileName = `Laporan_Absensi_Realtime_Juni2026.xls`;
      let excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"></head>
        <body>
          <h2>LAPORAN ABSENSI DIVISI KEBERSIHAN GEDUNG</h2>
          <p>Hari/Tanggal: <b>Kamis, 18 Juni 2026</b></p>
          <table border="1">
            <thead>
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                <th>NAMA PETUGAS</th>
                <th>TIM</th>
                <th>WILAYAH TUGAS OPERASIONAL</th>
                <th>JAM MASUK</th>
                <th>JAM KELUAR</th>
                <th>STATUS MONITORING</th>
              </tr>
            </thead>
            <tbody>
      `;

      filteredOfficers.forEach((off) => {
        const { masuk, keluar } = getJamMasukKeluar(off.shift, off.status);
        excelTemplate += `
          <tr>
            <td><b>${off.nama}</b></td>
            <td>${off.tim}</td>
            <td>${off.area}</td>
            <td style="text-align: center;">${masuk}</td>
            <td style="text-align: center;">${keluar}</td>
            <td style="text-align: center;">${off.status}</td>
          </tr>
        `;
      });

      excelTemplate += `</tbody></table></body></html>`;

      const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessToast("Laporan Excel berhasil diunduh!");
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      alert("Gagal mendownload laporan.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Utama Info Shift Aktif */}
      <div className="card-section p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-wide">Monitoring Absensi Tim Lapangan</h1>
          <p className="text-xs text-gray-500 font-medium">Data kehadiran otomatis terintegrasi jadwal operasional gedung</p>
        </div>
        <div className="text-left md:text-right bg-gray-50 p-3 rounded-lg border border-gray-200/60">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Hari Ini</span>
          <span className="text-xs font-bold text-gray-800">Kamis, 18 Juni 2026</span>
        </div>
      </div>

      {/* Bar Filter */}
      <div className="card-section p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Pencarian */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Cari nama personil / wilayah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Filter Dropdown Tim */}
          <select
            value={filterTim}
            onChange={(e) => setFilterTim(e.target.value)}
            className="border border-gray-200 rounded-lg text-xs font-bold py-2 px-3 bg-white focus:outline-none"
          >
            <option value="Semua">Semua Tim (A, B, C)</option>
            <option value="Tim A">Khusus Tim A</option>
            <option value="Tim B">Khusus Tim B</option>
            <option value="Tim C">Khusus Tim C</option>
          </select>
        </div>

        {/* Tombol Cetak Dokumen Excel */}
        <button onClick={handleExport} className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Excel</span>
        </button>
      </div>

      {/* Tabel Absensi Utama */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Nama Personil</th>
                <th className="p-4">Grup</th>
                <th className="p-4">Wilayah Tugas Hari Ini</th>
                <th className="p-4 text-center">Jam Masuk</th>
                <th className="p-4 text-center">Jam Keluar</th>
                <th className="p-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map((off) => {
                  const { masuk, keluar } = getJamMasukKeluar(off.shift, off.status);
                  
                  return (
                    <tr key={off.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{off.nama}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          off.tim === 'Tim A' ? 'bg-blue-50 text-blue-600' :
                          off.tim === 'Tim B' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {off.tim}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-medium">{off.area}</td>
                      <td className="p-4 text-center font-mono font-bold text-gray-900">{masuk}</td>
                      <td className="p-4 text-center font-mono font-medium text-gray-500">{keluar}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          off.status === 'Hadir' ? 'bg-emerald-50 text-emerald-600' :
                          off.status === 'Standby' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {off.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-xs text-gray-400 font-medium">
                    Tidak ditemukan data personil yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notifikasi Kecil */}
      {successToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold z-50 animate-fade-in">
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
}