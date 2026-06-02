import React, { useState } from 'react';
import { User, CheckCircle2, Shield, X, Save } from 'lucide-react';

export default function ProfilSaya() {
  const [successToast, setSuccessToast] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Profile data state
  const [profile, setProfile] = useState({
    ktp: '3578xxxx12345678',
    phone: '0889-7528-5486',
    email: 'hendrag@email.com',
    whatsapp: '0889-7528-5486',
    emergencyContact: 'Dewi Gunawan · 082345678901',
    emergencyName: 'Dewi Gunawan',
    emergencyPhone: '082345678901'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleOpenEdit = () => {
    setTempProfile({ ...profile });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProfile({
      ...profile,
      phone: tempProfile.phone,
      email: tempProfile.email,
      whatsapp: tempProfile.whatsapp,
      emergencyName: tempProfile.emergencyName,
      emergencyPhone: tempProfile.emergencyPhone,
      emergencyContact: `${tempProfile.emergencyName} · ${tempProfile.emergencyPhone}`
    });
    setEditModalOpen(false);
    setSuccessToast('Profil berhasil diperbarui!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Profile Header Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="avatar w-16 h-16 text-2xl font-black avatar-lavender border border-soft shadow-inner flex-shrink-0">
            HG
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-ink leading-none">Hendra Gunawan</h2>
            <p className="text-xs text-muted font-semibold mt-2">
              Unit 12A · Tower A · Lantai 12
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="btn-ghost px-4 py-2 text-xs font-bold shadow-softer"
        >
          Edit Profil
        </button>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL - Data Pribadi */}
        <div className="card-section p-6 space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-3 border-b border-soft flex items-center gap-2">
            <User size={16} />
            <span>Data Pribadi</span>
          </h3>

          <div className="divide-y divide-soft text-xs font-semibold text-ink">
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">No. KTP</span>
              <span className="text-active">{profile.ktp}</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">No. Telepon</span>
              <span className="text-active">{profile.phone}</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Email</span>
              <span className="text-active font-bold">{profile.email}</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">WhatsApp</span>
              <span className="text-active">{profile.whatsapp}</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Kontak Darurat</span>
              <span className="text-active font-bold">{profile.emergencyContact}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Data Hunian */}
        <div className="card-section p-6 space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-3 border-b border-soft flex items-center gap-2">
            <Shield size={16} />
            <span>Data Hunian</span>
          </h3>

          <div className="divide-y divide-soft text-xs font-semibold text-ink">
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">No. Unit</span>
              <span className="text-active font-bold">12A</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Tower</span>
              <span className="text-active">Tower A</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Lantai</span>
              <span className="text-active">Lantai 12</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Luas Unit</span>
              <span className="text-active">42 m²</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Tgl Masuk</span>
              <span className="text-active">15 Januari 2023</span>
            </div>
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Kendaraan</span>
              <span className="text-active font-bold">L 1234 AB (Mobil)</span>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setEditModalOpen(false)}></div>
          <div className="modal-box max-w-sm relative z-10 animate-scale-in">
            
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Edit Profil Saya
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="modal-body space-y-4">
              
              {/* Phone number */}
              <div>
                <label className="label-modern">
                  No. Telepon
                </label>
                <input
                  type="text"
                  required
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-modern"
                />
              </div>

              {/* Email */}
              <div>
                <label className="label-modern">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="input-modern"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="label-modern">
                  WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={tempProfile.whatsapp}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="input-modern"
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">
                    Nama Kontak Darurat
                  </label>
                  <input
                    type="text"
                    required
                    value={tempProfile.emergencyName}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyName: e.target.value }))}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">
                    No. Telp Darurat
                  </label>
                  <input
                    type="text"
                    required
                    value={tempProfile.emergencyPhone}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    className="input-modern"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-1.5"
                >
                  <Save size={13} />
                  <span>Simpan Perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-ghost text-xs border-none"
                >
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
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Sukses</p>
            <p className="text-[10px] opacity-90 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
