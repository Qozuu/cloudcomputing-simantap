import { supabase } from '../lib/supabase';

export const securityService = {
  getVisitorLogs: async () => {
    /* TODO: await supabase.from('log_tamu').select('*') */
    return [{ id: 1, nama_tamu: 'Budi Hartono', unit_tujuan: 'B-305', status: 'di_dalam' }];
  },
  checkoutTamu: async (id) => {
    /* TODO: await supabase.from('log_tamu').update({ status: 'keluar', jam_keluar: new Date() }).eq('id', id) */
    return { success: true };
  },
  getParkingLogs: async () => {
    /* TODO: await supabase.from('log_parkir').select('*') */
    return [{ id: 1, plat_nomor: 'L 1234 AB', jenis: 'mobil', tipe: 'penghuni' }];
  },
  sendBroadcast: async (broadcastData) => {
    /* TODO: await supabase.from('broadcast_pesan').insert(broadcastData) */
    return { success: true };
  }
};