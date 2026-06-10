import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import NotificationBell from '../components/shared/NotificationBell';
import {
  LayoutDashboard,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Building,
  CalendarCheck,
  LogOut,
  MessageSquare,
  Users,
  Menu,
  X
} from 'lucide-react';

// 1. IMPORT LOGO ASSET
import LogoSiManTap from '../assets/logo.png';

export default function KeuanganLayout() {
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
      name: 'Dashboard Keuangan',
      path: '/keuangan/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Kelola Penghuni',
      path: '/keuangan/residents',
      icon: Users
    },
    {
      name: 'Tagihan (E-Billing)',
      path: '/keuangan/billing',
      icon: Receipt,
      badge: 2
    },
    {
      name: 'Rekonsiliasi Pembayaran',
      path: '/keuangan/reconcile',
      icon: RefreshCw
    },
    {
      name: 'Laporan Pengeluaran',
      path: '/keuangan/expense',
      icon: TrendingDown
    },
    {
      name: 'Laporan Pendapatan',
      path: '/keuangan/revenue',
      icon: TrendingUp
    },
    {
      name: 'Pendapatan Fasilitas',
      path: '/keuangan/facility',
      icon: Building,
      badge: 2
    },
    {
      name: 'Absensi Karyawan',
      path: '/keuangan/absen',
      icon: CalendarCheck
    }
  ];

  const getPageTitle = () => {
    if (isActive('/keuangan/chat')) return 'CS Live Chat';
    const item = menuItems.find(i => i.path === currentPath);
    return item ? item.name : 'Keuangan';
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
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {/* Menu bagian atas sebelum CS Chat (index 0 sampai 7) */}
              {menuItems.slice(0, 7).map((item) => {
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

              {/* CS Live Chat Slot */}
              <div
                onClick={() => {
                  setIsMobileOpen(false);
                  navigate('/keuangan/chat');
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive('/keuangan/chat')
                    ? 'bg-[#111111] text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <MessageSquare size={16} />
                <span className="flex-1">CS Live Chat</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive('/keuangan/chat') ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  2
                </span>
              </div>

              {/* Menu bagian sisa setelah CS Chat (index 7 ke atas) */}
              {menuItems.slice(7).map((item) => {
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  RK
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#1E1E1E] truncate">Rina Kurnia</span>
                  <span className="text-xs text-gray-400 truncate">Admin Keuangan</span>
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
          
          {/* AREA BRANDING RAPAT KIRI PIXEL-PERFECT */}
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
            
            {/* Tombol Tutup X (Hanya Muncul di Layar HP saat Laci Terbuka) */}
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
              <span className="sidebar-section">KEUANGAN</span>
              <div className="space-y-1 mt-2">
                
                {/* Menu bagian atas sebelum CS Chat (index 0 sampai 7) */}
                {menuItems.slice(0, 7).map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
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

                {/* CS Live Chat Slot */}
                <div
                  className={`sidebar-item sidebar-item-link ${isActive('/keuangan/chat') ? 'active' : ''}`}
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate('/keuangan/chat');
                  }}
                >
                  <div className="sidebar-item-bg" />
                  <MessageSquare size={16} />
                  <span>CS Live Chat</span>
                  <span className="sidebar-badge">2</span>
                </div>

                {/* Menu bagian sisa setelah CS Chat (index 7 ke atas) */}
                {menuItems.slice(7).map((item) => {
                  const active = isActive(item.path);
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
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
              <div className="sidebar-user-avatar">RK</div>
              <div className="sidebar-profile-info">
                <span className="sidebar-profile-name">Rina Kurnia</span>
                <span className="sidebar-profile-role">Admin Keuangan</span>
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
            
            {/* 🍔 TOMBOL HAMBURGER MENU MOBILE (Hilang otomatis di desktop) */}
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="md:hidden p-1 text-ink focus:outline-none"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex flex-col">
              <span className="topbar-role">Admin Keuangan</span>
              <h2 className="topbar-title">{getPageTitle()}</h2>
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
          sessionStorage.clear();
          navigate('/login');
        }}
        onCancel={() => setShowLogout(false)}
        userName="Rina Kurnia"
        roleName="Admin Keuangan"
      />
    </div>
  );
}