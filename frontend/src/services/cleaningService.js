import { supabase } from '../lib/supabase';

export const getJadwal = (filters = {}) => {
  let q = supabase.from('jadwal')
    .select(`*, petugas:users(nama)`)
    .order('tanggal');
  if (filters.jenis)   q = q.eq('jenis',   filters.jenis);
  if (filters.tanggal) q = q.eq('tanggal', filters.tanggal);
  if (filters.status)  q = q.eq('status',  filters.status);
  return q;
};

export const createJadwal = (data) =>
  supabase.from('jadwal').insert(data).select().single();

export const updateJadwal = (id, data) =>
  supabase.from('jadwal').update(data).eq('id', id);

