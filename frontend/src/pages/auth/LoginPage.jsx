import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check, ChevronLeft, Crown, Wallet, Wrench, ShieldCheck, Sparkles, Building2, Home } from 'lucide-react';
import { saveSession, needsAttendance } from '../../utils/authSession';
// IMPORT FILE ASLI PNG
import LogoSiManTap from '../../assets/logo.png';

const ROLE_ROUTES = {
  'super_admin':     '/superadmin/homepage',
  'gm':              '/superadmin/homepage',
  'manager':         '/superadmin/homepage',
  'keuangan':        '/keuangan/dashboard',
  'pemeliharaan':    '/pemeliharaan/dashboard',
  'kebersihan':      '/kebersihan/jadwal',
  'fasilitas':       '/fasilitas/dashboard',
  'keamanan':        '/keamanan/dashboard',
  'penghuni':        '/penghuni/beranda',
};

const ROLE_CONFIG = {
  super_admin: {
    label:       'Super Admin',
    portal:      'Login Portal General Manager',
    description: 'Akses penuh ke seluruh sistem manajemen SiManTap.',
    username:    'super.admin',
    color:       '#1C3657',
    colorLight:  '#EEF2F8',
    icon:        'Crown',
    route:       '/superadmin/homepage',
  },
  gm: {
    label:       'General Manager',
    portal:      'Login Portal General Manager',
    description: 'Akses penuh ke seluruh sistem manajemen SiManTap.',
    username:    'super.admin',
    color:       '#1C3657',
    colorLight:  '#EEF2F8',
    icon:        'Crown',
    route:       '/superadmin/homepage',
  },
  manager: {
    label:       'Manager',
    portal:      'Login Portal General Manager',
    description: 'Akses penuh ke seluruh sistem manajemen SiManTap.',
    username:    'super.admin',
    color:       '#1C3657',
    colorLight:  '#EEF2F8',
    icon:        'Crown',
    route:       '/superadmin/homepage',
  },
  keuangan: {
    label:       'Keuangan',
    portal:      'Login Portal Keuangan',
    description: 'Kelola tagihan, pembayaran, dan laporan keuangan apartemen.',
    username:    'admin.keuangan',
    color:       '#1D4ED8',
    colorLight:  '#EFF6FF',
    icon:        'Wallet',
    route:       '/keuangan/dashboard',
  },
  pemeliharaan: {
    label:       'Pemeliharaan',
    portal:      'Login Portal Pemeliharaan',
    description: 'Kelola tiket kerusakan, teknisi, dan jadwal perbaikan.',
    username:    'admin.pemeliharaan',
    color:       '#C2410C',
    colorLight:  '#FFF7ED',
    icon:        'Wrench',
    route:       '/pemeliharaan/dashboard',
  },
  keamanan: {
    label:       'Keamanan',
    portal:      'Login Portal Keamanan',
    description: 'Pantau akses tamu, parkir, dan keamanan lingkungan apartemen.',
    username:    'admin.keamanan',
    color:       '#0F766E',
    colorLight:  '#F0FDFA',
    icon:        'ShieldCheck',
    route:       '/keamanan/dashboard',
  },
  kebersihan: {
    label:       'Kebersihan',
    portal:      'Login Portal Kebersihan',
    description: 'Atur jadwal kebersihan, absensi petugas, dan permintaan cleaning.',
    username:    'admin.kebersihan',
    color:       '#7C3AED',
    colorLight:  '#F5F3FF',
    icon:        'Sparkles',
    route:       '/kebersihan/jadwal',
  },
  fasilitas: {
    label:       'Fasilitas',
    portal:      'Login Portal Fasilitas',
    description: 'Kelola reservasi, jadwal, dan tagihan fasilitas apartemen.',
    username:    'admin.fasilitas',
    color:       '#0369A1',
    colorLight:  '#F0F9FF',
    icon:        'Building2',
    route:       '/fasilitas/dashboard',
  },
  penghuni: {
    label:       'Penghuni',
    portal:      'Login Portal Penghuni',
    description: 'Akses tagihan, laporan kerusakan, dan fasilitas apartemen Anda.',
    username:    'hendra.gunawan',
    color:       '#15803D',
    colorLight:  '#F0FDF4',
    icon:        'Home',
    route:       '/penghuni/beranda',
  },
};

const ICON_MAP = { Crown, Wallet, Wrench, ShieldCheck, Sparkles, Building2, Home };

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || '';
  const config = ROLE_CONFIG[roleParam] || null;

  const primaryColor = config && config.color ? config.color : '#111111';
  const secondaryColor = config && config.colorLight ? config.colorLight : '#FEF0EE';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Focus states for input glows
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    if (config) {
      setUsername(config.username);
      setPassword('demo123');
      setSelectedRole(roleParam);
    } else {
      setUsername('');
      setPassword('');
      setSelectedRole('');
    }
  }, [roleParam, config]);

  const handleLogin = () => {
    setError('');
    
    if (!username.trim() || !password) {
      setError('Username/Email dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Mock login delay (1.5 seconds)
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      // Brief checkmark transition before routing
      setTimeout(() => {
        let role = selectedRole || roleParam;
        if (!role) {
          const lowerUser = username.toLowerCase().trim();
          if (lowerUser.includes('super.admin')) {
            role = 'super_admin';
          } else if (lowerUser.includes('manager') || lowerUser.includes('gm')) {
            role = 'gm';
          } else if (lowerUser.includes('keuangan')) {
            role = 'keuangan';
          } else if (lowerUser.includes('pemeliharaan')) {
            role = 'pemeliharaan';
          } else if (lowerUser.includes('keamanan')) {
            role = 'keamanan';
          } else if (lowerUser.includes('kebersihan')) {
            role = 'kebersihan';
          } else if (lowerUser.includes('fasilitas')) {
            role = 'fasilitas';
          } else {
            role = 'penghuni';
          }
        }

        const targetRoute = config?.route || ROLE_ROUTES[role] || '/penghuni/beranda';
        
        saveSession(role, targetRoute, username);
        localStorage.setItem('userRole', role);

        if (needsAttendance(role)) {
          navigate('/absensi');
        } else {
          navigate(targetRoute);
        }
      }, 1000);

    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-[#FAF6F0] font-sans flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* LEFT DECORATIVE BLOCK - Hidden on Mobile */}
      <aside className="hidden md:flex md:w-5/12 h-full flex-col justify-between p-12 bg-[#EEEDFB] rounded-r-[3rem] shadow-sm">
        {/* Header Logo - PENYESUAIAN INDENSI KIRI & FIX GEPMAN */}
        <div className="flex items-center gap-1.5">
          <img 
            src={LogoSiManTap} 
            alt="Logo SiManTap" 
            className="w-12 h-12 aspect-square object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)] select-none shrink-0" 
          />
          <span className="text-base font-extrabold text-[#1E1E1E] uppercase tracking-wider -ml-0.5">
            SiManTap
          </span>
        </div>

        {/* Minimalist Typography */}
        <div className="my-auto">
          <h1 className="text-3xl lg:text-4xl font-black text-[#1E1E1E] tracking-tight leading-tight">
            SiManTap Portal.<br />Secure access for residents and management teams.
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A857F] mt-3">
            Grand Surabaya Apartment Ecosystem
          </p>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-[#8A857F] font-bold tracking-wide uppercase">
          © {new Date().getFullYear()} SiManTap. All rights reserved.
        </div>
      </aside>

      {/* RIGHT FORM BLOCK */}
      <main className="w-full md:w-7/12 h-full flex items-center justify-center p-6 bg-[#FAF6F0]">
        
        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-soft max-w-sm w-full p-8 flex flex-col justify-center animate-fade-up relative">
          
          {/* Mobile Branding Badge (< md) - PENYESUAIAN INDENSI KIRI & FIX GEPMAN */}
          <div className="flex md:hidden items-center gap-1.5 mb-6 justify-center">
            <img 
              src={LogoSiManTap} 
              alt="Logo SiManTap" 
              className="w-10 h-10 aspect-square object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)] select-none shrink-0" 
            />
            <span className="text-sm font-extrabold text-[#1E1E1E] uppercase tracking-wider -ml-0.5">
              SiManTap
            </span>
          </div>

          {/* Success State Overlay Card */}
          {success ? (
            <div className="text-center py-10 space-y-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 transform scale-110 transition duration-300">
                <Check size={32} strokeWidth={3} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E1E1E] uppercase tracking-wider">Login Berhasil</h3>
                <p className="text-xs text-[#8A857F] font-semibold mt-1">Mengalihkan ke dashboard operasional...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Kembali Pilih Role Button (Only when config exists) */}
              {config && (
                <div 
                  onClick={() => navigate('/pilih-role')}
                  className="text-sm font-semibold text-[#8A857F] hover:text-[#1E1E1E] cursor-pointer mb-6 inline-flex items-center gap-1.5 select-none transition-colors duration-200"
                >
                  <ChevronLeft size={16} />
                  <span>Kembali Pilih Role</span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#1E1E1E] leading-tight tracking-tight">
                  {config ? config.portal : 'Selamat datang kembali'}
                </h2>
                <p className="text-xs font-medium text-[#8A857F] mt-1">
                  {config ? config.description : 'SiManTap — Grand Surabaya Apartment'}
                </p>

                {/* Role indicator pill */}
                {config && (
                  <div 
                    className="rounded-full text-[10px] font-bold px-3 py-1 mt-3 w-max flex items-center gap-1.5 border"
                    style={{ 
                      backgroundColor: secondaryColor, 
                      color: primaryColor,
                      borderColor: `${primaryColor}25`
                    }}
                  >
                    {(() => {
                      const IconComponent = ICON_MAP[config.icon];
                      return IconComponent ? <IconComponent size={12} /> : null;
                    })()}
                    <span>{config.label}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3.5 mb-5 text-xs font-semibold text-[#C05040] bg-[#FEF0EE] border border-[#F9C3BA] rounded-xl animate-fade-up">
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-5">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E1E1E]">Username atau Email</label>
                  <input
                    type="text"
                    placeholder="Masukkan username atau email"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSelectedRole('');
                    }}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    style={usernameFocused ? {
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}18`
                    } : {}}
                    className="input-modern"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E1E1E]">Password</label>
                    <span 
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs text-[#8A857F] font-bold hover:text-[#1E1E1E] cursor-pointer"
                    >
                      Lupa password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      style={passwordFocused ? {
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}18`
                      } : {}}
                      className="input-modern pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A857F] hover:text-[#1E1E1E] transition"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  onClick={isLoading ? null : handleLogin}
                  className={`btn-primary w-full justify-center py-3.5 rounded-2xl flex items-center justify-center gap-2 select-none ${
                    isLoading ? 'opacity-50 cursor-not-allowed shadow-none' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Masuk ke Akun</span>
                  )}
                </button>
              </div>

              {/* Footer Conditional Render */}
              <div className="pt-6 mt-6 border-t border-soft text-center">
                {roleParam === 'penghuni' ? (
                  <p className="text-xs text-[#8A857F] font-semibold">
                    Belum punya akun?{' '}
                    <span 
                      onClick={() => navigate('/register')}
                      className="text-sm font-semibold text-[#1E1E1E] hover:underline cursor-pointer inline-block ml-1"
                    >
                      Daftar di sini
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#8A857F] font-medium max-w-xs mx-auto leading-relaxed">
                    Butuh akses tambahan? Silakan hubungi <span className="font-bold text-[#1E1E1E]">Super Admin Utama</span> atau IT Support manajemen.
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      </main>

    </div>
  );
}