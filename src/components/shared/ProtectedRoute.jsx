import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role, loading } = useAuthContext();

  if (loading) return null; 

  // 🛠️ DIALIKKAN KE PILIH ROLE JIKA BELUM LOGIN / LOGOUT
  if (!role) return <Navigate to="/pilih-role" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}