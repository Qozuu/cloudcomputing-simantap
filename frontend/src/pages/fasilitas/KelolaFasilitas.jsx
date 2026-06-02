import React, { useState } from 'react';

export default function KelolaFasilitas() {
  const [facilities, setFacilities] = useState([
    {
      id: 1,
      name: 'Kolam Renang',
      status: 'Buka',
      location: 'Lantai G Tower A',
      hours: '06:00-21:00',
      capacity: '50 org',
      price: 'Gratis',
      isPaid: false,
      emoji: '🏊'
    },
    {
      id: 2,
      name: 'Fitness Center',
      status: 'Buka',
      location: 'Lantai 2 Tower A',
      hours: '06:00-22:00',
      capacity: '30 org',
      price: 'Gratis',
      isPaid: false,
      emoji: '🏋️'
    },
    {
      id: 3,
      name: 'Lapangan Tenis',
      status: 'Buka',
      location: 'Rooftop Tower B',
      hours: '07:00-20:00',
      capacity: '8 org',
      price: 'Rp 75.000/sesi',
      isPaid: true,
      emoji: '🎾'
    },
    {
      id: 4,
      name: 'Game Room',
      status: 'Buka',
      location: 'Lantai 3 Tower B',
      hours: '10:00-22:00',
      capacity: '20 org',
      price: 'Gratis',
      isPaid: false,
      emoji: '🎮'
    },
    {
      id: 5,
      name: 'Ruang Serbaguna',
      status: 'Buka',
      location: 'Lantai 1 Tower C',
      hours: '08:00-22:00',
      capacity: '200 org',
      price: 'Rp 100.000/sesi',
      isPaid: true,
      emoji: '🏛️'
    },
    {
      id: 6,
      name: 'Yoga Studio',
      status: 'Maintenance',
      location: 'Lantai 4 Tower A',
      hours: '06:00-21:00',
      capacity: '15 org',
      price: 'Rp 50.000/sesi',
      isPaid: true,
      emoji: '🧘'
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  // State baru untuk melacak data yang sedang diedit
  const [editingFacility, setEditingFacility] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    hours: '',
    capacity: '',
    status: 'Buka',
    price: 'Gratis',
    emoji: '🏢'
  });

  const emojis = ['🏊', '🏋️', '🎾', '🎮', '🏛️', '🧘', '🍖', '🎤', '🎬', '☕'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi membuka modal untuk Edit Data
  const handleEditClick = (fac) => {
    setEditingFacility(fac);
    setFormData({
      name: fac.name,
      location: fac.location,
      hours: fac.hours,
      // Menghilangkan imbuhan ' org' saat masuk input form agar rapi
      capacity: fac.capacity.replace(' org', ''), 
      status: fac.status,
      price: fac.price,
      emoji: fac.emoji
    });
    setModalOpen(true);
  };

  // Fungsi menutup modal dan reset state
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFacility(null);
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

  // Fungsi Submit (Menangani Tambah & Edit Sekaligus)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;

    if (editingFacility) {
      // PROSES UPDATE DATA (EDIT)
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === editingFacility.id
            ? {
                ...f,
                name: formData.name,
                location: formData.location,
                hours: formData.hours || '08:00-20:00',
                capacity: formData.capacity.includes('org') ? formData.capacity : `${formData.capacity} org`,
                status: formData.status,
                price: formData.price || 'Gratis',
                isPaid: formData.price !== 'Gratis' && formData.price !== '',
                emoji: formData.emoji
              }
            : f
        )
      );
      showToast(`Fasilitas "${formData.name}" berhasil diperbarui!`);
    } else {
      // PROSES TAMBAH DATA BARU
      const newFacility = {
        id: Date.now(),
        name: formData.name,
        location: formData.location,
        hours: formData.hours || '08:00-20:00',
        capacity: formData.capacity ? `${formData.capacity} org` : '20 org',
        status: formData.status,
        price: formData.price || 'Gratis',
        isPaid: formData.price !== 'Gratis',
        emoji: formData.emoji
      };
      setFacilities((prev) => [...prev, newFacility]);
      showToast(`Fasilitas "${formData.name}" berhasil ditambahkan!`);
    }

    handleCloseModal();
  };

  const handleToggleStatus = (id) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextStatus = f.status === 'Buka' ? 'Tutup' : 'Buka';
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
          <h2 className="text-base font-bold text-ink">Manajemen Kelola Fasilitas</h2>
          <p className="text-xs text-muted">Konfigurasi operasional, harga sewa, dan kuota harian</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((fac, idx) => {
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
              className={`${cardClass} flex flex-col relative hover:translate-y-[-2px] transition duration-200`}
            >
              {/* Status Badge top right */}
              <span 
                className="absolute top-4 right-4 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10"
                style={badgeStyle}
              >
                {fac.status}
              </span>

              {/* Top Area Centered Emoji */}
              <div className="h-28 flex items-center justify-center border-b border-soft relative">
                <span className="text-5xl select-none filter drop-shadow-sm">{fac.emoji}</span>
              </div>

              {/* Content Details */}
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1E1E1E]">{fac.name}</h3>
                </div>

                <div className="space-y-1.5 text-xs text-muted font-semibold">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{fac.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{fac.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Kapasitas: {fac.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-soft">
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={fac.isPaid ? 'text-[#A05820] font-bold text-xs' : 'text-[#187050] font-bold text-xs'}>
                      {fac.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-soft grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleEditClick(fac)}
                  className="py-2.5 btn-ghost justify-center rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(fac.id)}
                  className="py-2.5 btn-ghost justify-center rounded-xl text-xs font-bold hover:bg-pastel-pink-bg hover:text-[#B85040] hover:border-pastel-pink/30 transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>{fac.status === 'Buka' ? '⊘ Tutup' : '✓ Buka'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tambah/Edit Fasilitas Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                {editingFacility ? 'Edit Informasi Fasilitas' : 'Tambah Fasilitas Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modal-body space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Nama Fasilitas</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Kolam Renang"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Pilih Emoji Icon</label>
                  <select
                    name="emoji"
                    value={formData.emoji}
                    onChange={handleInputChange}
                    className="select-modern input-modern font-semibold"
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
                  className="input-modern font-semibold"
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
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Kapasitas Maksimal</label>
                  <input
                    type="text"
                    name="capacity"
                    placeholder="Contoh: 50 orang"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Buka">Buka</option>
                    <option value="Tutup">Tutup</option>
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
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  <span>{editingFacility ? '💾 Simpan Perubahan' : '➕ Tambah'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
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
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}