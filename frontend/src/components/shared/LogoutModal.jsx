import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getSession, needsAttendance, hasCheckedInToday } from '../../utils/authSession';

export default function LogoutModal({ isOpen, onConfirm, onCancel, userName, roleName }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    const { role } = getSession();
    if (needsAttendance(role) && hasCheckedInToday()) {
      navigate('/absensi');
      onCancel(); // Tutup modal dengan aman di layout jika harus absen dulu
    } else {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  // Helper to extract initials from the userName prop
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[rgba(30,30,30,0.3)] backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal Card Container */}
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center relative z-10 animate-scale-in border border-[rgba(30,30,30,0.05)]">
        
        {/* Hero Icon Capsule */}
        <div className="w-16 h-16 rounded-2xl bg-[#FEF0EE] mx-auto mb-5 flex items-center justify-center">
          <LogOut size={28} className="text-[#C05040]" />
        </div>

        {/* Text Elements */}
        <h3 className="text-xl font-black text-[#1E1E1E] tracking-tight">
          Keluar Sekarang?
        </h3>
        <p className="text-sm font-medium text-[#8A857F] mt-2 mb-6 leading-relaxed">
          Sesi kerja hari ini akan diakhiri.
        </p>

        {/* Profile Badge Pill */}
        <div className="bg-[#FAF6F0] rounded-2xl px-4 py-3 flex items-center gap-3 mb-6 text-left">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-[#FCD6A5] text-[#7A4010] font-black text-sm flex items-center justify-center">
            <span>{getInitials(userName)}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E1E1E] leading-snug">{userName}</p>
            <p className="text-xs font-medium text-[#8A857F] mt-0.5 leading-none">{roleName}</p>
          </div>
        </div>

        {/* Dual button setup (vertical stacked stack, gap-3) */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleConfirmClick}
            className="btn-primary w-full justify-center py-3 rounded-2xl flex items-center gap-2 select-none"
          >
            <span>Ya, Keluar</span>
          </button>

          <button 
            onClick={onCancel}
            className="btn-soft w-full justify-center py-3 rounded-2xl flex items-center justify-center select-none"
          >
            <span>Batal</span>
          </button>
        </div>

      </div>
    </div>
  );
}