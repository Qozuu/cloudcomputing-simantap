import { supabase } from '../lib/supabase';

const getToday = () => new Date().toISOString().split('T')[0];
const getTime  = () => new Date().toTimeString().slice(0, 5);

export const checkIn = async (lokasi = '') => {
  const { data: { user } } = await supabase.auth.getUser();

  // Insert row absensi baru
  const { data, error } = await supabase.from('absensi')
    .insert({
      karyawan_id: user.id,
      tanggal:     getToday(),
      jam_masuk:   getTime(),
      status:      'hadir',
      lokasi,
    })
    .select().single();

  return { data, error };
};

export const checkOut = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('absensi')
    .update({ jam_keluar: getTime() })
    .eq('karyawan_id', user.id)
    .eq('tanggal', getToday())
    .is('jam_keluar', null) 
    .select().single();

  return { data, error };
};

export const getAbsensiHariIni = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return supabase.from('absensi')
    .select('*')
    .eq('karyawan_id', user.id)
    .eq('tanggal', getToday())
    .maybeSingle();
};

export const getAbsensiByTanggal = (tanggal) =>
  supabase.from('absensi')
    .select(`*, karyawan:users(nama, role)`)
    .eq('tanggal', tanggal)
    .order('created_at');

export const getAbsensiBulan = (bulan, tahun) => {
  const start = new Date(tahun, bulan - 1, 1).toISOString().split('T')[0];
  const end   = new Date(tahun, bulan, 0).toISOString().split('T')[0]; // last day
  return supabase.from('absensi')
    .select(`*, karyawan:users(nama, role)`)
    .gte('tanggal', start)
    .lte('tanggal', end)
    .order('tanggal');
};

export const inputAbsensiManual = (data) =>
  supabase.from('absensi').insert(data).select().single();

export const updateAbsensi = (id, data) =>
  supabase.from('absensi').update(data).eq('id', id);