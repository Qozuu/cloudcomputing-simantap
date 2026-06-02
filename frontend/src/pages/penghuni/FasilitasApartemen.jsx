import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

export default function FasilitasApartemen() {
  const [successToast, setSuccessToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('08:00 - 10:00');

  const [facilities, setFacilities] = useState([
    {
      id: 1,
      name: 'Kolam Renang',
      status: 'Buka',
      location: 'Lantai G Tower A',
      hours: '06:00-21:00',
      capacity: 'Maks. 50 orang',
      price: 'Gratis',
      priceRaw: 'Gratis',
      slots: '8/10',
      slotsLeft: 8,
      slotsTotal: 10,
      emoji: '🏊',
      bgTint: 'bg-sky-50'
    },
    {
      id: 2,
      name: 'Fitness Center',
      status: 'Buka',
      location: 'Lantai 2 Tower A',
      hours: '06:00-22:00',
      capacity: 'Maks. 30 orang',
      price: 'Gratis',
      priceRaw: 'Gratis',
      slots: '12/20',
      slotsLeft: 12,
      slotsTotal: 20,
      emoji: '🏋️',
      bgTint: 'bg-emerald-50'
    },
    {
      id: 3,
      name: 'Lapangan Tenis',
      status: 'Buka',
      location: 'Rooftop Tower B',
      hours: '07:00-20:00',
      capacity: 'Maks. 8 orang',
      price: 'Rp 75.000/sesi',
      priceRaw: 'Rp 75.000',
      slots: '4/8',
      slotsLeft: 4,
      slotsTotal: 8,
      emoji: '🎾',
      bgTint: 'bg-amber-50'
    },
    {
      id: 4,
      name: 'Game Room',
      status: 'Buka',
      location: 'Lantai 3 Tower B',
      hours: '10:00-22:00',
      capacity: 'Maks. 20 orang',
      price: 'Gratis',
      priceRaw: 'Gratis',
      slots: '6/8',
      slotsLeft: 6,
      slotsTotal: 8,
      emoji: '🎮',
      bgTint: 'bg-indigo-50'
    },
    {
      id: 5,
      name: 'Ruang Serbaguna',
      status: 'Buka',
      location: 'Lantai 1 Tower C',
      hours: '08:00-22:00',
      capacity: 'Maks. 200 orang',
      price: 'Rp 100.000/sesi',
      priceRaw: 'Rp 100.000',
      slots: '2/5',
      slotsLeft: 2,
      slotsTotal: 5,
      emoji: '🏛️',
      bgTint: 'bg-purple-50'
    },
    {
      id: 6,
      name: 'Yoga Studio',
      status: 'Maintenance',
      location: 'Lantai 4 Tower A',
      hours: '06:00-21:00',
      capacity: 'Maks. 15 orang',
      price: 'Rp 50.000/sesi',
      priceRaw: 'Rp 50.000',
      slots: '—',
      slotsLeft: 0,
      slotsTotal: 0,
      emoji: '🧘',
      bgTint: 'bg-pink-50'
    }
  ]);

  const handleOpenBooking = (facility) => {
    setSelectedFacility(facility);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingDate) return;

    // Deduct slot in local state
    setFacilities(prev =>
      prev.map(f => {
        if (f.id === selectedFacility.id && f.slotsLeft > 0) {
          const nextSlotsLeft = f.slotsLeft - 1;
          return {
            ...f,
            slotsLeft: nextSlotsLeft,
            slots: `${nextSlotsLeft}/${f.slotsTotal}`
          };
        }
        return f;
      })
    );

    setModalOpen(false);
    setSuccessToast(`Pemesanan ${selectedFacility.name} berhasil terkirim! Menunggu persetujuan admin.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Info Banner Top */}
      <div className="bg-[#FEF7EC] border border-soft rounded-2xl px-4 py-3 text-xs text-[#B06020] font-bold flex items-start gap-2.5 shadow-softer">
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-[#B06020]" />
        <p>
          Reservasi fasilitas akan dikonfirmasi Admin Fasilitas dalam 1-2 jam. Cek status di Beranda.
        </p>
      </div>

      {/* 3x2 Grid of Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="card-section flex flex-col justify-between hover:shadow-soft hover:border-soft transition-all duration-200"
          >
            {/* Header / Banner area */}
            <div className="p-5 border-b border-soft flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${fac.bgTint} flex items-center justify-center text-xl shadow-inner`}>
                  {fac.emoji}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink leading-snug">{fac.name}</h4>
                  <span className="text-[10px] text-muted font-bold block mt-0.5">{fac.location}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`badge-base leading-none ${
                fac.status === 'Buka' ? 'badge-mint' : 'badge-pink'
              }`}>
                {fac.status}
              </span>
            </div>

            {/* Info details */}
            <div className="p-5 space-y-3 border-b border-soft text-xs font-semibold text-ink">
              <div className="flex items-center gap-2 text-muted">
                <MapPin size={13} className="text-muted flex-shrink-0" />
                <span className="truncate text-ink">{fac.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock size={13} className="text-muted flex-shrink-0" />
                <span className="text-ink">{fac.hours}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Users size={13} className="text-muted flex-shrink-0" />
                <span className="text-ink">{fac.capacity}</span>
              </div>
              
              <hr className="border-soft" />

              <div className="flex justify-between items-center pt-1.5">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest leading-none">Harga</p>
                  <p className={`text-xs font-extrabold mt-1 ${
                    fac.price === 'Gratis' ? 'text-[#187050]' : 'text-[#B06020]'
                  }`}>
                    {fac.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest leading-none">Slot Sisa</p>
                  <p className="text-xs font-extrabold text-ink mt-1">
                    {fac.slots}
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="p-4 bg-app-bg/50 border-t border-soft">
              {fac.status === 'Buka' ? (
                <button
                  onClick={() => handleOpenBooking(fac)}
                  className="btn-primary w-full justify-center text-xs"
                >
                  <Plus size={14} />
                  <span>Reservasi Sekarang</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-app-bg text-muted py-2.5 rounded-full text-xs font-bold cursor-not-allowed transition border border-soft"
                >
                  Sedang Maintenance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NEW RESERVATION MODAL */}
      {modalOpen && selectedFacility && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="modal-box max-w-sm relative z-10 animate-scale-in">
            
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Reservasi: {selectedFacility.name}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="modal-body space-y-4">
              
              {/* Info summary */}
              <div className="bg-app-bg p-4 rounded-2xl border border-soft text-xs font-semibold text-ink space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Harga Sesi</span>
                  <span className="text-ink font-bold">{selectedFacility.priceRaw}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Kapasitas Maks</span>
                  <span className="text-ink">{selectedFacility.capacity}</span>
                </div>
              </div>

              {/* Booking Date */}
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
                  Tanggal Reservasi
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="input-modern"
                />
              </div>

              {/* Sesi Waktu */}
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
                  Sesi Waktu
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="input-modern select-modern"
                >
                  <option value="08:00 - 10:00">Sesi 1: 08:00 - 10:00</option>
                  <option value="10:00 - 12:00">Sesi 2: 10:00 - 12:00</option>
                  <option value="13:00 - 15:00">Sesi 3: 13:00 - 15:00</option>
                  <option value="15:00 - 17:00">Sesi 4: 15:00 - 17:00</option>
                  <option value="18:00 - 20:00">Sesi 5: 18:00 - 20:00</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 px-4 text-xs"
                >
                  Konfirmasi Reservasi
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost text-xs border-none"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Sukses</p>
            <p className="text-[10px] opacity-90 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
