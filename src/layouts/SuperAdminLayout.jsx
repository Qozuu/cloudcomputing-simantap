import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import {
  Home,
  LayoutDashboard,
  Building2,
  DoorOpen,
  Dumbbell,
  Users,
  UserCog,
  CalendarCheck,
  TrendingUp,
  BarChart2,
  ScrollText,
  Megaphone,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// 1. IMPORT LOGO ASSET BIAR SERASAI DENGAN MODUL LAINNYA
import LogoSiManTap from '../assets/logo.png';

export default function SuperAdminLayout() {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('nama, role, no_hp')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    }
    fetchProfile();
  }, []);

  const getNama = () => userProfile?.nama || 'Pengguna';
  
  const getInitials = () => {
    const nama = userProfile?.nama || '';
    return nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const getRoleLabel = () => {
    const map = {
      super_admin:        'General Manager',
      superadmin:         'General Manager',
      gm:                 'General Manager',
      admin_keuangan:     'Admin Keuangan',
      div_keuangan:       'Admin Keuangan',
      admin_pemeliharaan: 'Admin Pemeliharaan',
      div_pemeliharaan:   'Admin Pemeliharaan',
      admin_kebersihan:   'Admin Kebersihan',
      div_kebersihan:     'Admin Kebersihan',
      admin_keamanan:     'Admin Keamanan',
      div_keamanan:       'Admin Keamanan',
      admin_fasilitas:    'Admin Fasilitas',
      div_fasilitas:      'Admin Fasilitas',
      penghuni:           'Penghuni',
    };
    return map[userProfile?.role] || userProfile?.role || 'Staff';
  };

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isMobileOpen, setIsMobileOpen] = useState(false); // State pengontrol drawer mobile
  const [showLogout, setShowLogout] = useState(false);

  // Active state checker
  const isActive = (path) => currentPath === path;

  // Sidebar navigation structure
  const navigation = [
    {
      title: 'UTAMA',
      items: [
        { name: 'Homepage', path: '/super-admin', icon: Home },
        { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'PROPERTI',
      items: [
        { name: 'Data Tower/Gedung', path: '/super-admin/tower', icon: Building2 },
        { name: 'Data Unit Apartemen', path: '/super-admin/unit', icon: DoorOpen },
        { name: 'Fasilitas', path: '/super-admin/fasilitas', icon: Dumbbell }
      ]
    },
    {
      title: 'PENGGUNA',
      items: [
        { name: 'Data Penghuni', path: '/super-admin/penghuni', icon: Users },
        { name: 'Data Admin Divisi', path: '/super-admin/admin', icon: UserCog }
      ]
    },
    {
      title: 'SDM',
      items: [
        { name: 'Absen Karyawan', path: '/super-admin/absen', icon: CalendarCheck }
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { name: 'Laporan Keuangan', path: '/super-admin/laporan', icon: TrendingUp },
        { name: 'Grafik Monitoring', path: '/super-admin/grafik', icon: BarChart2 },
        { name: 'Audit Log', path: '/super-admin/audit', icon: ScrollText }
      ]
    },
    {
      title: 'INFORMASI',
      items: [
        { name: 'Pusat Informasi', path: '/super-admin/informasi', icon: Megaphone }
      ]
    }
  ];

  const getPageTitle = () => {
    for (const sec of navigation) {
      const item = sec.items.find(i => i.path === currentPath);
      if (item) return item.name;
    }
    return 'Super Admin';
  };

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      
      {/* Mobile drawer */}
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
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src={LogoSiManTap} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-[#1E1E1E] text-base">SiManTap</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {navigation.map((section, secIdx) => (
                <div key={secIdx} className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400 px-3 tracking-wider uppercase">
                    {section.title}
                  </span>
                  <div className="space-y-1 mt-1">
                    {section.items.map((item) => {
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
                          <span className="flex-1 truncate">{item.name}</span>
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
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
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

      {/* Desktop Sidebar */}
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
            {navigation.map((section, secIdx) => (
              <div key={secIdx} className="mb-4">
                <span className="sidebar-section">
                  {section.title}
                </span>
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item-link ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} />
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="sidebar-badge">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-app-bg w-full">
        
        {/* Top Bar inside main area */}
        <header className="topbar flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            
            {/* 🍔 TOMBOL HAMBURGER MENU MOBILE */}
            <button 
              className="md:hidden p-1 text-ink focus:outline-none"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex flex-col">
              <span className="topbar-role">
                {getRoleLabel()}
              </span>
              <h2 className="topbar-title">
                {getPageTitle()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Current Date */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-muted">Kamis, 28 Mei 2026</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 px-4 md:px-6 pb-8">
          <Outlet />
        </main>
      </div>
      
      {/* ========================================================================= */}
      {/* 🚪 LOGOUT CONFIRMATION MODAL CONFIGURATION (FIXED: REDIRECT KE PILIH-ROLE)*/}
      {/* ========================================================================= */}
      <LogoutModal 
        isOpen={showLogout}
        onConfirm={async () => {
          try {
            // 1. Tutup modal secara visual terlebih dahulu
            setShowLogout(false);
            
            // 2. Kirim sinyal sign out ke Supabase auth agar token hancur
            await supabase.auth.signOut();
            
            // 3. Bersihkan data penyimpanan peninggalan login di lokal browser
            localStorage.removeItem('userRole'); 
            sessionStorage.clear();
            
            // 4. Redirect paksa ke halaman pilih role
            navigate('/pilih-role'); 
            
          } catch (error) {
            console.error("Error saat mencoba keluar aplikasi:", error);
          }
        }}
        onCancel={() => setShowLogout(false)}
        userName={getNama()}
        roleName={getRoleLabel()}
      />
    </div>
  );
}