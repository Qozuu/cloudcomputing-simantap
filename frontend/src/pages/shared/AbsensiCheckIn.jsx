import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, LogIn, LogOut, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { APARTMENT_CONFIG } from '../../constants/absensi';
import { getDistanceMeters, getCurrentPosition } from '../../utils/geolocation';
import { SESSION_KEYS, getSession, hasCheckedInToday, getLocalDateString } from '../../utils/authSession';

export default function AbsensiCheckIn() {
  const navigate = useNavigate();
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | success | error
  const [gpsDistance, setGpsDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [jamMasuk, setJamMasuk] = useState('--:--');
  const [jamKeluar, setJamKeluar] = useState('--:--');
  const [clock, setClock] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Determine active profile details based on sessionStorage role
  const [profile, setProfile] = useState({
    name: 'Rina Kurnia',
    roleName: 'Divisi Keuangan',
    initials: 'RK',
    dashboardPath: '/keuangan/dashboard',
    bg: '#FEF7EC',
    color: '#A05820'
  });

  useEffect(() => {
    // Resolve logged role
    const { role } = getSession();
    const activeRole = (role || 'KEUANGAN').toUpperCase();
    const profileMap = {
      'SUPER_ADMIN': { name: 'Budi Santoso', roleName: 'General Manager', initials: 'BS', dashboardPath: '/super-admin/dashboard', bg: '#FEF0EE', color: '#C05040' },
      'SUPERADMIN': { name: 'Budi Santoso', roleName: 'General Manager', initials: 'BS', dashboardPath: '/super-admin/dashboard', bg: '#FEF0EE', color: '#C05040' },
      'GM': { name: 'Budi Santoso', roleName: 'General Manager', initials: 'BS', dashboardPath: '/super-admin/dashboard', bg: '#FEF0EE', color: '#C05040' },
      'KEUANGAN': { name: 'Rina Kurnia', roleName: 'Divisi Keuangan', initials: 'RK', dashboardPath: '/keuangan/dashboard', bg: '#FEF7EC', color: '#A05820' },
      'PEMELIHARAAN': { name: 'Reza Pratama', roleName: 'Divisi Pemeliharaan', initials: 'RP', dashboardPath: '/pemeliharaan/dashboard', bg: '#EEEDFB', color: '#5850C0' },
      'KEBERSIHAN': { name: 'Siti Rahayu', roleName: 'Divisi Kebersihan', initials: 'SR', dashboardPath: '/kebersihan/jadwal', bg: '#E8FAF3', color: '#208060' },
      'KEAMANAN': { name: 'Agus Pratama', roleName: 'Divisi Keamanan', initials: 'AP', dashboardPath: '/keamanan/dashboard', bg: '#FEF0EE', color: '#C05040' },
      'FASILITAS': { name: 'Reza Pratama', roleName: 'Divisi Fasilitas', initials: 'RP', dashboardPath: '/fasilitas/dashboard', bg: '#FEF7EC', color: '#A05820' }
    };

    if (profileMap[activeRole]) {
      setProfile(profileMap[activeRole]);
    }

    // Recover sessions if exist using authSession helpers
    const { checkinTime, checkoutTime } = getSession();
    const hasCheckedIn = hasCheckedInToday();
    const hasCheckedOut = !!checkoutTime;

    if (checkinTime) setJamMasuk(checkinTime);
    if (checkoutTime) setJamKeluar(checkoutTime);
    if (hasCheckedIn) setCheckedIn(true);
    if (hasCheckedOut) setCheckedOut(true);

    // Dynamic Clock Ticks
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckIn = async (simulatedPos = null) => {
    setGpsStatus('loading');
    setErrorMessage('');
    setGpsDistance(null);

    try {
      let coords;
      if (simulatedPos) {
        coords = simulatedPos;
      } else {
        coords = await getCurrentPosition();
      }

      const distance = getDistanceMeters(
        coords.latitude,
        coords.longitude,
        APARTMENT_CONFIG.latitude,
        APARTMENT_CONFIG.longitude
      );

      const roundedDistance = Math.round(distance);
      setGpsDistance(roundedDistance);

      if (distance <= APARTMENT_CONFIG.radiusMeters) {
        setGpsStatus('success');
        const entryTime = getFormattedTime();
        setJamMasuk(entryTime);
        setCheckedIn(true);
        sessionStorage.setItem(SESSION_KEYS.CHECKIN_TIME, entryTime);
        sessionStorage.setItem(SESSION_KEYS.CHECKIN_DATE, getLocalDateString());
      } else {
        setGpsStatus('error');
        setErrorMessage(`Lokasi di luar area apartemen (${roundedDistance}m dari lokasi)`);
      }
    } catch (err) {
      setGpsStatus('error');
      setErrorMessage(err.message || 'Izin lokasi ditolak');
    }
  };

  const handleCheckOut = async (simulatedPos = null) => {
    setGpsStatus('loading');
    setErrorMessage('');
    setGpsDistance(null);

    try {
      let coords;
      if (simulatedPos) {
        coords = simulatedPos;
      } else {
        coords = await getCurrentPosition();
      }

      const distance = getDistanceMeters(
        coords.latitude,
        coords.longitude,
        APARTMENT_CONFIG.latitude,
        APARTMENT_CONFIG.longitude
      );

      const roundedDistance = Math.round(distance);
      setGpsDistance(roundedDistance);

      if (distance <= APARTMENT_CONFIG.radiusMeters) {
        setGpsStatus('success');
        const exitTime = getFormattedTime();
        setJamKeluar(exitTime);
        setCheckedOut(true);
        sessionStorage.setItem(SESSION_KEYS.CHECKOUT_TIME, exitTime);

        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/';
        }, 1500);

      } else {
        setGpsStatus('error');
        setErrorMessage(`Lokasi di luar area apartemen (${roundedDistance}m dari lokasi)`);
      }
    } catch (err) {
      setGpsStatus('error');
      setErrorMessage(err.message || 'Izin lokasi ditolak');
    }
  };

  // Simulated coordinate triggers to aid manual reviews
  const triggerSimulatedCheck = (isCheckOutFlow = false) => {
    const mockPos = {
      latitude: APARTMENT_CONFIG.latitude,
      longitude: APARTMENT_CONFIG.longitude
    };
    if (isCheckOutFlow) {
      handleCheckOut(mockPos);
    } else {
      handleCheckIn(mockPos);
    }
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

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Containment Card */}
      <div className="card-white max-w-sm w-full mx-auto animate-scale-in relative z-10 flex flex-col justify-center">
        
        {/* User Presentation */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center font-black text-xl shadow-soft"
            style={{
              backgroundColor: profile.bg,
              color: profile.color
            }}
          >
            <span>{profile.initials}</span>
          </div>
          <p className="text-sm font-medium text-[#8A857F] text-center mb-1">{currentDate}</p>
          <h4 className="text-lg font-bold text-[#1E1E1E] leading-none mt-1.5">{profile.name}</h4>
          <span className="text-xs font-semibold text-[#8A857F] leading-none mt-1 inline-block">
            {profile.roleName}
          </span>
        </div>

        {/* Check-In / Check-Out Log Summary */}
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

        {/* Live Digital Clock */}
        <div className="text-center my-4">
          <p className="font-black text-5xl tracking-tighter text-[#1E1E1E]">{clock}</p>
          <p className="text-[10px] text-[#8A857F] font-bold tracking-wider uppercase mt-1">Waktu Kehadiran Aktif</p>
        </div>

        {/* GPS Status Capsules */}
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

        {/* Action Triggers */}
        <div className="flex items-center gap-3 my-4">
          <button
            onClick={() => handleCheckIn()}
            disabled={checkedIn || checkedOut || gpsStatus === 'loading'}
            className={`btn-primary flex-1 justify-center py-3 rounded-2xl flex items-center gap-2 select-none transition-all duration-200 ${
              (checkedIn || checkedOut || gpsStatus === 'loading') ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <LogIn size={14} />
            <span>Check-In</span>
          </button>

          <button
            onClick={() => handleCheckOut()}
            disabled={!checkedIn || checkedOut || gpsStatus === 'loading'}
            className={`bg-[#FCD6A5] text-[#7A4010] font-bold rounded-2xl py-3 flex-1 justify-center flex items-center gap-2 select-none transition-all duration-200 ${
              (!checkedIn || checkedOut || gpsStatus === 'loading') ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <LogOut size={14} />
            <span>Check-Out</span>
          </button>
        </div>

        {/* GPS Error details & simulator */}
        {gpsStatus === 'error' && (
          <div className="bg-[#FEF0EE] border border-[#F9C3BA]/50 rounded-2xl p-4 space-y-3 animate-fade-up">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-[#B84030] mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] text-[#B84030] font-bold leading-normal">
                  {errorMessage.includes('ditolak') 
                    ? 'Izin lokasi ditolak. Aktifkan GPS dan izinkan akses lokasi di browser.' 
                    : `Jarak Anda: ${gpsDistance}m · Radius Maks: ${APARTMENT_CONFIG.radiusMeters}m`}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(30,30,30,0.05)] flex flex-col space-y-1">
              <p className="text-[9px] font-black text-[#8A857F] uppercase tracking-widest leading-none mb-1 text-center">
                Review Geolocation:
              </p>
              <div 
                onClick={() => triggerSimulatedCheck(checkedIn)}
                className="bg-[#FAF6F0] hover:bg-[#FEF7EC] text-[#8A857F] hover:text-[#A05820] border border-[rgba(30,30,30,0.06)] font-bold text-[10px] px-2.5 py-1.5 rounded-xl transition-all text-center cursor-pointer uppercase tracking-wider"
              >
                Simulasikan Area Apartemen
              </div>
            </div>
          </div>
        )}

        {checkedIn && !checkedOut && gpsStatus === 'success' && (
          <div className="bg-[#E8FAF3] border border-[#B5EAD7]/50 rounded-2xl p-4 flex flex-col gap-3 animate-fade-up">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-[#187050] flex-shrink-0" />
              <span className="text-[11px] text-[#187050] font-bold leading-normal">
                Check-in berhasil! Selamat bekerja.
              </span>
            </div>
            <button
              onClick={handleEnterApp}
              className="btn-primary w-full justify-center py-2.5 rounded-xl text-xs"
            >
              Masuk Aplikasi
            </button>
          </div>
        )}

        {checkedOut && (
          <div className="bg-[#E8FAF3] border border-[#B5EAD7]/50 rounded-2xl p-4 flex items-center gap-3 animate-fade-up">
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