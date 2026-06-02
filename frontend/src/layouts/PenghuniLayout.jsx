import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import NotificationBell from '../components/shared/NotificationBell';
import {
  Home,
  CreditCard,
  Wrench,
  Bell,
  Info,
  Building,
  MessageSquare,
  User,
  LogOut
} from 'lucide-react';

// 1. IMPORT LOGO ASSET BIAR SELARAS TOTAL JIRR
import LogoSiManTap from '../assets/logo.png';

export default function PenghuniLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [showLogout, setShowLogout] = useState(false);

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
      name: 'Customer Service',
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
      {/* Sidebar - Fixed Left */}
      <aside className="sidebar">
        
        {/* AREA BRANDING: Diubah pakai standar pixel-perfect rapat kiri */}
        <div className="sidebar-branding flex items-center justify-start gap-1 pl-1 select-none">
          {/* LOGO ASSET DENGAN SHADOW GLOW TEBAL */}
          <img 
            src={LogoSiManTap} 
            alt="Logo SiManTap" 
            className="w-10 h-10 aspect-square object-contain shrink-0 filter drop-shadow-[0_4px_8px_rgba(30,58,138,0.38)]"
          />
          {/* TEKS DENGAN TRACKING TIGHTER YANG SOLID */}
          <span className="sidebar-brand-name font-bold text-[#1E1E1E] tracking-tighter text-lg ml-0.5">
            SiManTap
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav-list flex-1 overflow-y-auto py-2 px-1">
          <div>
            <span className="sidebar-section">
              MENU
            </span>
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
        <div className="mt-auto pt-4 border-t border-soft flex flex-col gap-3">
          <div className="sidebar-profile-footer">
            <div className="sidebar-user-avatar">HG</div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">Hendra Gunawan</span>
              <span className="sidebar-profile-role">Penghuni — Unit 12A</span>
            </div>
          </div>
          <div
            onClick={() => setShowLogout(true)}
            className="flex items-center justify-center gap-2 py-2 px-3 border border-soft hover:bg-white rounded-xl text-xs font-semibold text-muted hover:text-ink transition-all duration-200 cursor-pointer select-none"
          >
            <LogOut size={14} className="text-muted" />
            <span>Keluar</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-app-bg">
        
        {/* Top Bar inside main area */}
        <header className="topbar">
          <div className="flex flex-col">
            <span className="topbar-role">
              Penghuni — Unit 12A
            </span>
            <h2 className="topbar-title">
              {getPageTitle()}
            </h2>
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
        <main className="flex-1 px-6 pb-8">
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
        userName="Hendra Gunawan"
        roleName="Penghuni — Unit 12A"
      />
    </div>
  );
}