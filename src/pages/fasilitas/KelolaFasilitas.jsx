import React, { useState, useEffect } from 'react';
import { Plus, Edit3, EyeOff, Eye, MapPin, Clock, Info, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function KelolaFasilitasAdmin() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk kontrol Modal Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fasilitas')
        .select('*')
        .order('nama');

      if (error) throw error;

      if (data) {
        setFacilities(data.map(item => ({
          id: item.id,
          name: item.nama || '',
          location: item.lokasi || '',
          hours: item.jam_operasional || '',
          capacity: String(item.kapasitas || 0),
          price: item.harga_sewa || 'Gratis',
          status: item.is_active ? 'Buka' : 'Maintenance',
          image: item.gambar || 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800'
        })));
      }
    } catch (err) {
      console.error('Failed to load facilities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleToggleStatus = async (id, currentStatus, e) => {
    e.stopPropagation();
    try {
      const nextActive = currentStatus !== 'Buka';
      const { error } = await supabase
        .from('fasilitas')
        .update({ is_active: nextActive })
        .eq('id', id);

      if (error) throw error;
      loadFacilities();
    } catch (err) {
      console.error('Failed to toggle facility status:', err.message);
    }
  };

  // Pemicu Bukanya Modal Edit
  const handleEditDetail = (facility, e) => {
    e.stopPropagation();
    setSelectedFacility({ ...facility }); // Copy data agar input tidak langsung mengubah data asli sebelum di-save
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedFacility({
      name: '',
      location: '',
      hours: '08:00 - 22:00',
      capacity: '50',
      status: 'Buka',
      price: 'Gratis',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800'
    });
    setIsModalOpen(true);
  };

  const handleCardClick = (facility) => {
    if (facility.status === 'Maintenance') return;
  };

  // Fungsi saat form di dalam modal disubmit / simpan perubahan
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const dbPayload = {
        nama: selectedFacility.name,
        lokasi: selectedFacility.location,
        jam_operasional: selectedFacility.hours,
        kapasitas: parseInt(selectedFacility.capacity) || 0,
        harga_sewa: selectedFacility.price,
        is_active: selectedFacility.status === 'Buka',
        gambar: selectedFacility.image
      };

      if (selectedFacility.id) {
        // Edit mode
        const { error } = await supabase
          .from('fasilitas')
          .update(dbPayload)
          .eq('id', selectedFacility.id);

        if (error) throw error;
      } else {
        // Add mode
        const { error } = await supabase
          .from('fasilitas')
          .insert(dbPayload);

        if (error) throw error;
      }
      setIsModalOpen(false);
      setSelectedFacility(null);
      loadFacilities();
    } catch (err) {
      console.error('Failed to save facility:', err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Header Panel */}
      <div className="card-section p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-soft rounded-2xl">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-ink">Manajemen Kelola Fasilitas</h3>
          <p className="text-xs text-muted font-medium">Konfigurasi operasional, harga sewa, dan kuota harian gedung oleh Admin.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-ink text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto px-4 py-2.5 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:scale-95 transition-all"
        >
          <Plus size={15} /> <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Grid List Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        {facilities.map((fac) => {
          const isBuka = fac.status === 'Buka';

          return (
            <div 
              key={fac.id}
              className={`card-section !p-0 flex flex-col overflow-hidden bg-white border border-soft rounded-2xl relative select-none shadow-md transition-all duration-300
                ${isBuka ? 'hover:-translate-y-1.5 hover:shadow-xl' : 'border-dashed opacity-85 shadow-sm'}
              `}
            >
              <div 
                onClick={() => handleCardClick(fac)}
                className={`flex-1 flex flex-col ${isBuka ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Area Gambar Banner */}
                <div className="relative h-44 w-full bg-soft overflow-hidden">
                  <img src={fac.image} alt={fac.name} className="w-full h-full object-cover" />
                  
                  {!isBuka && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] z-10" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  
                  <span className={`absolute top-4 right-4 badge-base font-black shadow-md z-20 px-2.5 py-1 rounded-lg text-[10px] ${
                    isBuka ? 'bg-[#B5EAD7] text-[#187050]' : 'bg-[#F9C3BA] text-[#C05040]'
                  }`}>
                    {fac.status.toUpperCase()}
                  </span>

                  <div className="absolute bottom-4 left-4 text-white z-20">
                    <h3 className="font-bold text-lg leading-tight">{fac.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-90 mt-0.5">
                      <MapPin size={11} /> {fac.location}
                    </div>
                  </div>
                </div>

                {/* Detail Informasi */}
                <div className="p-5 flex-1 space-y-3 text-xs font-semibold text-ink relative">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock size={13} className="text-muted flex-shrink-0" />
                    <span className="text-ink">{fac.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Info size={13} className="text-muted flex-shrink-0" />
                    <span className="text-ink">Kapasitas: {fac.capacity} org</span>
                  </div>
                  <div className="pt-2 border-t border-soft">
                    <span className="block text-[9px] font-bold text-muted uppercase tracking-widest">Harga Sewa</span>
                    <p className="text-xs font-extrabold text-ink mt-0.5">{fac.price}</p>
                  </div>
                </div>
              </div>

              {/* Tombol Kontrol Bawah */}
              <div className="p-4 bg-[#F8F7F5] border-t border-soft grid grid-cols-2 gap-3 relative z-30">
                <button 
                  onClick={(e) => handleEditDetail(fac, e)}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-bold py-2.5 rounded-xl shadow-sm border bg-white border-soft text-ink hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center"
                >
                  <Edit3 size={12} /> <span>Edit Detail</span>
                </button>
                
                <button 
                  onClick={(e) => handleToggleStatus(fac.id, fac.status, e)}
                  className={`py-2.5 px-3 rounded-xl justify-center text-[11px] font-bold shadow-sm flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                    isBuka ? 'bg-white text-[#C05040] border-[#F9C3BA] hover:bg-red-50' : 'bg-[#187050] text-white border-[#187050] hover:bg-[#145d42]'
                  }`}
                >
                  {isBuka ? (
                    <>
                      <EyeOff size={12} /> <span>Set Maint</span>
                    </>
                  ) : (
                    <>
                      <Eye size={12} /> <span>Set Buka</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== POPUP MODAL EDIT DETAIL ==================== */}
      {isModalOpen && selectedFacility && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-soft">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-soft flex items-center justify-between bg-white">
              <h4 className="text-xs font-black text-ink uppercase tracking-wider">Edit Informasi Fasilitas</h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Konten Modal */}
            <form onSubmit={handleSaveChanges} className="p-5 space-y-4 text-left">
              
              {/* Row 1: Nama Fasilitas (Full Width tanpa emoji) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider">Nama Fasilitas</label>
                <input 
                  type="text" 
                  value={selectedFacility.name}
                  onChange={(e) => setSelectedFacility({...selectedFacility, name: e.target.value})}
                  className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                />
              </div>

              {/* Row 2: Lokasi Gedung */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-wider">Lokasi Gedung / Lantai</label>
                <input 
                  type="text" 
                  value={selectedFacility.location}
                  onChange={(e) => setSelectedFacility({...selectedFacility, location: e.target.value})}
                  className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                />
              </div>

              {/* Row 3: Jam Operasional & Kapasitas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Jam Operasional</label>
                  <input 
                    type="text" 
                    value={selectedFacility.hours}
                    onChange={(e) => setSelectedFacility({...selectedFacility, hours: e.target.value})}
                    className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Kapasitas Maksimal</label>
                  <input 
                    type="number" 
                    value={selectedFacility.capacity}
                    onChange={(e) => setSelectedFacility({...selectedFacility, capacity: e.target.value})}
                    className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Row 4: Status & Tarif Sewa */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Status</label>
                  <select 
                    value={selectedFacility.status}
                    onChange={(e) => setSelectedFacility({...selectedFacility, status: e.target.value})}
                    className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                  >
                    <option value="Buka">Buka</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-wider">Tarif Sewa</label>
                  <input 
                    type="text" 
                    value={selectedFacility.price}
                    onChange={(e) => setSelectedFacility({...selectedFacility, price: e.target.value})}
                    className="w-full text-xs font-bold text-ink bg-[#F8F7F5] border border-soft rounded-xl px-3 py-2.5 focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Row 5: Action Button Bawah */}
              <div className="pt-4 border-t border-soft grid grid-cols-2 gap-3">
                <button 
                  type="submit"
                  className="bg-ink text-white text-xs font-bold py-3 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
                >
                  💾 Simpan Perubahan
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border border-soft text-ink text-xs font-bold py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}