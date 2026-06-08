import { supabase } from '../lib/supabase';

export const getFasilitas = () =>
  supabase.from('fasilitas')
    .select('*')
    .eq('is_active', true)
    .order('nama');

export const getAllFasilitas = () =>
  supabase.from('fasilitas').select('*').order('nama');

export const createFasilitas = (data) =>
  supabase.from('fasilitas').insert(data).select().single();

export const updateFasilitas = (id, data) =>
  supabase.from('fasilitas').update(data).eq('id', id);

export const toggleFasilitas = (id, isActive) =>
  supabase.from('fasilitas')
    .update({ is_active: isActive }).eq('id', id);

export const getReservasi = (filters = {}) => {
  let q = supabase.from('reservasi')
    .select(`*, fasilitas(nama, lokasi, kapasitas),
              penghuni:users(nama, no_hp)`)
    .order('created_at', { ascending: false });
  if (filters.status)       q = q.eq('status',      filters.status);
  if (filters.tanggal)      q = q.eq('tanggal',     filters.tanggal);
  if (filters.fasilitas_id) q = q.eq('fasilitas_id', filters.fasilitas_id);
  return q;
};

export const createReservasi = (data) =>
  supabase.from('reservasi').insert(data).select().single();

export const approveReservasi = (id) =>
  supabase.from('reservasi')
    .update({ status: 'disetujui' }).eq('id', id);

export const rejectReservasi = (id) =>
  supabase.from('reservasi')
    .update({ status: 'ditolak' }).eq('id', id);

export const batalkanReservasi = (id) =>
  supabase.from('reservasi')
    .update({ status: 'dibatalkan' }).eq('id', id);

export const getJadwalFasilitas = (tanggal) =>
  supabase.from('reservasi')
    .select(`*, fasilitas(nama), penghuni:users(nama)`)
    .eq('tanggal', tanggal)
    .eq('status', 'disetujui')
    .order('jam_mulai');