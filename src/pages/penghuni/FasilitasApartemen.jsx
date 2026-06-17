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
  const [idPenghuniSah, setIdPenghuniSah] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Ambil info user login & cari ID internal penghuni yang sah
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: penghuniData } = await supabase
            .from('penghuni')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (penghuniData) {
            setIdPenghuniSah(penghuniData.id);
          }
        }

        // 2. Ambil seluruh data fasilitas dari database
        const { data, error } = await supabase
          .from('fasilitas')
          .select('*')
          .order('nama');
        
        if (error) throw error;
        
        const mapped = (data || []).map(fac => {
          let defaultImage = 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800';
          if (fac.nama.toLowerCase().includes('gym') || fac.nama.toLowerCase().includes('fit')) {
            defaultImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800';
          } else if (fac.nama.toLowerCase().includes('ball') || fac.nama.toLowerCase().includes('temu') || fac.nama.toLowerCase().includes('aula')) {
            defaultImage = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800';
          }

          // Format harga tarif sesuai skema database
          const formattedPrice = fac.tarif === 0 || !fac.tarif
            ? 'Gratis'
            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fac.tarif) + '/sesi';

          const rawPrice = fac.tarif === 0 || !fac.tarif
            ? 'Gratis'
            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fac.tarif);

          return {
            id: fac.id,
            name: fac.nama,
            isActive: fac.is_active, // Menggunakan properti boolean is_active asli dari SQL Anda
            location: fac.lokasi || 'Area Apartemen',
            hours: fac.jam_operasional || '06:00 - 21:00',
            capacity: `Maks. ${fac.kapasitas || 50} orang`,
            price: formattedPrice,
            priceRaw: rawPrice,
            slots: `${fac.kapasitas || 10}/${fac.kapasitas || 10}`,
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
    if (!facility.isActive) return;
    setSelectedFacility(facility);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility || !idPenghuniSah) {
      alert('Data penghuni tidak ditemukan. Pastikan Anda terdaftar dengan benar.');
      return;
    }

    try {
      // Memisahkan string sesi waktu menjadi format baku TIME (HH:MM)
      const jamMulai = bookingTime.split(' - ')[0].trim();
      const jamSelesai = bookingTime.split(' - ')[1].trim();

      // KOREKSI UTAMA: Menyesuaikan payload insert dengan skema SQL baru Anda
      const newReservasi = {
        fasilitas_id: selectedFacility.id,
        penghuni_id: idPenghuniSah, // Menggunakan ID internal dari tabel penghuni (BUKAN user.id Auth)
        tanggal: bookingDate,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        catatan: 'Reservasi via aplikasi penghuni',
        status: 'menunggu' // Status awal wajib 'menunggu' sesuai CHECK constraint Anda
      };

      const { error } = await supabase
        .from('reservasi')
        .insert([newReservasi]);

      if (error) throw error;

      setModalOpen(false);
      setSuccessToast(`Pemesanan ${selectedFacility.name} berhasil terkirim!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Gagal melakukan reservasi:', err.message);
      alert(`Gagal membuat reservasi: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat Fasilitas SiManTap...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative text-zinc-800">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-800 font-bold flex items-start gap-2.5 shadow-sm">
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
        <p>Reservasi fasilitas akan dikonfirmasi oleh Admin Fasilitas dalam beberapa saat. Anda bisa memantau statusnya langsung melalui dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {facilities.map((fac) => {
          const isMaintenance = !fac.isActive;

          return (
            <div
              key={fac.id}
              onClick={() => !isMaintenance && handleOpenBooking(fac)}
              className={`bg-white flex flex-col justify-between overflow-hidden border rounded-2xl relative select-none
                ${!isMaintenance 
                  ? 'cursor-pointer border-zinc-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200' 
                  : 'cursor-not-allowed border-zinc-200 shadow-none'
                }
              `}
            >
              {isMaintenance && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] z-10 pointer-events-none" />
              )}

              {/* Atas: Gambar */}
              <div className="relative h-44 w-full bg-zinc-100">
                <img src={fac.image} alt={fac.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <span className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm z-20 uppercase tracking-wider ${
                  fac.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {fac.isActive ? 'Buka' : 'Maintenance'}
                </span>

                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="font-extrabold text-base leading-tight tracking-wide">{fac.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-90 mt-1">
                    <MapPin size={11} /> {fac.location}
                  </div>
                </div>
              </div>

              {/* Tengah: Rincian Informasi */}
              <div className="p-5 space-y-3 border-b border-zinc-50 text-xs font-semibold text-zinc-700 relative z-0">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock size={13} className="flex-shrink-0" />
                  <span className="text-zinc-600 font-medium">{fac.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Users size={13} className="flex-shrink-0" />
                  <span className="text-zinc-600 font-medium">{fac.capacity}</span>
                </div>
                
                <hr className="border-zinc-100" />

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Tarif Penggunaan</p>
                    <p className={`text-xs font-extrabold mt-1.5 ${fac.price === 'Gratis' ? 'text-emerald-700' : 'text-amber-700'}`}>{fac.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Ketersediaan</p>
                    <p className="text-xs font-extrabold text-zinc-900 mt-1.5">Tersedia</p>
                  </div>
                </div>
              </div>

              {/* Bawah: Tombol Trigger */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 relative z-20">
                {!isMaintenance ? (
                  <div className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm">
                    <Plus size={14} /> <span>Booking Sekarang</span>
                  </div>
                ) : (
                  <button disabled className="w-full bg-zinc-100 text-zinc-450 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed border border-dashed border-zinc-200 flex items-center justify-center gap-1.5">
                    <Ban size={13} /> <span>Fasilitas Ditutup Sementara</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL TRANSAKSI RESERVASI */}
      {modalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative z-50 animate-scale-in space-y-4 border border-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Form Booking Fasilitas</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-semibold">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-normal">Fasilitas</span>
                  <span className="text-zinc-900 font-bold">{selectedFacility.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-normal">Tarif Dasar</span>
                  <span className="text-zinc-900 font-bold">{selectedFacility.priceRaw}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Pilih Tanggal Penggunaan</label>
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Pilih Sesi Jam Operasional</label>
                <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition" >
                  <option value="08:00 - 10:00">Sesi 1: 08:00 - 10:00 WIB</option>
                  <option value="10:00 - 12:00">Sesi 2: 10:00 - 12:00 WIB</option>
                  <option value="13:00 - 15:00">Sesi 3: 13:00 - 15:00 WIB</option>
                  <option value="15:00 - 17:00">Sesi 4: 15:00 - 17:00 WIB</option>
                  <option value="18:00 - 20:00">Sesi 5: 18:00 - 20:00 WIB</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-100">
                <button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 px-4 rounded-xl font-bold transition shadow-sm text-center">
                  Konfirmasi Booking
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifikasi */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <div>
            <p className="text-xs font-extrabold">Transaksi Berhasil</p>
            <p className="text-[10px] text-zinc-400">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}