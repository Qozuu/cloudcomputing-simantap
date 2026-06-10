import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const { user, role, profile, loading, logout } = useAuthContext();
  
  return {
    user,
    role,
    profile,
    loading,
    logout,
    isLoggedIn:    !!user,
    isSuperAdmin:  role === 'super_admin',
    isPenghuni:    role === 'penghuni',
    nama:          profile?.nama  || '',
    email:         profile?.email || '',
    userId:        profile?.id    || '',
    dbRole:        profile?.role  || '',
  };
}