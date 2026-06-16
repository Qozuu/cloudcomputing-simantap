import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Shield, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProfilSaya() {
  const [successToast, setSuccessToast] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile data state
  const [profile, setProfile] = useState({
    name: '', 
    ktp: 'Belum diisi',     
    phone: '', 
    email: '',
    whatsapp: '',
    emergencyContact: 'Belum diatur',
    emergencyName: '',
    emergencyPhone: '',
    vehicle: '-',
    
    // Data Hunian di bawah dikunci mati (Sistem / Admin Keuangan)
    unit: '',
    tower: '',
    layer: '',
    space: '42 m²',
    joinDate: '28 Mei 2026'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const { data: dataHunian, error: hunianError } = await supabase
          .from('penghuni')
          .select('*, unit(nomor_unit, lantai, luas_m2, tower(nama_tower))')
          .eq('user_id', user.id)
          .single();

        if (hunianError) {
          console.warn('Gagal memuat data hunian:', hunianError.message);
        }

        // format KTP
        let formattedKtp = 'Belum diisi';
        const ktpVal = dataHunian?.no_ktp || '';
        if (ktpVal && ktpVal.length >= 8) {
          formattedKtp = `${ktpVal.substring(0, 4)}xxxx${ktpVal.substring(ktpVal.length - 8)}`;
        }

        setProfile({
          name: userProfile?.nama || 'Penghuni',
          ktp: formattedKtp,
          rawKtp: ktpVal,
          phone: userProfile?.no_hp || '',
          email: userProfile?.email || '',
          whatsapp: dataHunian?.no_wa || userProfile?.no_hp || '',
          emergencyContact: dataHunian?.kontak_darurat_nama && dataHunian?.kontak_darurat_no
            ? `${dataHunian.kontak_darurat_nama} · ${dataHunian.kontak_darurat_no}`
            : 'Belum diatur',
          emergencyName: dataHunian?.kontak_darurat_nama || '',
          emergencyPhone: dataHunian?.kontak_darurat_no || '',
          vehicle: dataHunian?.no_plat_kendaraan || '-',
          unit: dataHunian?.unit?.nomor_unit || '-',
          tower: dataHunian?.unit?.tower?.nama_tower || '-',
          layer: dataHunian?.unit?.lantai ? `Lantai ${dataHunian.unit.lantai}` : '-',
          space: dataHunian?.unit?.luas_m2 ? `${dataHunian.unit.luas_m2} m²` : '42 m²',
          joinDate: dataHunian?.tgl_masuk || '28 Mei 2026'
        });
      } catch (err) {
        console.error('Gagal memuat profil:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenEdit = () => {
    setTempProfile({ 
      ...profile,
      ktp: profile.ktp === 'Belum diisi' ? '' : profile.rawKtp || profile.ktp,
      vehicle: profile.vehicle === '-' ? '' : profile.vehicle
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update users
      const { error: userError } = await supabase
        .from('users')
        .update({
          nama: tempProfile.name,
          no_hp: tempProfile.phone,
          email: tempProfile.email
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update penghuni
      const { error: penghuniError } = await supabase
        .from('penghuni')
        .update({
          no_ktp: tempProfile.ktp,
          no_wa: tempProfile.whatsapp,
          no_plat_kendaraan: tempProfile.vehicle,
          kontak_darurat_nama: tempProfile.emergencyName,
          kontak_darurat_no: tempProfile.emergencyPhone
        })
        .eq('user_id', user.id);

      if (penghuniError) {
        console.warn('Gagal memperbarui tabel penghuni:', penghuniError.message);
      }

      // Logic menyamarkan KTP (Sensor xxxx)
      let formattedKtp = tempProfile.ktp;
      let rawKtpSaved = tempProfile.ktp;
      if (tempProfile.ktp && tempProfile.ktp.length >= 8) {
        formattedKtp = `${tempProfile.ktp.substring(0, 4)}xxxx${tempProfile.ktp.substring(tempProfile.ktp.length - 8)}`;
      }

      setProfile({
        ...profile,
        name: tempProfile.name,
        ktp: formattedKtp || 'Belum diisi',
        rawKtp: rawKtpSaved, 
        phone: tempProfile.phone,
        email: tempProfile.email,
        whatsapp: tempProfile.whatsapp,
        vehicle: tempProfile.vehicle || '-',
        emergencyName: tempProfile.emergencyName,
        emergencyPhone: tempProfile.emergencyPhone,
        emergencyContact: tempProfile.emergencyName && tempProfile.emergencyPhone
          ? `${tempProfile.emergencyName} · ${tempProfile.emergencyPhone}`
          : 'Belum diatur'
      });
      
      setEditModalOpen(false);
      setSuccessToast('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Gagal memperbarui profil:', err.message);
    }
  };

  const getInitials = (name) => {
    return (name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Banner Notifikasi */}
      {profile.ktp === 'Belum diisi' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
          <AlertCircle size={20} className="shrink-0 text-amber-600" />
          <div className="text-xs font-semibold">
            <p className="font-bold text-amber-950">Profil Anda belum lengkap!</p>
            <p className="opacity-90 mt-0.5">Mohon lengkapi No. KTP, Kontak Darurat, dan Data Kendaraan Anda demi validasi hunian.</p>
          </div>
        </div>
      )}

      {/* Profile Header Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="avatar w-16 h-16 text-2xl font-black avatar-lavender border border-soft shadow-inner flex-shrink-0">
            {getInitials(profile.name)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-ink leading-none">{profile.name}</h2>
            <p className="text-xs text-muted font-semibold mt-2">
              Unit {profile.unit} · {profile.tower} · {profile.layer}
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
        
        {/* LEFT PANEL - Data Pribadi (Bisa diedit via modal) */}
        <div className="card-section p-6 space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-3 border-b border-soft flex items-center gap-2">
            <User size={16} />
            <span>Data Pribadi</span>
          </h3>

          <div className="divide-y divide-soft text-xs font-semibold text-ink">
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">No. KTP</span>
              <span className={profile.ktp === 'Belum diisi' ? 'text-rose-500 italic' : 'text-active'}>{profile.ktp}</span>
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
              <span className={profile.emergencyContact === 'Belum diatur' ? 'text-muted/60 italic font-medium' : 'text-active font-bold'}>
                {profile.emergencyContact}
              </span>
            </div>
            {/* ✨ Baris Kendaraan dipindah ke Data Pribadi */}
            <div className="flex py-3.5 items-center">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Kendaraan</span>
              <span className={profile.vehicle === '-' ? 'text-muted/60 italic font-medium' : 'text-active font-bold'}>
                {profile.vehicle}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Data Hunian (Murni Lock Sistem / Read Only) */}
        <div className="card-section p-6 space-y-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-3 border-b border-soft flex items-center gap-2">
            <Shield size={16} />
            <span>Data Hunian</span>
          </h3>

          <div className="divide-y divide-soft text-xs font-semibold text-ink">
            <div className="flex py-3.5 items-center bg-slate-50/50 px-2 rounded-lg">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">No. Unit</span>
              <span className="text-muted font-bold flex items-center gap-1.5">
                {profile.unit} <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal">Sistem</span>
              </span>
            </div>
            <div className="flex py-3.5 items-center bg-slate-50/50 px-2 rounded-lg">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Tower</span>
              <span className="text-muted">{profile.tower}</span>
            </div>
            <div className="flex py-3.5 items-center bg-slate-50/50 px-2 rounded-lg">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Lantai</span>
              <span className="text-muted">{profile.layer}</span>
            </div>
            <div className="flex py-3.5 items-center bg-slate-50/50 px-2 rounded-lg">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Luas Unit</span>
              <span className="text-muted">{profile.space}</span>
            </div>
            <div className="flex py-3.5 items-center bg-slate-50/50 px-2 rounded-lg">
              <span className="text-muted w-40 flex-shrink-0 uppercase text-[9px] font-bold tracking-widest">Tgl Masuk</span>
              <span className="text-muted">{profile.joinDate}</span>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setEditModalOpen(false)}></div>
          <div className="modal-box max-w-sm relative z-10 animate-scale-in">
            
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Edit Profil Saya
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-body space-y-4">
              
              <div>
                <label className="label-modern">No. KTP</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Masukkan 16 digit No. KTP"
                  value={tempProfile.ktp}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, ktp: e.target.value.replace(/\D/g, '') }))}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">No. Telepon</label>
                <input
                  type="text"
                  required
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">Email</label>
                <input
                  type="email"
                  required
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={tempProfile.whatsapp}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="input-modern"
                />
              </div>

              {/* ✨ Input Baru: Kendaraan & Nomor Pelat */}
              <div>
                <label className="label-modern">Data Kendaraan Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: L 1234 AB (Mobil)"
                  value={tempProfile.vehicle}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, vehicle: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-modern">Nama Kontak Darurat</label>
                  <input
                    type="text"
                    value={tempProfile.emergencyName}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyName: e.target.value }))}
                    className="input-modern"
                    placeholder="Nama"
                  />
                </div>
                <div>
                  <label className="label-modern">No. Telp Darurat</label>
                  <input
                    type="text"
                    value={tempProfile.emergencyPhone}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    className="input-modern"
                    placeholder="No. HP"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-1.5">
                  <Save size={13} />
                  <span>Simpan Perubahan</span>
                </button>
                <button type="button" onClick={() => setEditModalOpen(false)} className="btn-ghost text-xs border-none">
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