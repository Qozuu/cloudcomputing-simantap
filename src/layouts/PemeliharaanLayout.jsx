import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import NotificationBell from '../components/shared/NotificationBell';
import { Menu, X } from 'lucide-react';

// 1. IMPORT LOGO ASSET BIAR SERAGAM
import LogoSiManTap from '../assets/logo.png';

export default function PemeliharaanLayout() {
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
      name: 'Dashboard Tiket',
      path: '/pemeliharaan/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: 'Tiket Kerusakan',
      path: '/pemeliharaan/tiket',
      badge: 8,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      name: 'Riwayat Perbaikan',
      path: '/pemeliharaan/riwayat',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      name: 'CS Live Chat',
      path: '/pemeliharaan/chat',
      badge: 3,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: 'Absensi Teknisi',
      path: '/pemeliharaan/absensi',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Map route path to human-readable page title
  const getPageTitle = () => {
    const item = menuItems.find(i => i.path === currentPath);
    return item ? item.name : 'Pemeliharaan';
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
              {menuItems.map((item) => {
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  DP
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#1E1E1E] truncate">Doni Prasetya</span>
                  <span className="text-xs text-gray-400 truncate">Admin Pemeliharaan</span>
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
          
          {/* AREA BRANDING: Standar pixel-perfect rapat kiri */}
          <div className="sidebar-branding flex items-center justify-between md:justify-start gap-1 pl-1 pr-4 md:pr-0 select-none">
            <div className="flex items-center gap-1">
              {/* LOGO ASSET DENGAN SHADOW GLOW TEBAL */}
              <img 
                src={LogoSiManTap} 
                alt="Logo SiManTap" 
                className="w-10 h-10 aspect-square object-contain shrink-0 filter drop-shadow-[0_4px_8px_rgba(30,58,138,0.38)]"
              />
              {/* TEKS DENGAN TRACKING TIGHTER YANG SOLID */}
              <span className="sidebar-brand-name font-bold text-[#1E1E1E] tracking-tighter text-lg ml-0.5 whitespace-nowrap">
                SiManTap
              </span>
            </div>
            
            {/* Tombol Tutup X (Hanya muncul di Mobile saat drawer terbuka) */}
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
              <span className="sidebar-section">
                PEMELIHARAAN
              </span>
              <div className="space-y-1 mt-2">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)} // Otomatis tutup laci setelah klik menu di HP
                      className={`sidebar-item-link ${active ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
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
          </nav>

          {/* Footer Profile Area */}
          <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3 p-4 md:p-0">
            <div className="sidebar-profile-footer">
              <div className="sidebar-user-avatar">DP</div>
              <div className="sidebar-profile-info">
                <span className="sidebar-profile-name">Doni Prasetya</span>
                <span className="sidebar-profile-role">Admin Pemeliharaan</span>
              </div>
            </div>
            <div
              onClick={() => setShowLogout(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-soft hover:bg-white rounded-xl text-xs font-semibold text-muted hover:text-ink transition-all duration-200 cursor-pointer select-none mb-2"
            >
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content Area - Scrollable */}
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
              <span className="topbar-role">
                Admin Pemeliharaan
              </span>
              <h2 className="topbar-title">
                {getPageTitle()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {/* Current Date */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-muted">Rabu, 20 Mei 2026</span>
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
        userName="Doni Prasetya"
        roleName="Admin Pemeliharaan"
      />
    </div>
  );
}