import React, { useState, useEffect } from 'react';
import { Ban, CheckCircle, Clock, MapPin, Tag, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

export default function ManajemenFasilitas() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState('');

  // 1. AMBIL DATA REAL-TIME DARI SUPABASE
  const loadFacilities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fasilitas')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted = data.map((f) => {
          // STANDARISASI STATUS: Memastikan string mengikuti standar database ('Buka' / 'Tutup')
          let statusFinal = 'Buka';
          
          if (f.status) {
            const sText = f.status.toString().trim().toLowerCase();
            if (sText === 'tutup' || sText === 'close') {
              statusFinal = 'Tutup';
            } else if (sText === 'maintenance' || sText === 'perbaikan') {
              statusFinal = 'Maintenance';
            }
          } else if (f.is_active === false) {
            statusFinal = 'Tutup';
          }

          // Penyesuaian tarif rasional jika isi DB kosong / "Gratis"
          let hargaTeks = f.deskripsi;
          if (!hargaTeks || hargaTeks.trim() === '' || hargaTeks.toLowerCase() === 'gratis') {
            if (f.nama.toLowerCase().includes('gym') || f.nama.toLowerCase().includes('fitness')) {
              hargaTeks = 'Rp 25.000 / sesi';
            } else if (f.nama.toLowerCase().includes('pertemuan') || f.nama.toLowerCase().includes('ballroom')) {
              hargaTeks = 'Rp 100.000 / sesi';
            } else {
              hargaTeks = 'Gratis';
            }
          }

          // Atur data jam kerja visual
          let jamKerja = '06:00 - 21:00';
          if (f.nama.toLowerCase().includes('gym') || f.nama.toLowerCase().includes('fitness')) {
            jamKerja = '06:00 - 22:00';
          } else if (f.nama.toLowerCase().includes('pertemuan') || f.nama.toLowerCase().includes('ballroom')) {
            jamKerja = '08:00 - 22:00';
          }

          return {
            id: f.id,
            name: f.nama,
            status: statusFinal, 
            location: f.lokasi || 'Tidak Diketahui',
            hours: jamKerja,
            capacity: f.kapasitas || 1,
            booked: statusFinal === 'Tutup' ? 0 : (f.nama.toLowerCase().includes('gym') ? 18 : 0), 
            price: hargaTeks,
            isPaid: hargaTeks.toLowerCase() !== 'gratis',
            image: f.foto_url || 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800'
          };
        });
        setFacilities(formatted);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  // 2. TOGGLE STATUS OPERASIONAL (LANGSUNG UPDATE DB DENGAN CHECK CONSTRAINT)
  const handleToggleStatus = async (id, currentStatus, e) => {
    e.stopPropagation();
    
    // Memastikan text status dikirim dengan huruf kapital awal sesuai Aturan CHECK DB
    const nextStatus = currentStatus === 'Buka' ? 'Tutup' : 'Buka';
    const nextIsActive = nextStatus === 'Buka';

    try {
      // Jalankan update ke table fasilitas
      const { data, error } = await supabase
        .from('fasilitas')
        .update({
          status: nextStatus,       // Mengirim string 'Buka' atau 'Tutup'
          is_active: nextIsActive   // Mengirim boolean true atau false
        })
        .eq('id', id)
        .select();                  // Meminta database mengembalikan baris data yang diubah

      if (error) throw error;

      // Proteksi jika query berhasil tapi RLS memblokir baris data yang di-update
      if (!data || data.length === 0) {
        alert('Gagal Mengubah: Data di database tidak berubah. Periksa kembali pengaturan RLS UPDATE Policy Anda di Dashboard Supabase!');
        return;
      }

      showToast(`Fasilitas berhasil diubah menjadi ${nextStatus}.`);
      
      // Ambil ulang data terupdate dari Supabase agar visual langsung berubah seketika
      await loadFacilities(); 
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
      alert(`⚠️ ERROR SUPABASE:\n${err.message || 'Gagal terhubung ke database.'}`);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative p-4 bg-gray-50/50 min-h-screen">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Manajemen Fasilitas</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Kontrol status operasional dan pengawasan kapasitas hunian</p>
        </div>
        <button 
          onClick={loadFacilities} 
          className="p-2 border border-gray-200 text-gray-500 hover:text-black rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-gray-400 font-bold p-10">Sinkronisasi database...</p>
      ) : (
        /* Grid Layout Kartu Fasilitas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => {
            const isBuka = fac.status === 'Buka';
            const occupancyRate = isBuka ? (fac.booked / fac.capacity) * 100 : 0;

            return (
              <div 
                key={fac.id} 
                className={`rounded-2xl flex flex-col overflow-hidden border transition-all duration-300 relative shadow-sm ${
                  isBuka 
                    ? 'bg-white border-gray-100' 
                    : 'bg-gray-100/80 border-gray-300 opacity-75' 
                }`}
              >
                {/* Image Banner Area */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img 
                    src={fac.image} 
                    alt={fac.name} 
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      !isBuka ? 'grayscale contrast-125 brightness-75' : '' 
                    }`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badge Status */}
                  <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase z-20 ${
                    isBuka ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {fac.status}
                  </span>

                  <div className="absolute bottom-4 left-4 text-white right-4 z-20">
                    <h3 className={`font-extrabold text-lg flex items-center gap-1.5 ${!isBuka ? 'text-gray-300' : ''}`}>
                      <span className="line-clamp-1">{fac.name}</span>
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-90 mt-0.5">
                      <MapPin size={11} className="text-gray-400" /> {fac.location}
                    </div>
                  </div>
                </div>

                {/* Info Text Content */}
                <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Jam Kerja</span>
                      </div>
                      <p className={`text-xs font-bold ${isBuka ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{fac.hours}</p>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Tag size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tarif Sewa</span>
                      </div>
                      <p className={`text-xs font-black ${
                        !isBuka ? 'text-gray-400 line-through' : fac.isPaid ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {fac.price}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Kapasitas */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                      <span>KAPASITAS TERISI</span>
                      <span>{isBuka ? `${fac.booked}/${fac.capacity} Unit` : '0 Unit (Tutup)'}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isBuka ? 'bg-black' : 'bg-gray-400'}`} 
                        style={{ width: `${occupancyRate}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Tunggal Tanpa Tombol Edit Detail */}
                <div className={`p-4 border-t border-gray-100 ${isBuka ? 'bg-gray-50/50' : 'bg-gray-200/40'}`}>
                  <button 
                    onClick={(e) => handleToggleStatus(fac.id, fac.status, e)} 
                    className={`w-full py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-sm border transition-all active:scale-95 cursor-pointer text-center ${
                      isBuka 
                        ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50' 
                        : 'bg-black text-white border-black hover:bg-gray-800' 
                    }`}
                  >
                    <Ban size={12} /> {isBuka ? 'Set Tutup' : 'Set Buka'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Toast Pop-up */}
      {successToast && (
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
}