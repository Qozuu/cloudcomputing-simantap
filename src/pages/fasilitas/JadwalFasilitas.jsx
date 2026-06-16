import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function JadwalFasilitas() {
  const [facilitySchedules, setFacilitySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTodayDateStr = () => {
    return new Date().toISOString().split('T')[0];
  };

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
        const { data, error } = await supabase
          .from('reservasi')
          .select('*, fasilitas(nama), penghuni:users(nama)')
          .eq('status', 'disetujui')
          .eq('tanggal', todayStr)
          .order('jam_mulai');

        if (error) throw error;

        const templates = [
          { name: 'Kolam Renang', price: 'Gratis', isPaid: false, slotTimes: ['06:00-08:00', '08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'] },
          { name: 'Lapangan Tenis', price: 'Rp 75.000', isPaid: true, slotTimes: ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00', '18:00-20:00'] },
          { name: 'Ruang Serbaguna', price: 'Rp 300.000', isPaid: true, slotTimes: ['08:00-12:00', '13:00-17:00', '18:00-22:00'] }
        ];

        const mapped = templates.map(fac => {
          const slots = fac.slotTimes.map(time => {
            const [start, end] = time.split('-');
            const rsv = data?.find(r => {
              const facName = r.fasilitas?.nama || '';
              if (!facName.toLowerCase().includes(fac.name.toLowerCase())) return false;
              
              const rStart = (r.jam_mulai || '').substring(0, 5);
              const rEnd = (r.jam_selesai || '').substring(0, 5);
              return rStart === start && rEnd === end;
            });
            return {
              time,
              booker: rsv ? (rsv.penghuni?.nama || 'Terisi') : 'Kosong'
            };
          });

          return {
            name: fac.name,
            price: fac.price,
            isPaid: fac.isPaid,
            slots
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

      {/* 3-Column Schedule Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {facilitySchedules.map((facility, fIdx) => (
          <div 
            key={fIdx} 
            className="card-section flex flex-col hover:translate-y-[-2px] transition duration-200"
          >
            {/* Facility Header */}
            <div className="card-section-header bg-[#FAF6F0]/30">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider">{facility.name}</h2>
              <span className={`badge-base ${
                facility.isPaid ? 'badge-yellow' : 'badge-lavender'
              }`}>
                {facility.price}
              </span>
            </div>

            {/* Time Slot List */}
            <div className="p-5 flex-1 divide-y divide-soft space-y-3">
              {facility.slots.map((slot, sIdx) => {
                const isBooked = slot.booker !== 'Kosong';
                return (
                  <div 
                    key={sIdx} 
                    className={`flex items-center justify-between py-3.5 px-3 rounded-2xl transition duration-150 ${
                      isBooked ? 'bg-[#FAF6F0] border border-soft' : 'bg-transparent'
                    }`}
                  >
                    {/* Time Range */}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-mono font-bold text-ink">
                        {slot.time}
                      </span>
                    </div>

                    {/* Booking badge status */}
                    <div>
                      {isBooked ? (
                        <span className="badge-base badge-dark">
                          {slot.booker}
                        </span>
                      ) : (
                        <span className="badge-base badge-gray">
                          Kosong
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer detail */}
            <div className="bg-[#FAF6F0] p-4 border-t border-soft text-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                Total {facility.slots.filter(s => s.booker !== 'Kosong').length} Sesi Terisi
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
