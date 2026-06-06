import React, { useState } from 'react';
import {
  Car,
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

// Fungsi Hitung Biaya Parkir (Tetap dipertahankan)
const calculateParkingFee = (masukStr, keluarStr, isPenghuni) => {
  if (isPenghuni) return '-';
  if (!masukStr || !keluarStr || keluarStr === '-') return '-';

  const parseTime = (timeStr) => {
    const today = new Date();
    const cleanTime = timeStr.replace('.', ':');
    const [hours, minutes] = cleanTime.split(':').map(Number);
    
    today.setHours(hours || 0, minutes || 0, 0, 0);
    return today;
  };

  const masukTime = parseTime(masukStr);
  const keluarTime = parseTime(keluarStr);

  const durationMs = keluarTime - masukTime;
  let durationHours = durationMs / (1000 * 60 * 60);

  if (durationHours < 0) {
    durationHours += 24;
  }

  const RATE_PER_HOUR = 5000;
  const totalHours = Math.max(1, Math.ceil(durationHours));
  const calculatedFee = totalHours * RATE_PER_HOUR;

  return `Rp ${calculatedFee.toLocaleString('id-ID')}`;
};

export default function LogParkir() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [successToast, setSuccessToast] = useState('');

  const stats = [
    {
      title: 'Slot Terisi',
      value: '312/380',
      subtitle: '82.1% kapasitas',
      icon: Car,
      colorClass: 'bg-[#FDF2F0]', // Mengembalikan warna soft background ikon
      textClass: 'text-[#B85040]'
    },
    {
      title: 'Pendapatan Parkir',
      value: 'Rp 34 Jt',
      subtitle: 'Bulan April',
      icon: DollarSign,
      colorClass: 'bg-[#FEF9F3]', 
      textClass: 'text-[#A05820]'
    },
    {
      title: 'Kendaraan Non-Penghuni',
      value: '48',
      subtitle: 'Tamu / harian',
      icon: TrendingUp,
      colorClass: 'bg-[#F5F3FF]', 
      textClass: 'text-[#4840B0]'
    }
  ];

  const [parkirList, setParkirList] = useState([
    {
      id: 1,
      plat: 'L 1234 AB',
      jenis: 'Mobil',
      penghuni: 'Hendra G. - 12A',
      isPenghuni: true,
      masuk: '08:30',
      keluar: '-',
      biaya: '-'
    },
    {
      id: 2,
      plat: 'M 5678 CD',
      jenis: 'Motor',
      penghuni: 'Maya S. - 05B',
      isPenghuni: true,
      masuk: '08:15',
      keluar: '-',
      biaya: '-'
    },
    {
      id: 3,
      plat: 'AB 9999 ZZ',
      jenis: 'Mobil',
      penghuni: 'Tamu',
      isPenghuni: false,
      masuk: '07:00',
      keluar: '09:00',
      biaya: 'Rp 10.000'
    },
    {
      id: 4,
      plat: 'B 456 XY',
      jenis: 'Mobil',
      penghuni: 'Tamu',
      isPenghuni: false,
      masuk: '10:00',
      keluar: '-',
      biaya: '-'
    },
    {
      id: 5,
      plat: 'N 789 MZ',
      jenis: 'Motor',
      penghuni: 'Tamu',
      isPenghuni: false,
      masuk: '09:30',
      keluar: '-',
      biaya: '-'
    }
  ]);

  const handleCheckoutParkir = (id) => {
    const today = new Date();
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setParkirList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              keluar: timeStr,
              biaya: calculateParkingFee(item.masuk, timeStr, item.isPenghuni)
            }
          : item
      )
    );

    setSuccessToast('Kendaraan berhasil di-check out dari area parkir.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const filteredParkir = parkirList.filter(item => {
    const matchesSearch = item.plat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.penghuni.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Semua' || item.jenis === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Stats Row - PERBAIKAN STRUKTUR IKON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl flex flex-col justify-between min-h-[135px] transition hover:translate-y-[-2px] duration-150 shadow-sm border border-gray-100/50"
            >
              <div className="flex justify-between items-start">
                <div>
                  {/* Container Bundar untuk Ikon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${stat.colorClass}`}>
                    <IconComponent size={18} className={`${stat.textClass} stroke-[2.5]`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-extrabold ${stat.textClass} mt-1`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 font-medium tracking-wide mt-2">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter Row - PERBAIKAN BUG TUMPANG TINDIH & TOMBOL HILANG */}
      <div className="bg-white p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm border border-gray-100/50">
        {/* Kolom Cari Plat Nomor */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari plat nomor / nama..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
          />
        </div>

        {/* Kolom Tombol Filter (Aman dari Tumpang Tindih) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['Semua', 'Mobil', 'Motor'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-[#1E1E1E] text-white shadow-md shadow-black/10'
                  : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 overflow-hidden">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-5">
          Log Parkir Real-time
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Plat</th>
                <th className="pb-3">Jenis</th>
                <th className="pb-3">Penghuni</th>
                <th className="pb-3">Masuk</th>
                <th className="pb-3">Keluar</th>
                <th className="pb-3">Biaya</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredParkir.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 font-bold text-gray-800">{item.plat}</td>
                  <td className="py-3.5 text-gray-500">{item.jenis}</td>
                  <td className="py-3.5">
                    {item.isPenghuni ? (
                      <span className="text-gray-800 font-semibold">{item.penghuni}</span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                        Tamu
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-semibold text-gray-800">{item.masuk}</td>
                  <td className="py-3.5 text-gray-400">{item.keluar}</td>
                  <td className="py-3.5">
                    {item.biaya === '-' ? (
                      <span className="text-gray-300 font-bold">-</span>
                    ) : (
                      <span className="text-gray-900 font-extrabold">{item.biaya}</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    {item.keluar === '-' ? (
                      <button
                        onClick={() => handleCheckoutParkir(item.id)}
                        className="text-[#E06E5D] hover:text-[#c45647] hover:underline font-bold text-xs bg-red-50/50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Check-Out
                      </button>
                    ) : (
                      <span className="text-gray-300 font-semibold text-xs pr-4">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in z-50">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="stroke-[3]" />
          </div>
          <p className="text-xs font-bold">{successToast}</p>
        </div>
      )}
    </div>
  );
}