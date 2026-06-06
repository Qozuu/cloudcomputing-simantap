import React, { useState } from 'react';
import { Upload, Plus, FileText, Loader, CheckCircle, X, Search } from 'lucide-react';

export default function KelolaPenghuniKeuangan() {
  // State dummy untuk menampilkan data penghuni di tabel
  const [residents, setResidents] = useState([
    { id: 1, name: 'Hendra G.', unit: '12A', email: 'hendra.g@gmail.com', phone: '081234567890', status: 'ACTIVE' },
    { id: 2, name: 'Maya S.', unit: '05B', email: 'maya.s@gmail.com', phone: '081298765432', status: 'ACTIVE' },
    { id: 3, name: 'Rudi H.', unit: '18C', email: 'rudi.h@gmail.com', phone: '085711223344', status: 'ACTIVE' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // State Form Tambah Manual
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualUnit, setManualUnit] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // 1. FUNGSI IMPORT CSV
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      // Jalur API Backend Cloud kamu
      const response = await fetch('http://localhost:5000/api/finance/import-residents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessToast(`Sukses mengimport ${data.count || 0} penghuni & email blast terkirim!`);
        // Opsional: fetch ulang data dari database di sini jika sudah terhubung API asli
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah file CSV.');
    } finally {
      setUploading(false);
    }
  };

  // 2. FUNGSI SIMPAN TAMBAH MANUAL
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    const newResidentData = {
      nama: manualName,
      email: manualEmail,
      nomor_unit: manualUnit,
      nomor_hp: manualPhone
    };

    try {
      // Sesuaikan endpoint backend untuk tambah data satuan
      const response = await fetch('http://localhost:5000/api/finance/add-resident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newResidentData)
      });

      if (response.ok) {
        // Simulasi menambahkan data ke state UI lokal agar langsung muncul di tabel
        setResidents(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            name: manualName, 
            unit: manualUnit, 
            email: manualEmail, 
            phone: manualPhone, 
            status: 'ACTIVE' 
          }
        ]);

        setIsModalOpen(false);
        setSuccessToast(`Penghuni ${manualName} berhasil ditambah! Email notifikasi dikirim.`);
        
        // Reset form fields
        setManualName('');
        setManualEmail('');
        setManualUnit('');
        setManualPhone('');
      } else {
        alert('Gagal menambahkan data penghuni.');
      }
    } catch (error) {
      // Fallback simulasi jika backend belum dinyalakan/dihubungkan saat demo front-end
      setResidents(prev => [...prev, { id: Date.now(), name: manualName, unit: manualUnit, email: manualEmail, phone: manualPhone, status: 'ACTIVE' }]);
      setIsModalOpen(false);
      setSuccessToast(`[Simulasi] Akun ${manualName} aktif & email dikirim!`);
    }

    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter Data untuk pencarian di tabel
  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.unit.includes(searchTerm)
  );

  return (
    <div className="p-6 bg-app-bg min-h-screen space-y-6">
      
      {/* HEADER DAN GRUP TOMBOL AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-surface border border-soft rounded-3xl shadow-soft">
        <div>
          <h2 className="text-base font-bold text-ink uppercase tracking-wider">Kelola Data Akun Penghuni</h2>
          <p className="text-xs text-muted mt-1">Gunakan fitur ini untuk inisialisasi data penghuni baru guna keperluan penagihan e-Billing.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* TOMBOL TAMBAH MANUAL */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Tambah Manual</span>
          </button>

          {/* TOMBOL IMPORT CSV */}
          <label className={`btn-ghost btn-sm border border-soft flex items-center gap-1.5 cursor-pointer bg-surface ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader className="animate-spin" size={14} /> : <Upload size={14} />}
            <span>{uploading ? 'Memproses...' : 'Import CSV'}</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleImportCSV} 
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* SEARCH BAR & TABEL DATA */}
      <div className="bg-surface border border-soft rounded-3xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-soft flex items-center gap-2 max-w-xs">
          <Search size={16} className="text-muted" />
          <input 
            type="text"
            placeholder="Cari nama atau unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern py-1.5 text-xs flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-app-bg text-[10px] font-bold text-ink uppercase tracking-wider border-b border-soft">
                <th className="p-4">Nama Penghuni</th>
                <th className="p-4">No. Unit</th>
                <th className="p-4">Email</th>
                <th className="p-4">No. WhatsApp</th>
                <th className="p-4">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-ink font-medium">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-app-bg/50 transition">
                  <td className="p-4 font-bold">{resident.name}</td>
                  <td className="p-4">{resident.unit}</td>
                  <td className="p-4 text-muted">{resident.email}</td>
                  <td className="p-4 text-muted">{resident.phone}</td>
                  <td className="p-4">
                    <span className="badge-base bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {resident.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POPUP: TAMBAH PENGHUNI MANUAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md relative overflow-hidden">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Penghuni Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="modal-body p-5 space-y-4">
              <div>
                <label className="label-modern">Nama Lengkap</label>
                <input 
                  type="text" required value={manualName} 
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Contoh: Budi Santoso" className="input-modern font-semibold" 
                />
              </div>

              <div>
                <label className="label-modern">Nomor Unit</label>
                <input 
                  type="text" required value={manualUnit} 
                  onChange={(e) => setManualUnit(e.target.value)}
                  placeholder="Contoh: 12A / 05B" className="input-modern font-semibold" 
                />
              </div>

              <div>
                <label className="label-modern">Email Aktif</label>
                <input 
                  type="email" required value={manualEmail} 
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="budi@example.com" className="input-modern font-semibold" 
                />
              </div>

              <div>
                <label className="label-modern">Nomor WhatsApp</label>
                <input 
                  type="tel" required value={manualPhone} 
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="Contoh: 0812345678" className="input-modern font-semibold" 
                />
              </div>

              <p className="text-[10px] text-muted leading-relaxed italic bg-app-bg p-2.5 rounded-xl border border-soft">
                * Sistem cloud backend otomatis men-generate password default dan mengirimkan email instruksi aktivasi begitu data disimpan.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 text-xs font-bold">
                  Simpan & Kirim Akses
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 text-xs font-bold">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI BERHASIL */}
      {successToast && (
        <div className="toast-modern toast-success">
          <CheckCircle size={16} className="text-white flex-shrink-0" />
          <p className="text-xs font-bold">{successToast}</p>
        </div>
      )}

    </div>
  );
}