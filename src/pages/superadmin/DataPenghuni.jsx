import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, Mail, Calendar, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataPenghuni() {
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const loadData = async () => {
    try {
      const { data: resData } = await supabase
        .from('penghuni')
        .select(`
          *,
          user:users(id, nama, email, no_hp, is_active),
          unit(nomor_unit, lantai, tower(nama_tower))
        `)
        .order('create_at', { ascending: false });

      if (resData) {
        setResidents(resData.map(r => {
          const userObj = r.user;
          const unitObj = r.unit;
          return {
            id: r.id,
            name: userObj?.nama || '—',
            unit: unitObj?.nomor_unit || '—',
            tower: unitObj?.tower?.nama_tower || '—',
            phone: r.no_telepon || userObj?.no_hp || '—',
            email: r.email || userObj?.email || '—',
            noKtp: r.no_ktp || '—',
            dateIn: r.tgl_masuk ? new Date(r.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
          };
        }));
      }
    } catch (err) {
      console.error('Error loading resident data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetail = (res) => {
    setSelectedResident(res);
    setDetailOpen(true);
  };

  const filteredResidents = residents.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.name.toLowerCase().includes(query) ||
      res.unit.toLowerCase().includes(query) ||
      res.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari nama, unit, telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 input-modern font-semibold w-full text-xs"
            style={{ paddingLeft: '40px' }} 
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section !p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-soft">
              <tr>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest">Nama Lengkap</th>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest">No. Unit</th>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest">Tower</th>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest">No. Telepon</th>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest">Terdaftar</th>
                <th className="p-4 text-[10px] font-black text-muted uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res) => (
                  <tr key={res.id} className="hover:bg-[#FDFDFD] transition-colors group">
                    <td className="p-4 text-xs font-black text-ink">{res.name}</td>
                    <td className="p-4 text-xs font-bold text-ink">{res.unit}</td>
                    <td className="p-4 text-xs text-muted font-medium">{res.tower}</td>
                    <td className="p-4 text-xs font-mono text-muted">{res.phone}</td>
                    <td className="p-4 text-xs text-muted font-medium">{res.dateIn}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openDetail(res)}
                        className="text-[10px] font-black uppercase text-ink hover:underline tracking-tighter"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted font-bold italic text-xs">
                    Data penghuni tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Penghuni */}
      {detailOpen && selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="relative h-24 bg-[#EAE6E1]">
              <button onClick={() => setDetailOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-all"><X size={16}/></button>
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                <User size={32} className="text-[#C8C2BC]" />
              </div>
            </div>
            <div className="pt-14 p-8 space-y-6">
              <div>
                <h4 className="text-lg font-black text-ink tracking-tight">{selectedResident.name}</h4>
                <p className="text-xs font-bold text-muted flex items-center gap-1.5 mt-1">
                  <Home size={12}/> {selectedResident.tower} — Unit {selectedResident.unit}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted"><Phone size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">WhatsApp / Call</p><p className="text-xs font-bold text-ink">{selectedResident.phone}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted"><Mail size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Alamat Email</p><p className="text-xs font-bold text-ink">{selectedResident.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted"><User size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Nomor KTP</p><p className="text-xs font-bold text-ink">{selectedResident.noKtp}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted"><Calendar size={16}/></div>
                  <div><p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Mulai Menetap</p><p className="text-xs font-bold text-ink">{selectedResident.dateIn}</p></div>
                </div>
              </div>
              <button onClick={() => setDetailOpen(false)} className="w-full btn-primary py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest">Tutup Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}