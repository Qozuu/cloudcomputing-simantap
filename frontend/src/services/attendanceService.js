import { supabase } from '../lib/supabase';

export const attendanceService = {
  // Get attendance logs by a specific date
  getByDate: async (date) => {
    /* TODO: const { data } = await supabase.from('absensi').select('*, profiles(*)').eq('tanggal', date) */
    return [];
  },

  // Clock-in employee with GPS coordinates
  clockIn: async (userId, lat, lng) => {
    /* TODO: await supabase.from('absensi').insert({ user_id: userId, tanggal: new Date(), jam_masuk: new Date().toLocaleTimeString(), lat_masuk: lat, lng_masuk: lng }) */
    return { success: true };
  },

  // Clock-out employee
  clockOut: async (userId, todayDate) => {
    /* TODO: await supabase.from('absensi').update({ jam_keluar: new Date().toLocaleTimeString() }).match({ user_id: userId, tanggal: todayDate }) */
    return { success: true };
  }
};