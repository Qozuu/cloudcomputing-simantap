import { supabase } from '../lib/supabase';

export const unitService = {
  getTowers: async () => {
    /* TODO: await supabase.from('towers').select('*') */
    return [{ id: 1, nama: 'Tower Alpha', jumlah_lantai: 20, jumlah_unit: 120 }];
  },
  getUnits: async () => {
    /* TODO: await supabase.from('units').select('*, towers(nama)') */
    return [{ id: 1, no_unit: 'A-102', tower_id: 1, lantai: 1, status: 'dihuni', ipl_bulan: 770000 }];
  },
  createUnit: async (unitData) => {
    /* TODO: await supabase.from('units').insert(unitData) */
    return { success: true };
  }
};