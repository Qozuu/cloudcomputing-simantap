import { supabase } from '../lib/supabase';

export const facilityService = {
  getFasilitas: async () => {
    /* TODO: await supabase.from('fasilitas').select('*') */
    return [{ id: 1, nama: 'Kolam Renang', lokasi: 'Lantai 5', status: 'buka', harga_sesi: 0 }];
  },
  getReservasi: async () => {
    /* TODO: await supabase.from('reservasi_fasilitas').select('*, fasilitas(nama)') */
    return [{ id: 1, kode_rsv: 'RSV-01', tanggal: '2026-06-05', status: 'menunggu', status_bayar: 'belum_bayar' }];
  },
  createReservasi: async (rsvData) => {
    /* TODO: await supabase.from('reservasi_fasilitas').insert(rsvData) */
    return { success: true };
  }
};