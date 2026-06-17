import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import {
  Home,
  CreditCard,
  Wrench,
  Bell,
  Info,
  Building,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// 1. IMPORT LOGO ASSET
import LogoSiManTap from '../assets/logo.png';

export default function PenghuniLayout() {
  const [userProfile, setUserProfile] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  
  // 💡 DEKLARASI STATE UNTUK MOBILE DRAWER
  const [isMobileOpen, setIsMobileOpen] = useState(false); 
  const [namaUser, setNamaUser] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        // 1. Ambil data user yang sedang login dari Supabase Auth untuk mengamankan Email
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const userEmail = user.email;

        // 2. Ambil data nama, role, dan no_hp dari tabel users berdasarkan email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, nama, role, no_hp')
          .eq('email', userEmail)
          .maybeSingle();

        if (userError) throw userError;

        // 3. 🛠️ PERBAIKAN TOTAL: Kita hapus 'dimensi_luas' & 'tgl_masuk' yang bikin error database!
        // Kita hanya mengambil unit_id secara aman untuk menyambungkan ke relasi tabel unit.
        const { data: penghuniData, error: penghuniError } = await supabase
          .from('penghuni')
          .select(`
            unit_id,
            unit (
              nomor_unit,
              lantai
            )
          `)
          .eq('email', userEmail);

        if (penghuniError) {
          console.error("Gagal mengambil data relasi unit:", penghuniError.message);
        }

        // Ambil data pertama jika berbentuk array secara aman
        const profilPenghuni = Array.isArray(penghuniData) && penghuniData.length > 0 
          ? penghuniData[0] 
          : (penghuniData || null);

        // 4. Masukkan semua data gabungan ke dalam state userProfile
        if (userData) {
          setUserProfile({
            nama: userData.nama,
            role: userData.role,
            no_hp: userData.no_hp,
            // Jika relasi sukses, dia akan langsung memuat data asli, jika gagal baru memuat kata fallback
            nomor_unit: profilPenghuni?.unit?.nomor_unit || 'Belum Diatur',
            lantai: profilPenghuni?.unit?.lantai || 'Belum Diatur',
            dimensi_luas: '0', // Di-hardcode aman agar tidak merusak halaman lain yang membutuhkan properti ini
            tgl_masuk: '-'     // Di-hardcode aman agar tidak merusak halaman lain yang membutuhkan properti ini
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data profil penghuni:", error.message);
      }
    }
    fetchProfile();
  }, []);

  // Sinkronisasi dengan sessionStorage alternatif pencarian nama otomatis
  useEffect(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      
      if (value && !value.includes('@') && value.length < 30 && key.toLowerCase().includes('name')) {
        setNamaUser(value);
        break;
      }
    }
  }, []);

  const getNama = () => userProfile?.nama || namaUser || 'Penghuni';
  
  const getInitials = () => {
    const nama = getNama();
    if (!nama || nama === 'Penghuni') return 'PH';
    return nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleLabel = () => {
    const map = {
      super_admin:         'General Manager',
      superadmin:          'General Manager',
      gm:                  'General Manager',
      admin_keuangan:      'Admin Keuangan',
      div_keuangan:        'Admin Keuangan',
      admin_pemeliharaan:  'Admin Pemeliharaan',
      div_pemeliharaan:    'Admin Pemeliharaan',
      admin_kebersihan:    'Admin Kebersihan',
      div_kebersihan:      'Admin Kebersihan',
      admin_keamanan:      'Admin Keamanan',
      div_keamanan:        'Admin Keamanan',
      admin_fasilitas:     'Admin Fasilitas',
      div_fasilitas:       'Admin Fasilitas',
      penghuni:            'Penghuni',
    };
    return map[userProfile?.role] || userProfile?.role || 'Penghuni';
  };

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Active state checker
  const isActive = (path) => currentPath === path;

  // Sidebar menu items
  const menuItems = [
    {
      name: 'Beranda',
      path: '/penghuni/beranda',
      icon: Home,
      badge: 2
    },
    {
      name: 'E-Billing',
      path: '/penghuni/billing',
      icon: CreditCard
    },
    {
      name: 'Laporan Kerusakan',
      path: '/penghuni/laporan',
      icon: Wrench
    },
    {
      name: 'Pengumuman',
      path: '/penghuni/pengumuman',
      icon: Bell,
      badge: 2
    },
    {
      name: 'Pusat Informasi',
      path: '/penghuni/informasi',
      icon: Info
    },
    {
      name: 'Fasilitas',
      path: '/penghuni/fasilitas',
      icon: Building
    },
    {
      name: 'Kontak Pengelola',
      path: '/penghuni/cs',
      icon: MessageSquare,
      badge: 1
    },
    {
      name: 'Profil',
      path: '/penghuni/profil',
      icon: User
    }
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.path === currentPath);
    return item ? item.name : 'Penghuni';
  };

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 📱 MOBILE DRAWER */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[999] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-white flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Mobile Drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src={LogoSiManTap} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-[#1E1E1E] text-base">SiManTap</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Nav Items Mobile Drawer */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-[#111111] text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Mobile Drawer */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#1E1E1E] truncate">{getNama()}</span>
                  <span className="text-xs text-gray-400 truncate">{getRoleLabel()}</span>
                </div>
              </div>
              <button
                onClick={() => { setIsMobileOpen(false); setShowLogout(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={14} />
                <span>Keluar dari Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <div className="hidden md:flex md:shrink-0">
        <aside className="sidebar h-full flex flex-col bg-white">
          
          {/* AREA BRANDING */}
          <div className="sidebar-branding flex items-center justify-between md:justify-start gap-1 pl-1 pr-4 md:pr-0 select-none">
            <div className="flex items-center gap-1">
              <img 
                src={LogoSiManTap} 
                alt="Logo SiManTap" 
                className="w-10 h-10 aspect-square object-contain shrink-0 filter drop-shadow-[0_4px_8px_rgba(30,58,138,0.38)]"
              />
              <span className="sidebar-brand-name font-bold text-[#1E1E1E] tracking-tighter text-lg ml-0.5 whitespace-nowrap">
                SiManTap
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="sidebar-nav-list flex-1 overflow-y-auto py-2 px-1">
            <div>
              <span className="sidebar-section">MENU</span>
              <div className="space-y-1 mt-2">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-item-link ${active ? 'active' : ''}`}
                    >
                      <IconComponent size={16} />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="sidebar-badge">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer Profile Area */}
          <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3 p-4 md:p-0">
            <div className="sidebar-profile-footer">
              <div className="sidebar-user-avatar">{getInitials()}</div>
              <div className="sidebar-profile-info">
                <span className="sidebar-profile-name">{getNama()}</span>
                <span className="sidebar-profile-role">{getRoleLabel()}</span>
              </div>
            </div>
            <div
              onClick={() => setShowLogout(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-soft hover:bg-white rounded-xl text-xs font-semibold text-muted hover:text-ink transition-all duration-200 cursor-pointer select-none mb-2"
            >
              <LogOut size={14} className="text-muted" />
              <span>Keluar</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 📄 MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-app-bg w-full">
        
        {/* Top Bar */}
        <header className="topbar flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            
            {/* 🍔 TOMBOL HAMBURGER MENU MOBILE */}
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="md:hidden p-1 text-ink focus:outline-none"
            >
              <Menu size={24} />
            </button>

            <div className="flex flex-col">
              <span className="topbar-role">{getRoleLabel()}</span>
              <h2 className="topbar-title">{getPageTitle()}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* 🕒 TANGGAL SUDAH OTOMATIS REAL-TIME Sesuai Hari Ini */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-muted">
                {new Intl.DateTimeFormat('id-ID', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                }).format(new Date())}
              </span>
            </div>
            {/* 🔴 Komponen NotificationBell sudah dihapus dari sini */}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 px-6 pb-8">
          <Outlet context={{ userProfile }} />
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 🚪 LOGOUT MODAL CONFIGURATION */}
      {/* ========================================================================= */}
      <LogoutModal 
        isOpen={showLogout}
        onConfirm={async () => {
          setShowLogout(false);
          await supabase.auth.signOut();
          localStorage.removeItem('userRole');
          sessionStorage.clear();
          navigate('/pilih-role');
        }}
        onCancel={() => setShowLogout(false)}
        userName={getNama()}
        roleName={getRoleLabel()}
      />
    </div>
  );
}