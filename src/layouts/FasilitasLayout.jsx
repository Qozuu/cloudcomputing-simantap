import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import { Menu, X, LogOut } from 'lucide-react';

// 1. IMPORT LOGO ASSET
import LogoSiManTap from '../assets/logo.png';

export default function FasilitasLayout() {
  const [userProfile, setUserProfile] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mengambil data profil user asli dari Supabase secara realtime
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('users')
          .select('nama, role, no_hp')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      }
    }
    fetchProfile();
  }, []);

  const getNama = () => userProfile?.nama || 'Admin Fasilitas';
  
  const getInitials = () => {
    const nama = userProfile?.nama || '';
    if (!nama) return 'AF';
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
    return map[userProfile?.role] || userProfile?.role || 'Admin Fasilitas';
  };

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Active state checker
  const isActive = (path) => currentPath === path;

  // Sidebar menu items
  const menuItems = [
    {
      name: 'Dashboard Fasilitas',
      path: '/fasilitas/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Reservasi Masuk',
      path: '/fasilitas/reservasi',
      badge: 2,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
        </svg>
      )
    },
    {
      name: 'Jadwal Fasilitas',
      path: '/fasilitas/jadwal',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Kelola Fasilitas',
      path: '/fasilitas/kelola',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Tagihan Reservasi',
      path: '/fasilitas/tagihan',
      badge: 2,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 2h3m2 7H9c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2z" />
        </svg>
      )
    },
    {
      name: 'Pusat Informasi',
      path: '/fasilitas/informasi',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      )
    }
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.path === currentPath);
    return item ? item.name : 'Fasilitas';
  };

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden">
      
      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[999] md:hidden" onClick={() => setIsMobileOpen(false)}>
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

            {/* Menu Items di Mobile Drawer */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {menuItems.slice(0, 5).map((item) => {
                const active = isActive(item.path);
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
                    {item.icon}
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

              {menuItems.slice(5).map((item) => {
                const active = isActive(item.path);
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
                    {item.icon}
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

            {/* Footer Profil Mobile Drawer */}
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
          
          {/* Area Branding Desktop */}
          <div className="sidebar-branding flex items-center justify-between md:justify-start gap-1 pl-1 pr-4 md:pr-0 select-none">
            <div className="flex items-center gap-1">
              <img 
                src={LogoSiManTap} 
                alt="Logo SiManTap" 
                className="w-10 h-10 aspect-square object-contain shrink-0 filter drop-shadow-[0_4px_8px_rgba(30,58,138,0.38)]"
              />
              <span className="sidebar-brand-name font-bold text-[#1E1E1E] tracking-tighter text-lg ml-0.5">
                SiManTap
              </span>
            </div>
          </div>

          {/* Navigasi Desktop */}
          <nav className="sidebar-nav-list flex-1 overflow-y-auto py-2 px-1">
            <div>
              <span className="sidebar-section">FASILITAS</span>
              <div className="space-y-1 mt-2">
                {menuItems.slice(0, 5).map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-item-link ${active ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="sidebar-badge">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}

                {menuItems.slice(5).map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-item-link ${active ? 'active' : ''}`}
                    >
                      {item.icon}
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

          {/* Footer Profile Area Desktop */}
          <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3">
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

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-app-bg">
        {/* Top Bar inside main area */}
        <header className="topbar flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            
            {/* Tombol Hamburger Menu (Hanya Muncul di Mobile) */}
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
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-muted">Rabu, 10 Juni 2026</span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 px-4 md:px-6 pb-8">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogout}
        onConfirm={() => {
          setShowLogout(false);
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