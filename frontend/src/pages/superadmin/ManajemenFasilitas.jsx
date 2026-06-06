import React, { useState } from 'react';
import { Pencil, Ban, CheckCircle, Clock, MapPin, Tag, X } from 'lucide-react';

export default function ManajemenFasilitas() {
  const [facilities, setFacilities] = useState([
    { 
      id: 1, 
      name: 'Kolam Renang Olympic', 
      status: 'Buka', 
      location: 'Lantai G Tower A', 
      hours: '06:00 - 21:00', 
      capacity: 50, 
      booked: 12, 
      price: 'Gratis', 
      isPaid: false, 
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 2, 
      name: 'Fitness & Gym Center', 
      status: 'Buka', 
      location: 'Lantai 2 Tower A', 
      hours: '06:00 - 22:00', 
      capacity: 30, 
      booked: 18, 
      price: 'Gratis', 
      isPaid: false, 
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      id: 3, 
      name: 'Ruang Pertemuan / Ballroom', 
      status: 'Tutup', 
      location: 'Lantai 1 Tower C', 
      hours: '08:00 - 22:00', 
      capacity: 200, 
      booked: 0, 
      price: 'Rp 100.000/sesi', 
      isPaid: true, 
      image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800' 
    }
  ]);

  const [successToast, setSuccessToast] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const handleOpenEditModal = (facility, e) => {
    e.stopPropagation();
    setEditingFacility({ ...facility });
    setEditModalOpen(true);
  };

  const handleUpdateFacility = (e) => {
    e.preventDefault();
    setFacilities((prev) =>
      prev.map((f) => (f.id === editingFacility.id ? { 
        ...editingFacility, 
        isPaid: editingFacility.price.toLowerCase() !== 'gratis'
      } : f))
    );
    setEditModalOpen(false);
    showToast(`Data "${editingFacility.name}" berhasil diperbarui!`);
  };

  const handleToggleStatus = (id, e) => {
    e.stopPropagation();
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextStatus = f.status === 'Buka' ? 'Tutup' : 'Buka';
          showToast(`Status "${f.name}" diubah menjadi ${nextStatus}.`);
          return { ...f, status: nextStatus, booked: nextStatus === 'Tutup' ? 0 : f.booked };
        }
        return f;
      })
    );
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Manajemen Fasilitas</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Kontrol status operasional dan konfigurasi harga fasilitas hunian</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac) => {
          const isBuka = fac.status === 'Buka';
          const occupancyRate = isBuka ? (fac.booked / fac.capacity) * 100 : 0;

          return (
            <div 
              key={fac.id} 
              className={`bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm border transition-all duration-300 ${
                isBuka ? 'border-gray-100 hover:shadow-md' : 'border-red-100 bg-red-50/10 opacity-75 shadow-sm'
              }`}
            >
              {/* Top Banner Area */}
              <div className="relative h-44 w-full">
                <img src={fac.image} alt={fac.name} className={`w-full h-full object-cover ${!isBuka && 'grayscale-[40%]'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md ${
                  isBuka ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {fac.status}
                </span>

                <div className="absolute bottom-4 left-4 text-white right-4">
                  <h3 className="font-extrabold text-lg flex items-center gap-1.5 drop-shadow-sm">
                    <span className="line-clamp-1">{fac.name}</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-90 mt-0.5">
                    <MapPin size={11} className={isBuka ? "text-red-400" : "text-gray-400"} /> {fac.location}
                  </div>
                </div>
              </div>

              {/* Data Content khusus ManajemenFasilitas */}
              <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Jam Kerja</span>
                    </div>
                    <p className={`text-xs font-bold ${isBuka ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{fac.hours}</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Tag size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Tarif Sewa</span>
                    </div>
                    <p className={`text-xs font-black ${!isBuka ? 'text-gray-400 line-through' : fac.isPaid ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {fac.price}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>KAPASITAS TERISI</span>
                    <span>{isBuka ? `${fac.booked}/${fac.capacity} Unit` : '0 Unit (Tutup)'}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isBuka ? 'bg-black' : 'bg-gray-300'}`} 
                      style={{ width: `${occupancyRate}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Logika Membal & Disabled Persis KelolaFasilitasAdmin */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3 relative z-30">
                <button 
                  onClick={(e) => handleOpenEditModal(fac, e)} 
                  disabled={!isBuka}
                  className={`px-3 py-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm border transition-all text-center ${
                    isBuka 
                      ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-95 cursor-pointer' 
                      : 'bg-white border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Pencil size={12} /> Edit Detail
                </button>

                <button 
                  onClick={(e) => handleToggleStatus(fac.id, e)} 
                  className={`px-3 py-2.5 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm border transition-all active:scale-95 cursor-pointer text-center ${
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

      {/* MODAL EDIT DATA */}
      {editModalOpen && editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Edit Informasi Fasilitas</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Perbarui data operasional & ketentuan sewa</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-black transition"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateFacility} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Nama Fasilitas</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                  value={editingFacility.name} 
                  onChange={(e) => setEditingFacility({...editingFacility, name: e.target.value})} 
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Lokasi Gedung / Lantai</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                  value={editingFacility.location} 
                  onChange={(e) => setEditingFacility({...editingFacility, location: e.target.value})} 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Jam Operasional</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                    value={editingFacility.hours} 
                    onChange={(e) => setEditingFacility({...editingFacility, hours: e.target.value})} 
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Kapasitas Maksimal</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                    value={editingFacility.capacity} 
                    onChange={(e) => setEditingFacility({...editingFacility, capacity: parseInt(e.target.value) || 0})} 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Status Operasional</label>
                  <select
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition cursor-pointer"
                    value={editingFacility.status}
                    onChange={(e) => setEditingFacility({...editingFacility, status: e.target.value, booked: e.target.value === 'Tutup' ? 0 : editingFacility.booked})}
                  >
                    <option value="Buka">Buka</option>
                    <option value="Tutup">Tutup</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Tarif Sewa</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                    value={editingFacility.price} 
                    onChange={(e) => setEditingFacility({...editingFacility, price: e.target.value})} 
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button type="submit" className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black transition text-center shadow-md active:scale-95 active:translate-y-0.5">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition text-center active:scale-95">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      {successToast && (
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
}