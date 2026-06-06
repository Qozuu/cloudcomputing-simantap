import { supabase } from '../lib/supabase';

export const billingService = {
  getTagsIPL: async () => {
    /* TODO: await supabase.from('tagihan_ipl').select('*, units(no_unit), penghuni(nama_lengkap)') */
    return [{ id: 1, bulan: 'Juni', tahun: 2026, total: 770000, status: 'menunggu' }];
  },
  payIPL: async (id, metode, idTransaksi) => {
    /* TODO: await supabase.from('tagihan_ipl').update({ status: 'lunas', tgl_bayar: new Date(), metode_bayar: metode, id_transaksi: idTransaksi }).eq('id', id) */
    return { success: true };
  },
  getExpenses: async () => {
    /* TODO: await supabase.from('pengeluaran').select('*') */
    return [{ id: 1, tanggal: '2026-06-03', kategori: 'operasional', nominal: 1500000, status: 'selesai' }];
  },
  createExpense: async (expenseData) => {
    /* TODO: await supabase.from('pengeluaran').insert(expenseData) */
    return { success: true };
  }
};