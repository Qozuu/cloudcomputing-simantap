import { supabase } from '../lib/supabase';

export const getUsers = (filters = {}) => {
  let q = supabase.from('users').select('*').order('nama');
  if (filters.role)      q = q.eq('role',      filters.role);
  if (filters.is_active) q = q.eq('is_active', filters.is_active);
  return q;
};

export const getPenghuni = () =>
  supabase.from('users')
    .select(`*, unit(nomor_unit, lantai, tower(nama_tower))`)
    .eq('role', 'penghuni')
    .eq('is_active', true)
    .order('nama');

export const getAdminDivisi = () =>
  supabase.from('users')
    .select('*')
    .neq('role', 'penghuni')
    .neq('role', 'super_admin')
    .order('nama');

export const getUserById = (id) =>
  supabase.from('users').select('*').eq('id', id).single();

// Buat penghuni baru + akun Supabase Auth
export const createPenghuni = async (userData) => {
  // 1. Buat auth user
  const defaultPassword = btoa(userData.email);
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email:          userData.email,
      password:       defaultPassword,
      email_confirm:  true,
    });

  if (authError) return { data: null, error: authError };

  // 2. Insert ke tabel users
  const { data, error } = await supabase.from('users')
    .insert({
      id:                   authData.user.id,
      nama:                 userData.nama,
      email:                userData.email,
      password_hash:        defaultPassword,
      role:                 'penghuni',
      no_hp:                userData.no_hp || '',
      must_change_password: false,
    })
    .select().single();

  // 3. Update status unit jika ada
  if (!error && userData.unit_id) {
    await supabase.from('unit')
      .update({ penghuni_id: authData.user.id, status: 'dihuni' })
      .eq('id', userData.unit_id);
  }

  return {
    data: { ...data, password_sementara: defaultPassword },
    error
  };
};

export const updateUser = (id, data) =>
  supabase.from('users').update(data).eq('id', id);

export const toggleUserActive = (id, isActive) =>
  supabase.from('users')
    .update({ is_active: isActive }).eq('id', id);