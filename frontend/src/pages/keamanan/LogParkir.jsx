import React, { useState } from 'react';
import {
  Car,
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

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
      colorClass: 'stat-pink',
      textClass: 'text-[#B85040]'
    },
    {
      title: 'Pendapatan Parkir',
      value: 'Rp 34 Jt',
      subtitle: 'Bulan April',
      icon: DollarSign,
      colorClass: 'stat-yellow',
      textClass: 'text-[#A05820]'
    },
    {
      title: 'Kendaraan Non-Penghuni',
      value: '48',
      subtitle: 'Tamu / harian',
      icon: TrendingUp,
      colorClass: 'stat-lavender',
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
              biaya: item.isPenghuni ? '-' : 'Rp 10.000'
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
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={idx}
              className="stat-card flex flex-col justify-between min-h-[135px] transition hover:translate-y-[-2px] duration-150 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`stat-icon-wrap ${stat.colorClass}`}>
                    <IconComponent size={18} className="stroke-[2.5]" />
                  </div>
                  <p className="stat-label">
                    {stat.title}
                  </p>
                  <p className={`stat-value ${stat.textClass} mt-1`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-muted font-semibold tracking-wide mt-2">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari plat nomor / nama..."
            className="w-full pl-10 pr-4 py-2 input-modern font-semibold"
          />
        </div>

        {/* Filter types */}
        <div className="flex gap-2">
          {['Semua', 'Mobil', 'Motor'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                filterType === type
                  ? 'bg-[#1E1E1E] text-white shadow-sm'
                  : 'bg-[#FAF6F0] text-muted border border-soft hover:bg-[#F0EDE8]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table section */}
      <div className="card-section p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5">
          Log Parkir Real-time
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Plat</th>
                <th>Jenis</th>
                <th>Penghuni</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Biaya</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredParkir.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-ink">{item.plat}</td>
                  <td>{item.jenis}</td>
                  <td>
                    {item.isPenghuni ? (
                      <span className="text-ink font-bold">{item.penghuni}</span>
                    ) : (
                      <span className="badge-base badge-yellow">
                        Tamu
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-ink">{item.masuk}</td>
                  <td className="text-muted">{item.keluar}</td>
                  <td>
                    {item.biaya === '-' ? (
                      <span className="text-muted font-bold">-</span>
                    ) : (
                      <span className="text-ink font-extrabold">{item.biaya}</span>
                    )}
                  </td>
                  <td className="text-right">
                    {item.keluar === '-' ? (
                      <button
                        onClick={() => handleCheckoutParkir(item.id)}
                        className="text-[#E06E5D] hover:underline font-bold text-xs"
                      >
                        Check-Out
                      </button>
                    ) : (
                      <span className="text-muted font-semibold text-xs">-</span>
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
