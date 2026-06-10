import { supabase } from '../lib/supabase';

// tabel: informasi
// target_role: 'all' | role tertentu | 'penghuni'
export const getInformasi = (filters = {}) => {
  let q = supabase.from('informasi')
    .select(`*, pembuat:users(nama, role)`)
    .order('created_at', { ascending: false });
  if (filters.is_published !== undefined)
    q = q.eq('is_published', filters.is_published);
  if (filters.target_role && filters.target_role !== 'all')
    q = q.or(`target_role.eq.${filters.target_role},target_role.eq.all`);
  return q;
};

// Khusus penghuni: hanya yang published
export const getPengumuman = () =>
  supabase.from('informasi')
    .select(`*, pembuat:users(nama)`)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

export const createInformasi = async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  return supabase.from('informasi')
    .insert({ ...data, dibuat_oleh: user.id })
    .select().single();
};

export const updateInformasi = (id, data) =>
  supabase.from('informasi').update(data).eq('id', id);

export const publishInformasi = (id) =>
  supabase.from('informasi')
    .update({ is_published: true }).eq('id', id);

export const arsipInformasi = (id) =>
  supabase.from('informasi')
    .update({ is_published: false }).eq('id', id);

export const deleteInformasi = (id) =>
  supabase.from('informasi').delete().eq('id', id);