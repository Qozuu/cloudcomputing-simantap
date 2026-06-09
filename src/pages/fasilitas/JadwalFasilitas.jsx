import React from 'react';

export default function JadwalFasilitas() {
  const facilitySchedules = [
    {
      name: 'Kolam Renang',
      price: 'Gratis',
      isPaid: false,
      slots: [
        { time: '06:00-08:00', booker: 'Hendra G.' },
        { time: '08:00-10:00', booker: 'Kosong' },
        { time: '10:00-12:00', booker: 'Kosong' },
        { time: '13:00-15:00', booker: 'Hendra G.' },
        { time: '15:00-17:00', booker: 'Kosong' }
      ]
    },
    {
      name: 'Lapangan Tenis',
      price: 'Rp 75.000',
      isPaid: true,
      slots: [
        { time: '08:00-10:00', booker: 'Maya S.' },
        { time: '10:00-12:00', booker: 'Kosong' },
        { time: '13:00-15:00', booker: 'Kosong' },
        { time: '15:00-17:00', booker: 'Kosong' },
        { time: '18:00-20:00', booker: 'Maya S.' }
      ]
    },
    {
      name: 'Ruang Serbaguna',
      price: 'Rp 300.000',
      isPaid: true,
      slots: [
        { time: '08:00-12:00', booker: 'Kosong' },
        { time: '13:00-17:00', booker: 'Rudi H.' },
        { time: '18:00-22:00', booker: 'Kosong' }
      ]
    }
  ];

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
          <span>Jumat, 22 Mei 2026</span>
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
