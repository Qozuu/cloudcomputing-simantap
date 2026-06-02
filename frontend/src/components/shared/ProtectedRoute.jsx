import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // 🎯 KUNCI ANTI-RESIDU: Tolak interupsi jika arahnya ke pemilihan role
  const isBypassPage = 
    window.location.pathname === '/pilih-role' || 
    window.location.search.includes('action=logout') ||
    location.pathname === '/pilih-role';

  if (isBypassPage) {
    return children;
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}