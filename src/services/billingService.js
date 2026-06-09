import { supabase } from '../lib/supabase';

export const getTagihan = (filters = {}) => {
  let q = supabase.from('tagihan')
    .select(`*, unit(nomor_unit, lantai,
              tower(nama_tower)),
              penghuni:users(nama)`)
    .order('created_at', { ascending: false });
  if (filters.status)  q = q.eq('status',  filters.status);
  if (filters.jenis)   q = q.eq('jenis',   filters.jenis);
  if (filters.unit_id) q = q.eq('unit_id', filters.unit_id);
  return q;
};

export const getTagihanById = (id) =>
  supabase.from('tagihan')
    .select(`*, unit(nomor_unit, tower(nama_tower)), penghuni:users(nama)`)
    .eq('id', id).single();

export const createTagihan = (data) =>
  supabase.from('tagihan').insert(data).select().single();

export const konfirmasiBayar = (id, buktiUrl = '') =>
  supabase.from('tagihan')
    .update({ status: 'sudah_bayar', bukti_bayar_url: buktiUrl })
    .eq('id', id);

export const getTagihanFasilitas = (filters = {}) => {
  let q = supabase.from('tagihan_fasilitas')
    .select(`*, reservasi(tanggal, jam_mulai, jam_selesai,
              fasilitas(nama)),
              penghuni:users(nama)`)
    .order('created_at', { ascending: false });
  if (filters.status) q = q.eq('status', filters.status);
  return q;
};

export const konfirmasiFasilitas = (id) =>
  supabase.from('tagihan_fasilitas')
    .update({ status: 'sudah_bayar' })
    .eq('id', id);