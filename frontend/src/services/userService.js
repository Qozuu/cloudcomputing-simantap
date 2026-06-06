import { supabase } from '../lib/supabase';

export const userService = {
  getAll: async () => {
    /* TODO: await supabase.from('penghuni').select('*, units(no_unit)') */
    return [{ id: 1, no_ktp: '3578...', email: 'penghuni@mail.com', status: 'aktif' }];
  },
  getById: async (id) => {
    /* TODO: await supabase.from('penghuni').select('*').eq('id', id).single() */
    return null;
  },
  createPenghuni: async (data) => {
    /* TODO: await supabase.from('penghuni').insert(data) */
    return { success: true };
  }
};