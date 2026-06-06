import { supabase } from '../lib/supabase';

export const financeService = {
  // Get all operational expenses
  getExpenses: async () => {
    /* TODO: const { data } = await supabase.from('pengeluaran').select('*, profiles(nama_lengkap)') */
    return [{ id: 1, tanggal: '2026-06-03', kategori: 'operasional', keterangan: 'Purchased lobby lamps', nominal: 350000, status: 'selesai' }];
  },

  // Create a new expense record (by Finance/Admin division)
  createExpense: async (expenseData) => {
    /* TODO: await supabase.from('pengeluaran').insert(expenseData) */
    return { success: true };
  }
};