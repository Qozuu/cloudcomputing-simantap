import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Fungsi Hitung Biaya Parkir (Tetap dipertahankan)
const calculateParkingFee = (masukStr, keluarStr, isPenghuni) => {
  if (isPenghuni) return 0;
  if (!masukStr || !keluarStr || keluarStr === '-') return 0;

  const parseTime = (timeStr) => {
    const today = new Date();
    // Mendukung pemisah titik maupun titik dua
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
    durationHours += 24; // Mengatasi pergantian hari / lewat tengah malam
  }

  const RATE_PER_HOUR = 5000;
  const totalHours = Math.max(1, Math.ceil(durationHours));
  return totalHours * RATE_PER_HOUR;
};

// Helper format jam lokal (HH:MM) dari ISO String bawaan Supabase
const formatJamLocal = (isoString) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
};

export default function LogParkir() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [successToast, setSuccessToast] = useState('');
  const [parkirList, setParkirList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. FUNGSI AMBIL DATA DARI SUPABASE (REFRESH MANUAL)
  const fetchParkirData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_log')
        .select('*, unit:unit_id(nomor_unit)')
        .order('waktu_keluar', { ascending: true }) // Yang belum keluar (NULL) naik ke atas
        .order('waktu_masuk', { ascending: false });

      if (error) throw error;
      if (data) setParkirList(data);
    } catch (err) {
      console.error('Error fetching parking logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkirData();
  }, []);

  // 2. FUNGSI PROSES CHECK-OUT KENDARAAN
  const handleCheckoutParkir = async (item) => {
    const now = new Date();
    const isoKeluar = now.toISOString();
    
    // Konversi waktu masuk database ke format jam lokal (HH:MM) untuk kalkulator bawaanmu
    const jamMasukLokal = formatJamLocal(item.waktu_masuk);
    const jamKeluarLokal = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

    // Hitung biaya flat/durasi lewat fungsi yang kamu punya
    const totalBiaya = calculateParkingFee(jamMasukLokal, jamKeluarLokal, item.is_penghuni);

    try {
      const { error } = await supabase
        .from('parking_log')
        .update({
          waktu_keluar: isoKeluar,
          biaya: totalBiaya
        })
        .eq('id', item.id);

      if (error) throw error;

      setSuccessToast('Kendaraan berhasil di-check out dari area parkir.');
      fetchParkirData(); // Ambil ulang data segar dari database
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Error checking out:', err.message);
    }
  };

  // 3. KALKULASI RINGKASAN STATISTIK SECARA DINAMIS
  const slotTerisi = parkirList.filter(item => !item.waktu_keluar).length;
  
  const totalPendapatan = parkirList.reduce((sum, item) => sum + Number(item.biaya || 0), 0);
  
  const totalTamuAktif = parkirList.filter(item => !item.waktu_keluar && !item.is_penghuni).length;

  const stats = [
    {
      title: 'Slot Terisi',
      value: `${slotTerisi}/380`,
      subtitle: `${((slotTerisi / 380) * 100).toFixed(1)}% kapasitas`,
      icon: Car,
      colorClass: 'bg-[#FDF2F0]',
      textClass: 'text-[#B85040]'
    },
    {
      title: 'Pendapatan Parkir',
      value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`,
      subtitle: 'Total akumulasi data',
      icon: DollarSign,
      colorClass: 'bg-[#FEF9F3]',
      textClass: 'text-[#A05820]'
    },
    {
      title: 'Kendaraan Non-Penghuni',
      value: totalTamuAktif.toString(),
      subtitle: 'Tamu aktif saat ini',
      icon: TrendingUp,
      colorClass: 'bg-[#F5F3FF]',
      textClass: 'text-[#4840B0]'
    }
  ];

  // 4. FILTERING & SEARCHING DATA
  const filteredParkir = parkirList.filter(item => {
    const nomorUnit = item.unit?.nomor_unit || '';
    const labelPenghuni = item.is_penghuni ? `${nomorUnit} - Penghuni` : 'Tamu';

    const matchesSearch = 
      item.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labelPenghuni.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterType === 'Semua' || item.jenis_kendaraan === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Stats Row */}
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

      {/* Filter & Search Row */}
      <div className="bg-white p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm border border-gray-100/50">
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          {/* Kolom Cari Plat Nomor */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari plat nomor / tipe..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
            />
          </div>

          {/* Tombol Refresh Manual Bawaan */}
          <button
            onClick={fetchParkirData}
            disabled={loading}
            title="Refresh Data"
            className="p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-700 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Kolom Tombol Filter */}
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
          Log Parkir
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Plat</th>
                <th className="pb-3">Jenis</th>
                <th className="pb-3">Tipe</th>
                <th className="pb-3">Masuk</th>
                <th className="pb-3">Keluar</th>
                <th className="pb-3">Biaya</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredParkir.length > 0 ? (
                filteredParkir.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-gray-800">{item.plat_nomor}</td>
                    <td className="py-3.5 text-gray-500">{item.jenis_kendaraan}</td>
                    <td className="py-3.5">
                      {item.is_penghuni ? (
                        <span className="text-gray-800 font-semibold">
                          Unit {item.unit?.nomor_unit || '—'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                          Tamu
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-semibold text-gray-800">{formatJamLocal(item.waktu_masuk)}</td>
                    <td className="py-3.5 text-gray-400">{formatJamLocal(item.waktu_keluar)}</td>
                    <td className="py-3.5">
                      {item.biaya === null || item.biaya === 0 ? (
                        <span className="text-gray-300 font-bold">-</span>
                      ) : (
                        <span className="text-gray-900 font-extrabold">
                          Rp {Number(item.biaya).toLocaleString('id-ID')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {!item.waktu_keluar ? (
                        <button
                          onClick={() => handleCheckoutParkir(item)}
                          className="text-[#E06E5D] hover:text-[#c45647] hover:underline font-bold text-xs bg-red-50/50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Check-Out
                        </button>
                      ) : (
                        <span className="text-gray-300 font-semibold text-xs pr-4">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-xs font-semibold text-gray-400">
                    Tidak ada aktivitas kendaraan terdeteksi.
                  </td>
                </tr>
              )}
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