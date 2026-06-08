import { supabase } from '../lib/supabase';

export const getTower = () =>
  supabase.from('tower').select('*').order('nama_tower');

export const createTower = (data) =>
  supabase.from('tower').insert(data).select().single();

export const updateTower = (id, data) =>
  supabase.from('tower').update(data).eq('id', id);

export const getUnit = (filters = {}) => {
  let q = supabase.from('unit')
    .select(`*, tower(nama_tower),
              penghuni:users!penghuni_id(nama, email, no_hp)`)
    .order('nomor_unit');
  if (filters.tower_id) q = q.eq('tower_id', filters.tower_id);
  if (filters.status)   q = q.eq('status',   filters.status);
  return q;
};

export const createUnit = (data) =>
  supabase.from('unit').insert(data).select().single();

export const updateUnit = (id, data) =>
  supabase.from('unit').update(data).eq('id', id);