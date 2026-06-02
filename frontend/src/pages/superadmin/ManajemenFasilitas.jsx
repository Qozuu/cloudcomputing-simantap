import React, { useState } from 'react';
import { Plus, X, Pencil, Ban, CheckCircle } from 'lucide-react';

export default function ManajemenFasilitas() {
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Kolam Renang', status: 'Buka', location: 'Lantai G Tower A', hours: '06:00-21:00', capacity: 50, booked: 42, price: 'Gratis', isPaid: false, emoji: '🏊' },
    { id: 2, name: 'Fitness Center', status: 'Buka', location: 'Lantai 2 Tower A', hours: '06:00-22:00', capacity: 30, booked: 18, price: 'Gratis', isPaid: false, emoji: '🏋️' },
    { id: 3, name: 'Lapangan Tenis', status: 'Buka', location: 'Rooftop Tower B', hours: '07:00-20:00', capacity: 8, booked: 4, price: 'Rp 75.000/sesi', isPaid: true, emoji: '🎾' },
    { id: 4, name: 'Game Room', status: 'Buka', location: 'Lantai 3 Tower B', hours: '10:00-22:00', capacity: 20, booked: 5, price: 'Gratis', isPaid: false, emoji: '🎮' },
    { id: 5, name: 'Ruang Serbaguna', status: 'Buka', location: 'Lantai 1 Tower C', hours: '08:00-22:00', capacity: 200, booked: 150, price: 'Rp 100.000/sesi', isPaid: true, emoji: '🏛️' },
    { id: 6, name: 'Yoga Studio', status: 'Maintenance', location: 'Lantai 4 Tower A', hours: '06:00-21:00', capacity: 15, booked: 0, price: 'Rp 50.000/sesi', isPaid: true, emoji: '🧘' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // State baru untuk Modal Edit
  const [successToast, setSuccessToast] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    hours: '',
    capacity: '',
    status: 'Buka',
    price: 'Gratis',
    emoji: '🏢'
  });

  // State baru untuk menampung data fasilitas yang sedang diedit
  const [editingFacility, setEditingFacility] = useState(null);

  const emojis = ['🏊', '🏋️', '🎾', '🎮', '🏛️', '🧘', '🍖', '🎤', '🎬', '☕'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler input khusus untuk form edit
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingFacility((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateFacility = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;

    const capNum = parseInt(formData.capacity) || 20;

    const newFacility = {
      id: Date.now(),
      name: formData.name,
      location: formData.location,
      hours: formData.hours || '08:00-20:00',
      capacity: capNum,
      booked: 0,
      status: formData.status,
      price: formData.price || 'Gratis',
      isPaid: formData.price !== 'Gratis',
      emoji: formData.emoji
    };

    setFacilities((prev) => [...prev, newFacility]);
    setModalOpen(false);
    showToast(`Fasilitas "${formData.name}" berhasil ditambahkan!`);

    setFormData({
      name: '',
      location: '',
      hours: '',
      capacity: '',
      status: 'Buka',
      price: 'Gratis',
      emoji: '🏢'
    });
  };

  // Fungsi untuk membuka modal edit dan menyalin data lama
  const handleOpenEditModal = (facility) => {
    setEditingFacility({ ...facility });
    setEditModalOpen(true);
  };

  // Fungsi untuk menyimpan hasil edit data
  const handleUpdateFacility = (e) => {
    e.preventDefault();
    if (!editingFacility.name.trim() || !editingFacility.location.trim()) return;

    setFacilities((prev) =>
      prev.map((f) => (f.id === editingFacility.id ? { 
        ...editingFacility, 
        capacity: parseInt(editingFacility.capacity) || 20,
        isPaid: editingFacility.price !== 'Gratis'
      } : f))
    );
    setEditModalOpen(false);
    showToast(`Fasilitas "${editingFacility.name}" berhasil diperbarui!`);
  };

  const handleToggleStatus = (id) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextStatus = f.status === 'Buka' ? 'Maintenance' : 'Buka';
          showToast(`Status "${f.name}" diubah menjadi ${nextStatus}.`);
          return { ...f, status: nextStatus };
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
      {/* Header bar */}
      <div className="card-section p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">Manajemen Fasilitas</h2>
          <p className="text-xs text-[#8A857F] font-medium mt-0.5">Konfigurasi operasional, harga sewa, dan kapasitas harian</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac, idx) => {
          const availableSlots = fac.capacity - fac.booked;
          const occupancyRate = (fac.booked / fac.capacity) * 100;
          const sectionClasses = ['card-section-pink', 'card-section-yellow', 'card-section-lavender', 'card-section-mint'];
          const cardClass = sectionClasses[idx % 4];
          const badgeStyles = [
            { backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' },
            { backgroundColor: 'rgba(252,214,165,0.6)', color: '#A05820' },
            { backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' },
            { backgroundColor: 'rgba(181,234,215,0.6)', color: '#187050' }
          ];
          const badgeStyle = badgeStyles[idx % 4];

          return (
            <div
              key={fac.id}
              className={`${cardClass} hover:scale-[1.01] hover:shadow-md transition duration-200 !p-0 flex flex-col relative`}
            >
              {/* Status Badge top right */}
              <span 
                className="absolute top-4 right-4 badge-base shadow-sm z-10"
                style={badgeStyle}
              >
                {fac.status}
              </span>

              {/* Emoji Header */}
              <div className="h-28 flex items-center justify-center border-b border-[#EAE6E1]">
                <span className="text-5xl select-none filter drop-shadow-sm">{fac.emoji}</span>
              </div>

              {/* Content Details */}
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#1E1E1E]">{fac.name}</h3>
                  <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wide mt-0.5">{fac.location}</p>
                </div>

                <div className="space-y-2.5 text-xs text-[#1E1E1E]/80 font-medium">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8A857F]">Jam Buka:</span>
                    <span className="text-[#1E1E1E] font-bold">{fac.hours}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] pb-2 border-b border-[#EAE6E1]">
                    <span className="text-[#8A857F]">Harga Sewa:</span>
                    <span className={`font-bold ${fac.isPaid ? 'text-[#A05820]' : 'text-[#1E1E1E]'}`}>{fac.price}</span>
                  </div>

                  {/* Slot progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[#1E1E1E]">Sisa slot: {availableSlots < 0 ? 0 : availableSlots} / {fac.capacity}</span>
                      <span className="text-[#8A857F] font-bold">{Math.round(occupancyRate)}% Terpakai</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className={`progress-fill ${
                          occupancyRate >= 80 ? 'progress-pink' : occupancyRate >= 50 ? 'progress-lavender' : 'progress-mint'
                        }`} 
                        style={{ width: `${occupancyRate > 100 ? 100 : occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-[#EAE6E1] grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(fac)}
                  className="btn-soft py-2 px-3 justify-center text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(fac.id)}
                  className="btn-ghost py-2 px-3 justify-center text-xs font-bold transition flex items-center gap-1 hover:bg-[#FEF0EE] hover:text-[#B85040] hover:border-[#FEF0EE]"
                >
                  <Ban size={12} />
                  <span>{fac.status === 'Buka' ? 'Tutup' : 'Buka'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Facility Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">Tambah Fasilitas Baru</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Konfigurasi fasilitas gedung</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateFacility} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Nama Fasilitas</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Lapangan Basket"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Emoji Icon</label>
                  <select
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleInputChange}
                    className="input-modern select-modern"
                  >
                    {emojis.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-modern">Lokasi Gedung / Lantai</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Contoh: Lantai G Tower A"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Operasional</label>
                  <input
                    type="text"
                    name="hours"
                    placeholder="Contoh: 06:00-21:00"
                    value={formData.hours}
                    onChange={handleInputChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="Contoh: 50"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Status Awal</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="input-modern select-modern"
                  >
                    <option value="Buka">Buka</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Tarif Sewa</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Contoh: Gratis / Rp 75.000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                >
                  Tambah Fasilitas
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Edit Facility Modal (Beneran Bisa Disimpan) */}
      {editModalOpen && editingFacility && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">Edit Fasilitas</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Ubah detail operasional {editingFacility.name}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            {/* Form Edit */}
            <form onSubmit={handleUpdateFacility} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Nama Fasilitas</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={editingFacility.name}
                    onChange={handleEditInputChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Emoji Icon</label>
                  <select
                    name="emoji"
                    value={editingFacility.emoji}
                    onChange={handleEditInputChange}
                    className="input-modern select-modern"
                  >
                    {emojis.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-modern">Lokasi Gedung / Lantai</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={editingFacility.location}
                  onChange={handleEditInputChange}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Operasional</label>
                  <input
                    type="text"
                    name="hours"
                    value={editingFacility.hours}
                    onChange={handleEditInputChange}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    name="capacity"
                    value={editingFacility.capacity}
                    onChange={handleEditInputChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Status</label>
                  <select
                    name="status"
                    value={editingFacility.status}
                    onChange={handleEditInputChange}
                    className="input-modern select-modern"
                  >
                    <option value="Buka">Buka</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Tarif Sewa</label>
                  <input
                    type="text"
                    name="price"
                    value={editingFacility.price}
                    onChange={handleEditInputChange}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-ghost"
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
          <CheckCircle size={16} />
          <div>
            <p className="text-[10px] text-white/70 font-semibold">Sukses</p>
            <p className="text-xs font-bold leading-none mt-0.5">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}