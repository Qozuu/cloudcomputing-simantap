import { supabase } from '../lib/supabase';

// VISITOR (tabel: visitor)
export const getVisitor = (filters = {}) => {
  let q = supabase.from('visitor')
    .select(`*, unit_tujuan:unit(nomor_unit,
              tower(nama_tower))`)
    .order('waktu_masuk', { ascending: false });
  if (filters.status === 'di_dalam')
    q = q.is('waktu_keluar', null);
  return q;
};

export const createVisitor = (data) =>
  supabase.from('visitor').insert(data).select().single();

export const checkoutVisitor = (id) =>
  supabase.from('visitor')
    .update({ waktu_keluar: new Date().toISOString() })
    .eq('id', id)
    .select().single();

// INCIDENT (tabel: incident)
export const getIncident = (filters = {}) => {
  let q = supabase.from('incident')
    .select(`*, pelapor:users(nama)`)
    .order('created_at', { ascending: false });
  if (filters.status) q = q.eq('status', filters.status);
  return q;
};

export const createIncident = (data) =>
  supabase.from('incident').insert(data).select().single();

export const updateIncident = (id, data) =>
  supabase.from('incident').update(data).eq('id', id);