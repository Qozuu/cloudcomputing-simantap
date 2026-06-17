import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataAdminDivisi() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modal Detail
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      
      // PERBAIKAN: .select() wajib diletakkan di depan sebelum filter .neq()
      const { data, error } = await supabase
        .from('users')
        .select('*') 
        .neq('role', 'penghuni')
        .neq('role', 'super_admin')
        .order('nama');

      if (error) throw error;

      if (data) {
        setAdmins(data.map(u => {
          const role = (u.role || '').toLowerCase();
          let divName = 'Management';
          
          if (role.includes('keuangan')) divName = 'Keuangan';
          else if (role.includes('pemeliharaan')) divName = 'Pemeliharaan';
          else if (role.includes('keamanan')) divName = 'Keamanan';
          else if (role.includes('kebersihan')) divName = 'Kebersihan';
          else if (role.includes('fasilitas')) divName = 'Fasilitas';
          else if (role.includes('sdm')) divName = 'SDM';

          return {
            id: u.id,
            name: u.nama,
            division: divName,
            email: u.email,
            phone: u.no_hp || '—',
            status: u.is_active !== false ? 'Aktif' : 'Non-Aktif',
            joinedAt: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
            roleAsli: u.role
          };
        }));
      }
    } catch (err) {
      console.error('Error loading admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'bg-[#EEEDFB] text-[#4840B0]';
      case 'Pemeliharaan': return 'bg-[#FEF7EC] text-[#A05820]';
      case 'Keamanan': return 'bg-[#E8FAF3] text-[#187050]';
      case 'Kebersihan': return 'bg-[#FEF0EE] text-[#C05040]';
      case 'Fasilitas': return 'bg-[#EAF6F5] text-[#208078]';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Logika Penyaringan Data (Client-side)
  const filteredAdmins = admins.filter(admin => {
    const matchDivisi = selectedDivisi === '' || admin.division.toLowerCase() === selectedDivisi.toLowerCase();
    
    const query = searchQuery.toLowerCase();
    const matchQuery = searchQuery === '' || 
      admin.name.toLowerCase().includes(query) || 
      admin.email.toLowerCase().includes(query) ||
      admin.phone.toLowerCase().includes(query);

    return matchDivisi && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Header & Filter Section */}
      <div className="card-section p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1E1E1E]">Data Admin Divisi</h2>
            <p className="text-xs text-[#8A857F]">Informasi hak akses operator per divisi operasional apartemen</p>
          </div>
        </div>

        {/* Baris Kontrol Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Dropdown Filter Sesuai Request */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8A857F] uppercase italic">Divisi:</span>
              <select 
                value={selectedDivisi} 
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="bg-[#F8F7F5] border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                <option value="">Semua Divisi</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Pemeliharaan">Pemeliharaan</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Fasilitas">Fasilitas</option>
              </select>
            </div>

            {/* Input Pencarian */}
            <div className="relative group w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#8A857F] group-focus-within:text-[#1E1E1E] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, email, telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F7F5] border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#EAE6E1] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-0 overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase">Nama</th>
                <th className="p-4 text-[10px] font-black uppercase">Divisi</th>
                <th className="p-4 text-[10px] font-black uppercase">Email</th>
                <th className="p-4 text-[10px] font-black uppercase">No. Telepon</th>
                <th className="p-4 text-[10px] font-black uppercase">Status</th>
                <th className="p-4 text-[10px] font-black uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-xs font-bold text-gray-400 animate-pulse">
                    Sinkronisasi data staf operasional...
                  </td>
                </tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs font-bold text-[#1E1E1E]">{admin.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getDivisionBadgeClass(admin.division)}`}>
                        {admin.division}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">{admin.email}</td>
                    <td className="p-4 text-xs font-mono text-gray-500">{admin.phone}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${admin.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedAdmin(admin)}
                        className="text-indigo-600 hover:text-indigo-900 font-extrabold text-xs transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-xs text-gray-400 font-bold italic">
                    Tidak ada data admin atau teknisi lapangan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: Jendela Informasi Detail Admin */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-up">
            {/* Modal Header */}
            <div className="p-6 bg-[#FAF9F7] border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1E1E1E] uppercase tracking-wider">Profil Detail Operator</h3>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Informasi sistem internal apartemen</p>
              </div>
              <button 
                onClick={() => setSelectedAdmin(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</span>
                <p className="text-sm font-extrabold text-[#1E1E1E]">{selectedAdmin.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Divisi Kerja</span>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getDivisionBadgeClass(selectedAdmin.division)}`}>
                      {selectedAdmin.division}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Akun</span>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{selectedAdmin.status}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat Email</span>
                <p className="text-xs font-mono font-bold text-gray-700">{selectedAdmin.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor Telepon / WA</span>
                <p className="text-xs font-mono font-bold text-gray-700">{selectedAdmin.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Database</span>
                  <p className="text-[11px] font-mono font-bold text-amber-700">{selectedAdmin.roleAsli}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terdaftar Sejak</span>
                  <p className="text-xs font-bold text-gray-600">{selectedAdmin.joinedAt}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F7] border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAdmin(null)}
                className="bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-sm"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}