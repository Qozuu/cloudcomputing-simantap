import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function JadwalFasilitas() {
  const [facilitySchedules, setFacilitySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  const getTodayFormattedStr = () => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  };

  useEffect(() => {
    async function loadSchedules() {
      try {
        setLoading(true);
        const todayStr = getTodayDateStr();

        // 1. Ambil semua fasilitas dari DB
        const { data: fasilitasData, error: fasilitasError } = await supabase
          .from('fasilitas')
          .select('id, nama, status')
          .eq('is_active', true)
          .order('nama');

        if (fasilitasError) throw fasilitasError;

        // 2. Ambil semua reservasi hari ini yang disetujui
        const { data: rsvData, error: rsvError } = await supabase
          .from('reservasi')
          .select('*, fasilitas(nama), penghuni:users(nama)')
          .eq('status', 'disetujui')
          .eq('tanggal', todayStr)
          .order('jam_mulai');

        if (rsvError) throw rsvError;

        // 3. Untuk setiap fasilitas, kumpulkan slot dari reservasi yang ada
        //    (semua reservasi hari ini untuk fasilitas tsb, bukan hanya yang disetujui)
        //    Kita juga ambil semua reservasi (termasuk menunggu) untuk tampilkan slot waktu
        const { data: allRsvToday, error: allRsvError } = await supabase
          .from('reservasi')
          .select('id, fasilitas_id, jam_mulai, jam_selesai, status, tanggal, fasilitas(id, nama), penghuni:users(nama)')
          .eq('tanggal', todayStr)
          .order('jam_mulai');
        
        console.log('Detail reservasi:', JSON.stringify(allRsvToday, null, 2));
        console.log('Detail fasilitas:', JSON.stringify(fasilitasData, null, 2));
        
        if (allRsvError) throw allRsvError;

        // 4. Map setiap fasilitas dengan slot reservasinya
        const mapped = fasilitasData.map(fac => {
          // Cari semua reservasi untuk fasilitas ini hari ini
          const facReservations = (allRsvToday || []).filter(r => r.fasilitas_id === fac.id || r.fasilitas?.id === fac.id);

          // Buat slot dari reservasi yang ada
          const slots = facReservations.map(r => {
            const start = (r.jam_mulai || '').substring(0, 5);
            const end = (r.jam_selesai || '').substring(0, 5);
            const rawStatus = (r.status || '').toLowerCase();

            let statusLabel = 'Menunggu';
            let isBooked = false;
            if (rawStatus === 'disetujui') { statusLabel = r.penghuni?.nama || 'Terisi'; isBooked = true; }
            else if (rawStatus === 'ditolak') statusLabel = 'Ditolak';
            else if (rawStatus === 'dibatalkan') statusLabel = 'Dibatalkan';

            return {
              time: `${start}-${end}`,
              booker: statusLabel,
              isBooked,
              status: rawStatus,
            };
          });

          // Hitung tagihan/biaya dari tagihan_fasilitas jika ada
          return {
            id: fac.id,
            name: fac.nama,
            dbStatus: fac.status,
            slots,
          };
        });

        setFacilitySchedules(mapped);
      } catch (err) {
        console.error('Failed to load schedules:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSchedules();
  }, []);

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Date banner header */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-ink mb-1">Jadwal Fasilitas Hari Ini</h3>
          <p className="text-xs text-muted">
            Pemantauan sesi aktif penggunaan fasilitas apartemen oleh warga.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-pastel-lavender-bg rounded-full border border-pastel-lavender/30 text-xs font-bold text-[#4840B0] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pastel-lavender animate-pulse"></span>
          <span>{getTodayFormattedStr()}</span>
        </div>
      </div>

      {/* Facility Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {facilitySchedules.map((facility, fIdx) => (
          <div
            key={facility.id || fIdx}
            className="card-section flex flex-col hover:translate-y-[-2px] transition duration-200"
          >
            {/* Facility Header */}
            <div className="card-section-header bg-[#FAF6F0]/30">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider">{facility.name}</h2>
              <span className={`badge-base ${
                facility.dbStatus === 'Maintenance' ? 'badge-red' :
                facility.dbStatus === 'Tutup' ? 'badge-gray' : 'badge-mint'
              }`}>
                {facility.dbStatus}
              </span>
            </div>

            {/* Slot List */}
            <div className="p-5 flex-1 divide-y divide-soft">
              {facility.slots.length === 0 ? (
                <div className="py-8 text-center text-muted text-xs font-medium">
                  Tidak ada reservasi hari ini
                </div>
              ) : (
                facility.slots.map((slot, sIdx) => (
                  <div
                    key={sIdx}
                    className={`flex items-center justify-between py-3.5 px-3 rounded-2xl transition duration-150 ${
                      slot.isBooked ? 'bg-[#FAF6F0] border border-soft' : 'bg-transparent'
                    }`}
                  >
                    {/* Time Range */}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-mono font-bold text-ink">{slot.time}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {slot.isBooked ? (
                        <span className="badge-base badge-dark">{slot.booker}</span>
                      ) : slot.status === 'ditolak' ? (
                        <span className="badge-base badge-red">Ditolak</span>
                      ) : slot.status === 'dibatalkan' ? (
                        <span className="badge-base badge-gray">Dibatalkan</span>
                      ) : (
                        <span className="badge-base badge-yellow">Menunggu</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Card Footer */}
            <div className="bg-[#FAF6F0] p-4 border-t border-soft text-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                Total {facility.slots.filter(s => s.isBooked).length} Sesi Terisi
              </span>
            </div>
          </div>
        ))}

        {facilitySchedules.length === 0 && (
          <div className="lg:col-span-3 p-10 text-center text-muted font-medium text-sm">
            Tidak ada data fasilitas.
          </div>
        )}
      </div>
    </div>
  );
}
