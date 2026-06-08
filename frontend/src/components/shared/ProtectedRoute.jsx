import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role, loading } = useAuthContext();

  if (loading) return null; // Tunggu sampai status loading auth selesai

  if (!role) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}