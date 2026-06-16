import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Ban
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FasilitasApartemen() {
  const [successToast, setSuccessToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('08:00 - 10:00');
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('fasilitas')
          .select('*')
          .eq('is_active', true)
          .order('nama');
        
        if (error) throw error;
        
        const mapped = (data || []).map(fac => {
          let defaultImage = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800';
          if (fac.nama.toLowerCase().includes('gym') || fac.nama.toLowerCase().includes('fit')) {
            defaultImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800';
          } else if (fac.nama.toLowerCase().includes('ball') || fac.nama.toLowerCase().includes('temu') || fac.nama.toLowerCase().includes('aula')) {
            defaultImage = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800';
          }

          const formattedPrice = fac.tarif === 0 || !fac.tarif
            ? 'Gratis'
            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fac.tarif) + '/sesi';

          const rawPrice = fac.tarif === 0 || !fac.tarif
            ? 'Gratis'
            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fac.tarif);

          return {
            id: fac.id,
            name: fac.nama,
            status: fac.is_active ? 'Buka' : 'Maintenance',
            location: fac.lokasi || 'Area Apartemen',
            hours: fac.jam_operasional || '06:00 - 21:00',
            capacity: `Maks. ${fac.kapasitas || 50} orang`,
            price: formattedPrice,
            priceRaw: rawPrice,
            slots: `${fac.kapasitas || 10}/${fac.kapasitas || 10}`,
            slotsLeft: fac.kapasitas || 10,
            slotsTotal: fac.kapasitas || 10,
            image: fac.foto_url || defaultImage,
            raw: fac
          };
        });

        setFacilities(mapped);
      } catch (err) {
        console.error('Gagal memuat fasilitas:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenBooking = (facility) => {
    if (facility.status === 'Maintenance') return;
    setSelectedFacility(facility);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const jamMulai = bookingTime.split(' - ')[0];
      const jamSelesai = bookingTime.split(' - ')[1];

      const newReservasi = {
        fasilitas_id: selectedFacility.id,
        penghuni_id: user.id,
        tanggal: bookingDate,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        catatan: '',
        status: 'menunggu'
      };

      const { error } = await supabase
        .from('reservasi')
        .insert(newReservasi);

      if (error) throw error;

      setModalOpen(false);
      setSuccessToast(`Pemesanan ${selectedFacility.name} berhasil terkirim!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Gagal melakukan reservasi:', err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      <div className="bg-[#FEF7EC] border border-soft rounded-2xl px-4 py-3 text-xs text-[#B06020] font-bold flex items-start gap-2.5 shadow-softer">
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-[#B06020]" />
        <p>Reservasi fasilitas akan dikonfirmasi Admin Fasilitas dalam 1-2 jam. Cek status di Beranda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {facilities.map((fac) => {
          const isMaintenance = fac.status === 'Maintenance';

          return (
            <div
              key={fac.id}
              onClick={() => !isMaintenance && handleOpenBooking(fac)}
              className={`card-section !p-0 flex flex-col justify-between overflow-hidden border border-soft rounded-2xl bg-white relative select-none style-bounce
                ${!isMaintenance 
                  ? 'cursor-pointer shadow-md hover:-translate-y-1.5 hover:shadow-xl hover:border-dark/10 active:translate-y-1 active:scale-[0.94] active:shadow-sm' 
                  : 'cursor-not-allowed shadow-sm'
                }
              `}
              style={{
                transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {isMaintenance && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[0.5px] z-10 pointer-events-none" />
              )}

              {/* Atas: Gambar */}
              <div className="relative h-44 w-full bg-soft">
                <img src={fac.image} alt={fac.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <span className={`absolute top-4 right-4 badge-base font-black shadow-md z-20 ${
                  !isMaintenance ? 'bg-[#B5EAD7] text-[#187050]' : 'bg-[#F9C3BA] text-[#C05040]'
                }`}>
                  {fac.status.toUpperCase()}
                </span>

                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="font-extrabold text-base leading-tight">{fac.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-90 mt-0.5">
                    <MapPin size={11} /> {fac.location}
                  </div>
                </div>
              </div>

              {/* Tengah: Info */}
              <div className="p-5 space-y-3 border-b border-soft text-xs font-semibold text-ink relative z-0">
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
                    <p className={`text-xs font-extrabold mt-1 ${fac.price === 'Gratis' ? 'text-[#187050]' : 'text-[#B06020]'}`}>{fac.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest leading-none">Slot Sisa</p>
                    <p className="text-xs font-extrabold text-ink mt-1">{fac.slots}</p>
                  </div>
                </div>
              </div>

              {/* Bawah: Tombol Aksi */}
              <div className="p-4 bg-[#F8F7F5] border-t border-soft relative z-20">
                {!isMaintenance ? (
                  <div className="btn-primary w-full justify-center text-xs flex items-center gap-1.5 pointer-events-none">
                    <Plus size={14} /> <span>Reservasi Sekarang</span>
                  </div>
                ) : (
                  <button disabled className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed border border-dashed border-gray-200 flex items-center justify-center gap-1.5">
                    <Ban size={13} /> <span>Fasilitas Sedang Ditutup</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL RESERVASI */}
      {modalOpen && selectedFacility && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="modal-box max-w-sm relative z-50 animate-scale-in">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Reservasi: {selectedFacility.name}</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleBookingSubmit} className="modal-body space-y-4">
              <div className="bg-app-bg p-4 rounded-2xl border border-soft text-xs font-semibold text-ink space-y-1">
                <div className="flex justify-between"><span className="text-muted">Harga Sesi</span><span className="text-ink font-bold">{selectedFacility.priceRaw}</span></div>
                <div className="flex justify-between"><span className="text-muted">Kapasitas Maks</span><span className="text-ink">{selectedFacility.capacity}</span></div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Tanggal Reservasi</label>
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="input-modern" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Sesi Waktu</label>
                <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="input-modern select-modern" >
                  <option value="08:00 - 10:00">Sesi 1: 08:00 - 10:00</option>
                  <option value="10:00 - 12:00">Sesi 2: 10:00 - 12:00</option>
                  <option value="13:00 - 15:00">Sesi 3: 13:00 - 15:00</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary py-2.5 px-4 text-xs">Konfirmasi Reservasi</button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-xs border-none">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}