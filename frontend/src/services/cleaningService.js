import { supabase } from '../lib/supabase';

export const cleaningService = {
  // Get routine cleaning schedules for apartment areas
  getSchedules: async () => {
    /* TODO: const { data } = await supabase.from('jadwal_kebersihan').select('*') */
    return [{ id: 1, tanggal: '2026-06-03', area: 'Main Lobby', jam_mulai: '08:00', jam_selesai: '10:00', tim: 'Team A' }];
  },

  // Get all room cleaning requests from tenants
  getCleaningRequests: async () => {
    /* TODO: const { data } = await supabase.from('permintaan_cleaning').select('*, units(no_unit), penghuni(*)') */
    return [];
  },

  // Create a new cleaning request (from tenant dashboard)
  createRequest: async (requestData) => {
    /* TODO: await supabase.from('permintaan_cleaning').insert(requestData) */
    return { success: true };
  }
};
