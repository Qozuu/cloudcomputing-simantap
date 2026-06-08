import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ROLE_MAP_REVERSE } from '../utils/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil session saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    // 2. Pantau perubahan status auth (login/logout) secara realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile(session.user);
        } else {
          setUser(null); 
          setRole(null);
          setProfile(null); 
          setLoading(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  // Fungsi untuk mengambil data detail user dari tabel 'users' di database
  async function fetchProfile(authUser) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUser(authUser);
      setProfile(data);
      // Memetakan role dari DB ke format role frontend
      setRole(ROLE_MAP_REVERSE[data?.role] || data?.role);
    } catch (err) {
      console.error("Gagal memuat profil pengguna:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); 
    setRole(null); 
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);