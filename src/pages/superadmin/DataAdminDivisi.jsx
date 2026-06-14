import React, { useState } from 'react';
import { Plus, X, User, Phone, Mail, Shield } from 'lucide-react';

export default function DataAdminDivisi() {
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Rina Kurnia', division: 'Keuangan', email: 'rina.k@simantap.id', phone: '0812-3456-7899', status: 'Aktif' },
    { id: 2, name: 'Doni Praetya', division: 'Pemeliharaan', email: 'doni.p@simantap.id', phone: '0823-4567-8900', status: 'Aktif' },
    { id: 3, name: 'Agus Wibowo', division: 'Keamanan', email: 'agus.w@simantap.id', phone: '0834-5678-9011', status: 'Aktif' },
    { id: 4, name: 'Siti Rahayu', division: 'Kebersihan', email: 'siti.r@simantap.id', phone: '0845-6789-0122', status: 'Aktif' }
  ]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    name: '', division: 'Keuangan', emailSuffix: '', phone: ''
  });

  const getDivisionBadgeClass = (division) => {
    switch (division) {
      case 'Keuangan': return 'badge-lavender';
      case 'Pemeliharaan': return 'badge-yellow';
      case 'Keamanan': return 'badge-mint';
      case 'Kebersihan': return 'badge-pink';
      case 'Fasilitas': return 'badge-mint';
      default: return 'badge-gray';
    }
  };

  const openDetail = (admin) => {
    setSelectedAdmin(admin);
    setDetailOpen(true);
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.phone || !newAdmin.emailSuffix) return;
    const added = {
      id: Date.now(),
      name: newAdmin.name,
      division: newAdmin.division,
      email: `${newAdmin.emailSuffix.toLowerCase()}@simantap.id`,
      phone: newAdmin.phone,
      status: 'Aktif'
    };
    setAdmins(prev => [...prev, added]);
    setModalOpen(false);
    showToast(`Admin "${newAdmin.name}" berhasil ditambahkan!`);
    setNewAdmin({ name: '', division: 'Keuangan', emailSuffix: '', phone: '' });
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Header */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Data Admin Divisi</h2>
          <p className="text-xs text-muted">Pengelolaan hak akses operator per divisi operasional</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs font-bold">
          <Plus size={14} />
          <span>Tambah Admin</span>
        </button>
      </div>

      {/* Table */}
      <div className="card-section p-6 overflow-hidden">
        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Divisi</th>
                <th>Email</th>
                <th>No. Telepon</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="font-bold text-ink">{admin.name}</td>
                  <td>
                    <span className={`badge-base ${getDivisionBadgeClass(admin.division)}`}>
                      {admin.division}
                    </span>
                  </td>
                  <td className="font-mono text-muted">{admin.email}</td>
                  <td className="font-mono text-muted">{admin.phone}</td>
                  <td>
                    <span className="badge-base badge-mint">{admin.status}</span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => openDetail(admin)}
                      className="text-[10px] font-black uppercase text-ink hover:underline tracking-tighter"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail — sama persis gaya DataPenghuni */}
      {detailOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="relative h-24 bg-[#EAE6E1]">
              <button
                onClick={() => setDetailOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-all"
              >
                <X size={16} />
              </button>
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                <User size={32} className="text-[#C8C2BC]" />
              </div>
            </div>

            <div className="pt-14 p-8 space-y-6">
              <div>
                <h4 className="text-lg font-black text-ink tracking-tight">{selectedAdmin.name}</h4>
                <p className="text-xs font-bold text-muted flex items-center gap-1.5 mt-1">
                  <Shield size={12} /> Admin {selectedAdmin.division}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">WhatsApp / Call</p>
                    <p className="text-xs font-bold text-ink">{selectedAdmin.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Alamat Email</p>
                    <p className="text-xs font-bold text-ink">{selectedAdmin.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Status Akun</p>
                    <p className="text-xs font-bold text-ink">{selectedAdmin.status}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailOpen(false)}
                className="w-full btn-primary py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tambah Admin Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Admin Divisi</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Kurnia"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Divisi</label>
                  <select
                    value={newAdmin.division}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, division: e.target.value }))}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Keuangan">Keuangan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Fasilitas">Fasilitas</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">No. Telepon</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081-2345-6789"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Email Prefix</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: rina.k"
                    value={newAdmin.emailSuffix}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, emailSuffix: e.target.value }))}
                    className="block w-full px-3.5 py-2.5 input-modern rounded-l-xl rounded-r-none font-semibold border-r-0"
                  />
                  <span className="bg-[#FAF6F0] border border-l-0 border-soft rounded-r-xl px-4 py-2.5 text-xs text-muted font-bold font-mono">
                    @simantap.id
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold">
                  Tambah Admin
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold">
                  Batal
                </button>
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