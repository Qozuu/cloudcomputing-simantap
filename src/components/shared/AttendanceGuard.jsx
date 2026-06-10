import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasCheckedInToday, getSession, needsAttendance } from '../../utils/authSession';

export default function AttendanceGuard({ children }) {
  const session = getSession();

  // 🎯 KUNCI ANTI-RESIDU: Jika mau logout atau sesi sudah kosong, langsung loloskan!
  const isLoggingOut = window.location.pathname === '/pilih-role' || window.location.search.includes('action=logout');
  if (isLoggingOut || !session || !session.role) {
    return children;
  }

  const { role } = session;

  // Bypass roles don't need attendance
  if (!needsAttendance(role)) return children;

  // If already checked in, allow through
  const hasCheckInTime = sessionStorage.getItem('simantap_checkin_time') || sessionStorage.length > 0;
  if (hasCheckInTime) {
    return children;
  }

  // Save current route as intended route if not already there
  const currentPath = window.location.pathname;
  if (currentPath && currentPath !== '/absensi' && currentPath !== '/login') {
    sessionStorage.setItem('simantap_intended', currentPath);
  }

  // Otherwise redirect to check-in
  return <Navigate to="/absensi" replace />;
}