import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, Mail, Calendar, Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataPenghuni() {
  const [residents, setResidents] = useState([]);
  const [units, setUnits] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const [newResident, setNewResident] = useState({
    name: '',
    email: '',
    phone: '',
    unitId: '',
    noKtp: '',
    tglMasuk: new Date().toISOString().split('T')[0]
  });

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

      const { data: unitData } = await supabase
        .from('unit')
        .select('id, nomor_unit, tower(nama_tower)');
      if (unitData) {
        setUnits(unitData);
        if (unitData.length > 0 && !newResident.unitId) {
          setNewResident(prev => ({ ...prev, unitId: unitData[0].id }));
        }
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

  const handleCreateResident = async (e) => {
    e.preventDefault();
    if (!newResident.name || !newResident.email || !newResident.unitId) return;

    try {
      const defaultPassword = btoa(newResident.email);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newResident.email,
        password: defaultPassword,
        email_confirm: true
      });

      if (authError) throw authError;

      const authUser = authData.user;

      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          nama: newResident.name,
          email: newResident.email,
          no_hp: newResident.phone,
          role: 'penghuni',
          must_change_password: true
        });

      if (userError) throw userError;

      const { error: penghuniError } = await supabase
        .from('penghuni')
        .insert({
          user_id: authUser.id,
          unit_id: newResident.unitId,
          no_ktp:  newResident.noKtp,
          email:   newResident.email,
          no_telepon: newResident.phone,
          tgl_masuk:  newResident.tglMasuk,
          status:  'aktif'
        });

      if (penghuniError) throw penghuniError;

      const { error: unitError } = await supabase
        .from('unit')
        .update({
          penghuni_id: authUser.id,
          status: 'dihuni'
        })
        .eq('id', newResident.unitId);

      if (unitError) throw unitError;

      setModalOpen(false);
      setNewResident({
        name: '',
        email: '',
        phone: '',
        unitId: units[0]?.id || '',
        noKtp: '',
        tglMasuk: new Date().toISOString().split('T')[0]
      });
      setSuccessToast(`Akun ${newResident.name} berhasil didaftarkan!`);
      setTimeout(() => setSuccessToast(''), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to register resident:', err.message);
      alert(`Error: ${err.message}`);
    }
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
        
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
          <span>Tambah Penghuni</span>
        </button>
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

      {/* REGISTRATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF6F0] border border-[#EAE6E1] rounded-3xl max-w-md w-full shadow-2xl p-6 relative animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-soft pb-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Penghuni Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateResident} className="space-y-4 text-xs">
              <div>
                <label className="label-modern">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap penghuni"
                  value={newResident.name}
                  onChange={(e) => setNewResident(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="label-modern">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={newResident.email}
                  onChange={(e) => setNewResident(prev => ({ ...prev, email: e.target.value }))}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="label-modern">No. Telepon</label>
                <input
                  type="text"
                  placeholder="0812-3456-7890"
                  value={newResident.phone}
                  onChange={(e) => setNewResident(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-modern w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Nomor KTP</label>
                  <input
                    type="text"
                    required
                    placeholder="3171..."
                    value={newResident.noKtp}
                    onChange={(e) => setNewResident(prev => ({ ...prev, noKtp: e.target.value }))}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="label-modern">Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    value={newResident.tglMasuk}
                    onChange={(e) => setNewResident(prev => ({ ...prev, tglMasuk: e.target.value }))}
                    className="input-modern w-full"
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Pilih Unit Tujuan</label>
                <select
                  value={newResident.unitId}
                  onChange={(e) => setNewResident(prev => ({ ...prev, unitId: e.target.value }))}
                  className="select-modern input-modern w-full font-semibold"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.tower?.nama_tower || 'Tower'} — Unit {u.nomor_unit}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold">Daftarkan Penghuni</button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold border border-gray-200">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}