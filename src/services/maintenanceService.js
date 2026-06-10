import { supabase } from '../lib/supabase';

export const getLaporan = (filters = {}) => {
  let q = supabase.from('laporan')
    .select(`*,
      pelapor:users!pelapor_id(nama),
      teknisi:users!ditugaskan_ke(nama),
      unit(nomor_unit, tower(nama_tower))`)
    .order('created_at', { ascending: false });
  if (filters.status)   q = q.eq('status',   filters.status);
  if (filters.kategori) q = q.eq('kategori', filters.kategori);
  return q;
};

export const getLaporanById = (id) =>
  supabase.from('laporan')
    .select(`*,
      pelapor:users!pelapor_id(nama, no_hp),
      teknisi:users!ditugaskan_ke(nama),
      unit(nomor_unit, lantai, tower(nama_tower))`)
    .eq('id', id).single();

export const createLaporan = (data) =>
  supabase.from('laporan').insert(data).select().single();

export const updateStatusLaporan = (id, status, catatan = '') =>
  supabase.from('laporan')
    .update({ status, catatan_teknisi: catatan,
              updated_at: new Date().toISOString() })
    .eq('id', id);

export const assignTeknisi = (id, userId) =>
  supabase.from('laporan')
    .update({ ditugaskan_ke: userId,
              updated_at: new Date().toISOString() })
    .eq('id', id);