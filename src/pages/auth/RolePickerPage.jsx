import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Wallet, Wrench, ShieldCheck, Sparkles, Building2, Home } from 'lucide-react';
// IMPORT FILE ASLI PNG (NAMA FILE SESUAI REQUEST)
import LogoSiManTap from '../../assets/logo.png';

const ROLES = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    subtitle: 'General Manager',
    icon: 'Crown',
    color: '#4840B0',      
    bgClass: 'card-lavender',
    iconBg: 'bg-[rgba(198,193,247,0.6)]',
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    subtitle: 'Admin Keuangan',
    icon: 'Wallet',
    color: '#187050',      
    bgClass: 'card-mint',
    iconBg: 'bg-[rgba(181,234,215,0.6)]',
  },
  {
    id: 'pemeliharaan',
    label: 'Pemeliharaan',
    subtitle: 'Admin Pemeliharaan',
    icon: 'Wrench',
    color: '#A05820',      
    bgClass: 'card-yellow',
    iconBg: 'bg-[rgba(252,214,165,0.6)]',
  },
  {
    id: 'keamanan',
    label: 'Keamanan',
    subtitle: 'Admin Keamanan',
    icon: 'ShieldCheck',
    color: '#4840B0',      
    bgClass: 'card-lavender',
    iconBg: 'bg-[rgba(198,193,247,0.6)]',
  },
  {
    id: 'kebersihan',
    label: 'Kebersihan',
    subtitle: 'Admin Kebersihan',
    icon: 'Sparkles',
    color: '#187050',      
    bgClass: 'card-mint',
    iconBg: 'bg-[rgba(181,234,215,0.6)]',
  },
  {
    id: 'fasilitas',
    label: 'Fasilitas',
    subtitle: 'Admin Fasilitas',
    icon: 'Building2',
    color: '#C05040',      
    bgClass: 'card-pink',
    iconBg: 'bg-[rgba(249,195,186,0.6)]',
  },
  {
    id: 'penghuni',
    label: 'Penghuni',
    subtitle: 'Resident Portal',
    icon: 'Home',
    color: '#A05820',      
    bgClass: 'card-yellow',
    iconBg: 'bg-[rgba(252,214,165,0.6)]',
  },
];

const ICON_MAP = { Crown, Wallet, Wrench, ShieldCheck, Sparkles, Building2, Home };

export default function RolePickerPage() {
  const navigate = useNavigate();

  // 🧹 SIKLUS PEMBERSIHAN DATA (DELAYED CLEAN UP)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'logout') {
      localStorage.clear();
      sessionStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center p-4 sm:p-8 font-sans select-none relative overflow-hidden">
      
      {/* Container Card */}
      <div className="max-w-4xl w-full mx-auto p-8 md:p-12 bg-white rounded-3xl shadow-soft animate-scale-in relative z-10">
        
        {/* Header Section */}
        <div className="text-center">
          {/* LOGO PNG SEGAR TANPA WADAH KOTAK HITAM */}
          <div className="flex justify-center mb-4">
            <img 
              src={LogoSiManTap} 
              alt="Logo SiManTap" 
              className="w-14 h-14 aspect-square object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)] select-none shrink-0" 
            />
          </div>
          <h2 className="text-2xl font-bold text-[#1E1E1E] tracking-tight">
            Masuk sebagai Siapa?
          </h2>
          <p className="text-sm font-medium text-[#8A857F] mt-2 max-w-md mx-auto leading-relaxed">
            Pilih portal akses yang sesuai dengan peran Anda di SiManTap.
          </p>
        </div>

        {/* Grid System for All 7 Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
          {ROLES.map((role) => {
            const IconComponent = ICON_MAP[role.icon];
            const isPenghuni = role.id === 'penghuni';
            
            return (
              <div
                key={role.id}
                onClick={() => navigate(`/login?role=${role.id}`)}
                className={`group flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer shadow-sm border border-black/[0.02] hover:scale-[1.02] hover:shadow-md transition-all duration-200 ${role.bgClass} ${
                  isPenghuni 
                    ? 'md:col-span-3 w-full justify-between p-6' 
                    : ''
                }`}
              >
                {/* Pembungkus Kiri: Ikon & Teks */}
                <div className="flex items-center gap-4 text-left">
                  {/* Inner Icon Box */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${role.iconBg}`}>
                    {IconComponent && <IconComponent size={22} style={{ color: role.color }} />}
                  </div>

                  {/* Text Wrapper */}
                  <div className="flex flex-col justify-center text-left">
                    <p className="text-sm font-black text-[#1E1E1E] tracking-tight">
                      {role.label}
                    </p>
                    <p className="text-[11px] font-bold text-[#8A857F] mt-0.5 opacity-80">
                      {role.subtitle}
                    </p>
                  </div>
                </div>

                {/* Indikator Panah Hanya untuk Penghuni di Desktop */}
                {isPenghuni && (
                  <div className="hidden md:flex items-center gap-1.5 text-[#A05820] font-black text-sm pr-2">
                    <span>Akses Portal</span>
                    <span className="text-lg transition-transform group-hover:translate-x-1 duration-200">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-[#8A857F] font-bold tracking-wide uppercase mt-8 pt-6 border-t border-gray-50">
          SiManTap Ecosystem · v2.0
        </div>

      </div>
    </div>
  );
}