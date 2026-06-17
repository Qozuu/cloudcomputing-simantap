import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function DataAdminDivisi() {
  const [admins, setAdmins] = useState([]);
  const [successToast, setSuccessToast] = useState('');

  const loadAdmins = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'penghuni')
        .neq('role', 'super_admin')
        .order('nama');

      if (data) {
        setAdmins(data.map(u => {
          let divName = 'Management';
          if (u.role === 'div_keuangan') divName = 'Keuangan';
          else if (u.role === 'div_pemeliharaan') divName = 'Pemeliharaan';
          else if (u.role === 'div_keamanan') divName = 'Keamanan';
          else if (u.role === 'div_kebersihan') divName = 'Kebersihan';
          else if (u.role === 'div_fasilitas') divName = 'Fasilitas';

          return {
            id: u.id,
            name: u.nama,
            division: divName,
            email: u.email,
            phone: u.no_hp || '—',
            status: u.is_active !== false ? 'Aktif' : 'Non-Aktif'
          };
        }));
      }
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

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

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Header section (Tombol Tambah Admin SUDAH DIHAPUS) */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Data Admin Divisi</h2>
          <p className="text-xs text-muted">Pengelolaan hak akses operator per divisi operasional</p>
        </div>
      </div>

      {/* Table Section */}
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
                    <span className="badge-base badge-mint">
                      {admin.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => showToast(`Edit form untuk ${admin.name} dibuka (Simulasi).`)}
                      className="text-ink hover:underline font-bold text-xs"
                    >
                      Edit
                    </button>
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