import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import NotificationBell from '../components/shared/NotificationBell';
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
      // ✨ PERUBAHAN: Menghapus item 'Aktivasi Akun' / 'Verifikasi Akun Baru' karena sudah otomatis aktif di sisi Keuangan
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
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Drawer panel — slides from left, never pushes content */}
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <aside className="sidebar h-full flex flex-col bg-white !m-0 !rounded-none border-r border-soft">
              
              {/* AREA BRANDING: Standar pixel-perfect rapat kiri */}
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
                
                {/* Tombol Tutup X (Hanya muncul saat drawer terbuka di layar HP/Tablet kecil) */}
                <button 
                  className="md:hidden p-1 rounded hover:bg-surface text-muted hover:text-ink"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X size={20} />
                </button>
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
                            onClick={() => setIsMobileOpen(false)} // Otomatis menutup drawer setelah pindah menu di HP
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
                  <div className="sidebar-user-avatar">BS</div>
                  <div className="sidebar-profile-info">
                    <span className="sidebar-profile-name">Budi Santoso</span>
                    <span className="sidebar-profile-role">General Manager</span>
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
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <aside className="sidebar h-full flex flex-col bg-white">
          
          {/* AREA BRANDING: Standar pixel-perfect rapat kiri */}
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
              <div className="sidebar-user-avatar">BS</div>
              <div className="sidebar-profile-info">
                <span className="sidebar-profile-name">Budi Santoso</span>
                <span className="sidebar-profile-role">General Manager</span>
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
                General Manager
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
            
            {/* Notification Bell */}
            <NotificationBell />
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
          sessionStorage.clear(); // FIX: Diperbaiki dari sessionSession ke sessionStorage asli browser
          navigate('/login');
        }}
        onCancel={() => setShowLogout(false)}
        userName="Budi Santoso"
        roleName="General Manager"
      />
    </div>
  );
}