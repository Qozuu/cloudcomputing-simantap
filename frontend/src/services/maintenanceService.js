import { supabase } from '../lib/supabase';

export const maintenanceService = {
  getTiket: async () => {
    /* TODO: await supabase.from('tiket_kerusakan').select('*, penghuni(*), units(no_unit)') */
    return [{ id: 1, kode_tiket: 'TKT-001', judul: 'AC Bocor', prioritas: 'normal', status: 'menunggu' }];
  },
  createTiket: async (tiketData) => {
    /* TODO: await supabase.from('tiket_kerusakan').insert(tiketData) */
    return { success: true };
  },
  updateStatus: async (id, status, teknisiId) => {
    /* TODO: await supabase.from('tiket_kerusakan').update({ status, teknisi_id: teknisiId }).eq('id', id) */
    return { success: true };
  }
};