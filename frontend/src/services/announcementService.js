import { supabase } from '../lib/supabase';

export const announcementService = {
  // Get active announcements to display on dashboard
  getActiveAnnouncements: async () => {
    /* TODO: const { data } = await supabase.from('pengumuman').select('*').eq('status', 'tayang') */
    return [{ id: 1, judul: 'Water Pipe Maintenance', isi: 'Water will be temporarily shut down at 10 PM.', kategori: 'pemeliharaan', target: 'semua' }];
  },

  // Create a new announcement (by Superadmin/Admin)
  createAnnouncement: async (announcementData) => {
    /* TODO: await supabase.from('pengumuman').insert(announcementData) */
    return { success: true };
  }
};
