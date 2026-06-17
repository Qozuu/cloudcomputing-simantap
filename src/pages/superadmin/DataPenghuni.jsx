import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, Mail, Calendar, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataPenghuni() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Baru untuk Filter Tower
  const [selectedTower, setSelectedTower] = useState('');
  const [towers, setTowers] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: resData, error } = await supabase
        .from('penghuni')
        .select(`
          id,
          no_ktp,
          email,
          no_telepon,
          tgl_masuk,
          kendaraan,
          status,
          user_id,
          unit_id,
          users (
            nama,
            email,
            no_hp
          ),
          unit (
            nomor_unit,
            tower (
              nama_tower
            )
          )
        `);

      if (error) throw error;

      if (resData) {
        const mappedData = resData.map(r => {
          const userObj = Array.isArray(r.users) ? r.users[0] : r.users;
          const unitObj = Array.isArray(r.unit) ? r.unit[0] : r.unit;

          return {
            id: r.id,
            name: userObj?.nama || r.email || 'Penghuni Tanpa Nama',
            unit: unitObj?.nomor_unit || '—',
            tower: unitObj?.tower?.nama_tower || '—',
            phone: r.no_telepon || userObj?.no_hp || '—',
            email: r.email || userObj?.email || '—',
            noKtp: r.no_ktp || '—',
            dateIn: r.tgl_masuk ? new Date(r.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            vehicle: r.kendaraan || 'Tidak ada kendaraan',
            statusPenghuni: r.status || 'Aktif'
          };
        });

        setResidents(mappedData);

        // Ekstrak nama-nama tower yang unik dari database untuk isi dropdown secara dinamis
        const uniqueTowers = [...new Set(mappedData.map(item => item.tower).filter(t => t !== '—'))];
        setTowers(uniqueTowers);
      }
    } catch (err) {
      console.error('Error loading resident data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetail = (res) => {
    setSelectedResident(res);
    setDetailOpen(true);
  };

  // Logika Penyaringan Gabungan: Teks Pencarian + Pilihan Dropdown Tower
  const filteredResidents = residents.filter(res => {
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      res.name.toLowerCase().includes(query) ||
      res.unit.toLowerCase().includes(query) ||
      res.phone.toLowerCase().includes(query);
      
    const matchesTower = selectedTower === '' || res.tower === selectedTower;

    return matchesSearch && matchesTower;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls row */}
      <div className="card-section p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Input Cari */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari nama, unit, telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F7F5] border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EAE6E1] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        </div>

        {/* Dropdown Filter Tower */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Filter Tower:</span>
          <select
            value={selectedTower}
            onChange={(e) => setSelectedTower(e.target.value)}
            className="bg-[#F8F7F5] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EAE6E1]"
          >
            <option value="">Semua Tower</option>
            {towers.map((towerName, idx) => (
              <option key={idx} value={towerName}>{towerName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section !p-0 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Nama Lengkap</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">No. Unit</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Tower</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">No. Telepon</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Terdaftar</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-xs font-bold text-gray-400 animate-pulse">
                    Menghubungkan ke database public.penghuni...
                  </td>
                </tr>
              ) : filteredResidents.length > 0 ? (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-xs font-black text-gray-900">{res.name}</td>
                    <td className="p-4 text-xs font-bold text-gray-900">{res.unit}</td>
                    <td className="p-4 text-xs text-gray-500 font-medium">
                      <span className="px-2 py-0.5 bg-[#F8F7F5] rounded text-[10px] font-bold text-gray-600 border border-gray-100">
                        {res.tower}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">{res.phone}</td>
                    <td className="p-4 text-xs text-gray-500 font-medium">{res.dateIn}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openDetail(res)}
                        className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-900 transition-colors tracking-tighter"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic text-xs">
                    Data penghuni tidak ditemukan di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Penghuni */}
      {detailOpen && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="relative h-24 bg-[#EAE6E1]">
              <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all"><X size={16}/></button>
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                <User size={32} className="text-[#C8C2BC]" />
              </div>
            </div>
            <div className="pt-14 p-8 space-y-6">
              <div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight">{selectedResident.name}</h4>
                <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-1">
                  <Home size={12}/> {selectedResident.tower} — Unit {selectedResident.unit}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-gray-500"><Phone size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">WhatsApp / Call</p><p className="text-xs font-bold text-gray-900">{selectedResident.phone}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-gray-500"><Mail size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Alamat Email</p><p className="text-xs font-bold text-gray-900">{selectedResident.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-gray-500"><User size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Nomor KTP</p><p className="text-xs font-bold text-gray-900">{selectedResident.noKtp}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-gray-500"><Calendar size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Mulai Menetap</p><p className="text-xs font-bold text-gray-900">{selectedResident.dateIn}</p></div>
                </div>
              </div>
              <button onClick={() => setDetailOpen(false)} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}