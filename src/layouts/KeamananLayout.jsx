import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import NotificationBell from '../components/shared/NotificationBell';
import {
  LayoutDashboard,
  QrCode,
  Car,
  Megaphone,
  ClipboardList,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// 1. IMPORT LOGO ASSET
import LogoSiManTap from '../assets/logo.png';

export default function KeamananLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [showLogout, setShowLogout] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // State pengontrol drawer mobile

  // Active state checker
  const isActive = (path) => currentPath === path;

  // Sidebar menu items
  const menuItems = [
    {
      name: 'Dashboard Keamanan',
      path: '/keamanan/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Log Tamu (QR Code)',
      path: '/keamanan/tamu',
      icon: QrCode
    },
    {
      name: 'Log Parkir',
      path: '/keamanan/parkir',
      icon: Car
    },
    {
      name: 'Broadcast Pesan',
      path: '/keamanan/broadcast',
      icon: Megaphone
    },
    {
      name: 'Absensi Satpam',
      path: '/keamanan/absensi',
      icon: ClipboardList
    }
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.path === currentPath);
    return item ? item.name : 'Keamanan';
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
              
              {/* AREA BRANDING RAPAT KIRI */}
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
                
                {/* Tombol Tutup X (Hanya Muncul di Layar HP) */}
                <button 
                  onClick={() => setIsMobileOpen(false)} 
                  className="md:hidden p-1 text-muted hover:text-ink focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Section */}
              <nav className="sidebar-nav-list flex-1 overflow-y-auto py-2 px-1">
                <div>
                  <span className="sidebar-section">KEAMANAN</span>
                  <div className="space-y-1 mt-2">
                    {menuItems.map((item) => {
                      const active = isActive(item.path);
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)} // Otomatis menutup laci menu di HP setelah klik
                          className={`sidebar-item-link ${active ? 'active' : ''}`}
                        >
                          <IconComponent size={16} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>

              {/* Footer Profile Area */}
              <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3 p-4 md:p-0">
                <div className="sidebar-profile-footer">
                  <div className="sidebar-user-avatar">AW</div>
                  <div className="sidebar-profile-info">
                    <span className="sidebar-profile-name">Agus Wibowo</span>
                    <span className="sidebar-profile-role">Admin Keamanan</span>
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
          
          {/* AREA BRANDING RAPAT KIRI */}
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
            
            {/* Tombol Tutup X (Hanya Muncul di Layar HP) */}
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="md:hidden p-1 text-muted hover:text-ink focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="sidebar-nav-list flex-1 overflow-y-auto py-2 px-1">
            <div>
              <span className="sidebar-section">KEAMANAN</span>
              <div className="space-y-1 mt-2">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)} // Otomatis menutup laci menu di HP setelah klik
                      className={`sidebar-item-link ${active ? 'active' : ''}`}
                    >
                      <IconComponent size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer Profile Area */}
          <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3 p-4 md:p-0">
            <div className="sidebar-profile-footer">
              <div className="sidebar-user-avatar">AW</div>
              <div className="sidebar-profile-info">
                <span className="sidebar-profile-name">Agus Wibowo</span>
                <span className="sidebar-profile-role">Admin Keamanan</span>
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
              onClick={() => setIsMobileOpen(true)} 
              className="md:hidden p-1 text-ink focus:outline-none"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex flex-col">
              <span className="topbar-role">Admin Keamanan</span>
              <h2 className="topbar-title">{getPageTitle()}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Current Date */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-muted">Sabtu, 23 Mei 2026</span>
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
          sessionStorage.clear();
          navigate('/login');
        }}
        onCancel={() => setShowLogout(false)}
        userName="Agus Wibowo"
        roleName="Admin Keamanan"
      />
    </div>
  );
}