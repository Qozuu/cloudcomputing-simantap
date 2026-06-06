import { supabase } from '../lib/supabase';

export const authService = {
  login: async (email, password) => {
    /* TODO: await supabase.auth.signInWithPassword({ email, password }) */
    return { data: { user: { email }, profile: { role: 'super_admin' } }, error: null };
  },
  logout: async () => {
    /* TODO: await supabase.auth.signOut() */
    return { error: null };
  },
  getCurrentProfile: async (userId) => {
    /* TODO: await supabase.from('profiles').select('*').eq('id', userId).single() */
    return { id: userId, username: 'admin_simantap', nama_lengkap: 'Super Admin', role: 'super_admin' };
  }
};