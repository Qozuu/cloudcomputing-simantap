import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, LogIn, LogOut, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { APARTMENT_CONFIG } from '../../constants/absensi';
import { getDistanceMeters, getCurrentPosition } from '../../utils/geolocation';
import {
  SESSION_KEYS,
  getSession,
  saveCheckIn,
  saveCheckOut,
  clearSession
} from '../../utils/authSession';
import { supabase } from '../../lib/supabase';

export default function AbsensiCheckIn() {
  const navigate = useNavigate();
  // 🚀 MODIFIKASI DEMO: Set default 'success' dan jarak 0m agar saat halaman dibuka langsung SIAP KLIK!
  const [gpsStatus, setGpsStatus] = useState('success'); 
  const [gpsDistance, setGpsDistance] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [jamMasuk, setJamMasuk] = useState('--:--');
  const [jamKeluar, setJamKeluar] = useState('--:--');
  const [clock, setClock] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeAbsenId, setActiveAbsenId] = useState(null);

  const [profile, setProfile] = useState({
    name: 'Karyawan',
    roleName: 'Staff Operasional',
    initials: 'ST',
    bg: '#FEF7EC',
    color: '#A05820'
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('users')
        .select('nama, role')
        .eq('id', user.id)
        .single();

      const name = profileData?.nama || 'Karyawan';
      const role = profileData?.role || '';
      setUserName(name);
      setUserRole(role);

      const activeRole = role.toUpperCase();
      const profileMap = {
        'SUPER_ADMIN': { name, roleName: 'General Manager', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF0EE', color: '#C05040' },
        'SUPERADMIN': { name, roleName: 'General Manager', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF0EE', color: '#C05040' },
        'GM': { name, roleName: 'General Manager', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF0EE', color: '#C05040' },
        'KEUANGAN': { name, roleName: 'Divisi Keuangan', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF7EC', color: '#A05820' },
        'PEMELIHARAAN': { name, roleName: 'Divisi Pemeliharaan', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#EEEDFB', color: '#5850C0' },
        'KEBERSIHAN': { name, roleName: 'Divisi Kebersihan', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#E8FAF3', color: '#208060' },
        'KEAMANAN': { name, roleName: 'Divisi Keamanan', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF0EE', color: '#C05040' },
        'FASILITAS': { name, roleName: 'Divisi Fasilitas', initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), bg: '#FEF7EC', color: '#A05820' }
      };

      setProfile(profileMap[activeRole] || {
        name,
        roleName: role,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
        bg: '#FEF7EC',
        color: '#A05820'
      });

      const { data: lastAbsensi } = await supabase
        .from('absensi')
        .select('*')
        .eq('karyawan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastAbsensi && lastAbsensi.jam_masuk && !lastAbsensi.jam_keluar) {
        setCheckedIn(true);
        setCheckedOut(false);
        setJamMasuk(lastAbsensi.jam_masuk);
        setActiveAbsenId(lastAbsensi.id);
        saveCheckIn(lastAbsensi.jam_masuk, lastAbsensi.id);
      } else {
        setCheckedIn(false);
        setCheckedOut(false);
        setJamMasuk('--:--');
        setJamKeluar('--:--');
        setActiveAbsenId(null);
      }

      setLoading(false);
    }
    init();

    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setGpsStatus('loading');
    setErrorMessage('');

    try {
      // 🚀 MODIFIKASI DEMO: Bypass penuh geolocation palsu browser untuk kelancaran presentasi kelas
      setGpsDistance(0);
      setGpsStatus('success');

      const { data: { user } } = await supabase.auth.getUser();
      const today = new Date().toISOString().split('T')[0];
      const jamMasukTime = new Date().toTimeString().slice(0, 8);
      const lokasi = `${APARTMENT_CONFIG.latitude},${APARTMENT_CONFIG.longitude}`;

      const { data, error } = await supabase
        .from('absensi')
        .insert({
          karyawan_id: user.id,
          tanggal:     today,
          jam_masuk:   jamMasukTime,
          status:      'hadir',
          lokasi,
        })
        .select()
        .single();

      if (error) {
        setGpsStatus('error');
        setErrorMessage(error.message || 'Gagal menyimpan check-in');
        return;
      }

      saveCheckIn(data.jam_masuk, data.id);
      setJamMasuk(data.jam_masuk);
      setActiveAbsenId(data.id);
      setCheckedIn(true);
      setCheckedOut(false);

    } catch (err) {
      setGpsStatus('error');
      setErrorMessage(err.message || 'Error aplikasi');
    }
  };

  const handleCheckOut = async () => {
    setGpsStatus('loading');
    setErrorMessage('');

    try {
      // 🚀 MODIFIKASI DEMO: Bypass penuh geolocation palsu browser untuk kelancaran presentasi kelas
      setGpsDistance(0);
      setGpsStatus('success');

      const jamKeluarTime = new Date().toTimeString().slice(0, 8);

      if (!activeAbsenId) {
        setGpsStatus('error');
        setErrorMessage('ID transaksi absensi tidak ditemukan. Silakan refresh.');
        return;
      }

      const { error } = await supabase
        .from('absensi')
        .update({ jam_keluar: jamKeluarTime })
        .eq('id', activeAbsenId);

      if (error) {
        setGpsStatus('error');
        setErrorMessage(error.message || 'Gagal menyimpan check-out');
        return;
      }

      saveCheckOut(jamKeluarTime);
      setJamKeluar(jamKeluarTime);
      setCheckedOut(true);

      setTimeout(() => {
        clearSession();
        sessionStorage.removeItem(SESSION_KEYS.CURRENT_ROLE);
        
        setCheckedIn(false);
        setCheckedOut(false);
        setJamMasuk('--:--');
        setJamKeluar('--:--');
        setActiveAbsenId(null);

        navigate('/pilih-role'); 
      }, 2000);

    } catch (err) {
      setGpsStatus('error');
      setErrorMessage(err.message || 'Error aplikasi');
    }
  };

  // Fungsi saklar pemaksa status khusus demo kelas
  const forceToggleGpsSuccess = () => {
    setGpsStatus('success');
    setGpsDistance(0);
    setErrorMessage('');
  };

  const handleEnterApp = () => {
    const { intendedRoute, role } = getSession();
    let target = intendedRoute;
    if (!target || target === '/login') {
      const ROLE_ROUTES = {
        'super_admin':     '/super-admin/dashboard',
        'superadmin':      '/super-admin/dashboard',
        'gm':              '/super-admin/dashboard',
        'keuangan':        '/keuangan/dashboard',
        'pemeliharaan':    '/pemeliharaan/dashboard',
        'kebersihan':      '/kebersihan/jadwal',
        'fasilitas':       '/fasilitas/dashboard',
        'keamanan':        '/keamanan/dashboard',
        'penghuni':        '/penghuni/beranda',
      };
      target = ROLE_ROUTES[role?.toLowerCase()] || '/login';
    }
    sessionStorage.removeItem(SESSION_KEYS.INTENDED_ROUTE);
    navigate(target);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#A05820]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="card-white max-w-sm w-full mx-auto animate-scale-in relative z-10 flex flex-col justify-center">
        
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center font-black text-xl shadow-soft"
            style={{ backgroundColor: profile.bg, color: profile.color }}
          >
            <span>{profile.initials}</span>
          </div>
          <p className="text-sm font-medium text-[#8A857F] text-center mb-1">{currentDate}</p>
          <h4 className="text-lg font-bold text-[#1E1E1E] leading-none mt-1.5">{profile.name}</h4>
          <span className="text-xs font-semibold text-[#8A857F] leading-none mt-1 inline-block">
            {profile.roleName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-[#FAF6F0] border border-[rgba(30,30,30,0.05)] rounded-2xl p-3.5 text-center my-3">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-widest">Jam Masuk</p>
            <p className="text-sm font-bold text-[#1E1E1E]">{jamMasuk}</p>
          </div>
          <div className="space-y-0.5 border-l border-[rgba(30,30,30,0.08)]">
            <p className="text-[9px] font-bold text-[#8A857F] uppercase tracking-widest">Jam Keluar</p>
            <p className="text-sm font-bold text-[#1E1E1E]">{jamKeluar}</p>
          </div>
        </div>

        <div className="text-center my-4">
          <p className="font-black text-5xl tracking-tighter text-[#1E1E1E]">{clock}</p>
          <p className="text-[10px] text-[#8A857F] font-bold tracking-wider uppercase mt-1">Waktu Kehadiran Aktif</p>
        </div>

        <div className="flex justify-center my-3">
          {gpsStatus === 'idle' && (
            <span className="bg-[#FAF6F0] text-[#8A857F] rounded-full px-4 py-2 text-xs font-bold">
              Lokasi belum diverifikasi
            </span>
          )}
          {gpsStatus === 'loading' && (
            <span className="bg-[#FEF7EC] text-[#A05820] rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              Mengambil lokasi...
              <Loader2 size={12} className="animate-spin" />
            </span>
          )}
          {gpsStatus === 'success' && (
            <span className="bg-[#E8FAF3] text-[#187050] rounded-full px-4 py-2 text-xs font-bold">
              Lokasi terverifikasi · {gpsDistance}m
            </span>
          )}
          {gpsStatus === 'error' && (
            <span className="bg-[#FEF0EE] text-[#C05040] rounded-full px-4 py-2 text-xs font-bold">
              Diluar Jangkauan · {gpsDistance}m
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 my-4">
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || gpsStatus !== 'success'}
            className={`btn-primary flex-1 justify-center py-3 rounded-2xl flex items-center gap-2 select-none transition-all duration-200 ${
              (checkedIn || gpsStatus !== 'success') ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <LogIn size={14} />
            <span>Check-In</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!checkedIn || checkedOut || gpsStatus !== 'success'}
            className={`bg-[#FCD6A5] text-[#7A4010] font-bold rounded-2xl py-3 flex-1 justify-center flex items-center gap-2 select-none transition-all duration-200 ${
              (!checkedIn || checkedOut || gpsStatus !== 'success') ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <LogOut size={14} />
            <span>Check-Out</span>
          </button>
        </div>

        {gpsStatus === 'error' && (
          <div className="bg-[#FEF0EE] border border-[#F9C3BA]/50 rounded-2xl p-4 space-y-3 animate-fade-up">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-[#B84030] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] text-[#B84030] font-bold leading-normal">
                  {errorMessage || `Jarak Anda: ${gpsDistance}m · Radius Maks: ${APARTMENT_CONFIG.radiusMeters}m`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Force Saklar Reset untuk kelancaran demo kelas */}
        <div className="pt-2 border-t border-[rgba(30,30,30,0.05)] flex flex-col space-y-1">
          <p className="text-[9px] font-black text-[#8A857F] uppercase tracking-widest leading-none mb-1 text-center">
            Review Geolocation:
          </p>
          <div 
            onClick={forceToggleGpsSuccess}
            className="bg-[#FAF6F0] hover:bg-[#FEF7EC] text-[#8A857F] hover:text-[#A05820] border border-[rgba(30,30,30,0.06)] font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-all text-center cursor-pointer uppercase tracking-wider"
          >
            Simulasikan Area Apartemen
          </div>
        </div>

        {checkedIn && !checkedOut && (
          <div className="bg-[#E8FAF3] border border-[#B5EAD7]/50 rounded-2xl p-4 flex flex-col gap-3 mt-4 anonymity-fade-up">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#187050] flex-shrink-0" />
              <span className="text-[11px] text-[#187050] font-bold leading-normal">
                Check-in berhasil! Selamat bekerja.
              </span>
            </div>
            <button onClick={handleEnterApp} className="btn-primary w-full justify-center py-2.5 rounded-xl text-xs">
              Masuk Aplikasi
            </button>
          </div>
        )}

        {checkedOut && (
          <div className="bg-[#E8FAF3] border border-[#B5EAD7]/50 rounded-2xl p-4 flex items-center gap-3 mt-4 animate-fade-up">
            <CheckCircle size={18} className="text-[#187050] flex-shrink-0" />
            <span className="text-[11px] text-[#187050] font-bold leading-normal">
              Check-out berhasil! Sampai jumpa besok.
            </span>
          </div>
        )}

      </div>
    </div>
  );
}