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
    rawKtp: '',
    phone: '', 
    email: '',
    whatsapp: '',
    emergencyContact: 'Belum diatur',
    emergencyName: '',
    emergencyPhone: '',
    vehicle: '-',
    
    // Data Hunian terikat sistem (Read-Only)
    unit: '',
    tower: '',
    layer: '',
    space: '42 m²',
    joinDate: '-'
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  // Fungsi helper untuk memformat tampilan sensor KTP
  const formatKtpDisplay = (ktpVal) => {
    if (!ktpVal || ktpVal === 'Belum diisi') return 'Belum diisi';
    if (ktpVal.length >= 8) {
      return `${ktpVal.substring(0, 4)}xxxx${ktpVal.substring(ktpVal.length - 4)}`;
    }
    return ktpVal;
  };

  async function loadProfileData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil data akun utama dari public.users
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // 2. Ambil data profil hunian spesifik penghuni dari public.penghuni
      const { data: dataHunian, error: hunianError } = await supabase
        .from('penghuni')
        .select('*, unit(nomor_unit, lantai, luas_m2, tower(nama_tower))')
        .eq('user_id', user.id)
        .maybeSingle();

      if (hunianError) console.warn('Gagal memuat data hunian:', hunianError.message);

      const ktpVal = dataHunian?.no_ktp || '';
      
      // Memecah kembali string kontak_darurat (format: "Nama · NoTelp") jika tersedia
      let emName = '';
      let emPhone = '';
      if (dataHunian?.kontak_darurat && dataHunian.kontak_darurat.includes(' · ')) {
        const parts = dataHunian.kontak_darurat.split(' · ');
        emName = parts[0];
        emPhone = parts[1];
      } else if (dataHunian?.kontak_darurat) {
        emName = dataHunian.kontak_darurat;
      }

      setProfile({
        name: userProfile?.nama || dataHunian?.nama || 'Penghuni',
        ktp: formatKtpDisplay(ktpVal),
        rawKtp: ktpVal,
        phone: userProfile?.no_hp || '',
        email: userProfile?.email || '',
        whatsapp: dataHunian?.no_telepon || userProfile?.no_hp || '',
        emergencyContact: dataHunian?.kontak_darurat || 'Belum diatur',
        emergencyName: emName,
        emergencyPhone: emPhone,
        vehicle: dataHunian?.kendaraan || '-',
        unit: dataHunian?.unit?.nomor_unit || '-',
        tower: dataHunian?.unit?.tower?.nama_tower || '-',
        layer: dataHunian?.unit?.lantai ? `Lantai ${dataHunian.unit.lantai}` : '-',
        space: dataHunian?.unit?.luas_m2 ? `${dataHunian.unit.luas_m2} m²` : '42 m²',
        joinDate: dataHunian?.tgl_masuk ? new Date(dataHunian.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '21 Apr 2026'
      });
    } catch (err) {
      console.error('Gagal memuat profil:', err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleOpenEdit = () => {
    setTempProfile({ 
      name: profile.name,
      ktp: profile.rawKtp, 
      phone: profile.phone,
      email: profile.email,
      whatsapp: profile.whatsapp,
      vehicle: profile.vehicle === '-' ? '' : profile.vehicle,
      emergencyName: profile.emergencyName,
      emergencyPhone: profile.emergencyPhone
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update data dasar di tabel 'users' (Email ditiadakan agar tidak bisa diubah mandiri)
      const { error: userError } = await supabase
        .from('users')
        .update({
          nama: tempProfile.name,
          no_hp: tempProfile.phone
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Menggabungkan nama dan nomor telepon darurat menjadi satu string sesuai skema kolom database
      const gabungKontakDarurat = tempProfile.emergencyName && tempProfile.emergencyPhone
        ? `${tempProfile.emergencyName} · ${tempProfile.emergencyPhone}`
        : tempProfile.emergencyName || '';

      // 2. Update data di tabel 'penghuni' menggunakan kolom yang VALID sesuai skema database-mu
      const { error: penghuniError } = await supabase
        .from('penghuni')
        .update({
          nama: tempProfile.name,
          no_ktp: tempProfile.ktp,
          no_telepon: tempProfile.whatsapp, // Mencocokkan kolom no_telepon di skema db
          kendaraan: tempProfile.vehicle,   // Mencocokkan kolom kendaraan di skema db
          kontak_darurat: gabungKontakDarurat // Mencocokkan kolom kontak_darurat di skema db
        })
        .eq('user_id', user.id);

      if (penghuniError) throw penghuniError;

      // Refresh data dari database
      await loadProfileData();
      
      setEditModalOpen(false);
      setSuccessToast('Profil data pribadi berhasil diperbarui!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Gagal memperbarui profil:', err.message);
      alert(`Gagal menyimpan perubahan: ${err.message}`);
    }
  };

  const getInitials = (name) => {
    return (name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat Berkas Profil...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative text-zinc-800">
      
      {/* Banner Peringatan Kelengkapan Data */}
      {(profile.rawKtp === '' || profile.emergencyContact === 'Belum diatur') && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200/70 rounded-2xl text-amber-800 shadow-sm">
          <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs font-semibold">
            <p className="font-bold text-amber-950">Lengkapi Berkas Identitas Anda</p>
            <p className="opacity-90 mt-0.5">Mohon lengkapi No. KTP, Nomor WhatsApp Aktif, serta Kontak Darurat demi keamanan hunian Anda.</p>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-full text-lg font-black bg-zinc-900 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            {getInitials(profile.name)}
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-950 leading-none">{profile.name}</h2>
            <p className="text-xs text-zinc-400 font-semibold mt-1.5">
              Unit Hunian: <span className="text-zinc-700 font-bold">{profile.unit}</span> · {profile.tower} · {profile.layer}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
        >
          Edit Profil
        </button>
      </div>

      {/* Grid Susunan Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-semibold">
        
        {/* PANEL KIRI - Informasi Kontak & Biodata Pribadi */}
        <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider pb-3 border-b border-zinc-100 flex items-center gap-2">
            <User size={15} className="text-zinc-400" />
            <span>Biodata & Kontak Personal</span>
          </h3>

          <div className="divide-y divide-zinc-100 text-zinc-800">
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">No. KTP Identitas</span>
              <span className={profile.rawKtp === '' ? 'text-red-600 italic' : 'text-zinc-900 font-bold font-mono'}>{profile.ktp}</span>
            </div>
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">No. Handphone</span>
              <span className="text-zinc-900 font-bold">{profile.phone || '-'}</span>
            </div>
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Alamat Email</span>
              <span className="text-zinc-900 font-bold">{profile.email}</span>
            </div>
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Koneksi WhatsApp</span>
              <span className="text-zinc-900 font-bold">{profile.whatsapp || '-'}</span>
            </div>
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Kontak Darurat</span>
              <span className={profile.emergencyContact === 'Belum diatur' ? 'text-zinc-400 italic font-medium' : 'text-zinc-900 font-bold'}>
                {profile.emergencyContact}
              </span>
            </div>
            <div className="flex py-3 items-center justify-between">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">No. Plat Kendaraan</span>
              <span className={profile.vehicle === '-' ? 'text-zinc-400 italic font-medium' : 'text-zinc-900 font-bold uppercase'}>
                {profile.vehicle}
              </span>
            </div>
          </div>
        </div>

        {/* PANEL KANAN - Validasi Hunian Resmi Kontrol Manajemen (Read Only) */}
        <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider pb-3 border-b border-zinc-100 flex items-center gap-2">
            <Shield size={15} className="text-zinc-400" />
            <span>Validasi Penempatan Hunian</span>
          </h3>

          <div className="divide-y divide-zinc-100 text-zinc-600">
            <div className="flex py-3.5 items-center justify-between bg-zinc-50/70 px-3 rounded-xl mb-1 border border-zinc-100">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Nomor Unit Kamar</span>
              <span className="text-zinc-900 font-black flex items-center gap-1.5">
                {profile.unit} <span className="text-[9px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Locked</span>
              </span>
            </div>
            <div className="flex py-3 items-center justify-between px-1">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Gedung / Tower</span>
              <span className="text-zinc-800 font-bold">{profile.tower}</span>
            </div>
            <div className="flex py-3 items-center justify-between px-1">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Lantai Hunian</span>
              <span className="text-zinc-800 font-bold">{profile.layer}</span>
            </div>
            <div className="flex py-3 items-center justify-between px-1">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Dimensi Luas Kamar</span>
              <span className="text-zinc-800 font-bold">{profile.space}</span>
            </div>
            <div className="flex py-3 items-center justify-between px-1">
              <span className="text-zinc-400 uppercase text-[10px] font-bold tracking-wider">Tanggal Masuk Hunian</span>
              <span className="text-zinc-800 font-bold">{profile.joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT DATA PROFIL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden border border-zinc-100 animate-scale-in text-xs font-semibold">
            
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                Perbarui Profil Saya
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">No. KTP Identitas (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Masukkan 16 digit angka KTP resmi"
                  value={tempProfile.ktp}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, ktp: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">No. Handphone</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.whatsapp}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Alamat Email</label>
                <input
                  type="email"
                  disabled
                  value={tempProfile.email}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-100 text-zinc-400 bg-zinc-50 cursor-not-allowed font-medium"
                />
                <p className="text-[10px] text-zinc-400/80 mt-1 font-medium italic">
                  * Email terikat akun keamanan. Hubungi pihak pengelola jika ingin ganti email.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nomor Plat Kendaraan</label>
                <input
                  type="text"
                  placeholder="Contoh: B 1234 ABC (Mobil)"
                  value={tempProfile.vehicle}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, vehicle: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Kontak Darurat</label>
                  <input
                    type="text"
                    value={tempProfile.emergencyName}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
                    placeholder="Nama kerabat"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">No. Telp Darurat</label>
                  <input
                    type="text"
                    value={tempProfile.emergencyPhone}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
                    placeholder="No. HP aktif"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-100">
                <button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm">
                  <Save size={13} />
                  <span>Simpan Perubahan</span>
                </button>
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={13} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Pembaruan Sukses</p>
            <p className="text-[10px] text-zinc-400 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}