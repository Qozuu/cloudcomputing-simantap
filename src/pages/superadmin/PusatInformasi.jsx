import React, { useState } from 'react';
import { Search, Plus, X, Pencil, CheckCircle } from 'lucide-react';

export default function PusatInformasi() {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Pemadaman Listrik Tower B', subtitle: 'Listrik Tower B akan dipadamkan 22 Apr pukul 09.00-12.00 untuk perbaikan panel listrik utama.', category: 'Darurat', target: 'Semua', date: '21 Apr 2026', status: 'Tayang' },
    { id: 2, title: 'Kolam Renang Dibuka Kembali', subtitle: 'Kolam Renang Tower A kembali beroperasi normal mulai 20 April 2026.', category: 'Info', target: 'Semua', date: '20 Apr 2026', status: 'Tayang' },
    { id: 3, title: 'Promo Sewa Ruang Serbaguna', subtitle: 'Diskon 30% untuk sewa Ruang Serbaguna di bulan April 2026.', category: 'Promo', target: 'Semua', date: '15 Apr 2026', status: 'Draf' },
    { id: 4, title: 'Peraturan Parkir Baru', subtitle: 'Mulai 1 Mei 2026 tarif parkir revisi Rp 3.000/jam dan motor Rp 15.000/hari.', category: 'Peraturan', target: 'Semua', date: '10 Apr 2026', status: 'Arsip' },
    { id: 5, title: 'Jadwal Pemeliharaan Lift', subtitle: 'Lift Tower A lantai 1-10 telah selesai diperiksa dan berfungsi normal.', category: 'Pemeliharaan', target: 'Tower A', date: '05 Apr 2026', status: 'Tayang' }
  ]);

  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Info',
    target: 'Semua Penghuni',
    subtitle: ''
  });

  const [editingPost, setEditingPost] = useState(null);

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Darurat': return 'badge-pink';
      case 'Info': return 'badge-lavender';
      case 'Promo': return 'badge-yellow';
      case 'Peraturan': return 'badge-dark';
      case 'Pemeliharaan': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Tayang': return 'badge-mint';
      case 'Draf': return 'badge-gray';
      case 'Arsip': return 'badge-yellow';
      default: return 'badge-gray';
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.subtitle) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const added = {
      id: Date.now(),
      title: newPost.title,
      category: newPost.category,
      target: newPost.target,
      date: formattedDate,
      status: 'Tayang',
      subtitle: newPost.subtitle
    };

    setPosts(prev => [added, ...prev]);
    setCreateModalOpen(false);
    showToast(`Informasi "${newPost.title}" berhasil dipublikasikan!`);
    setNewPost({ title: '', category: 'Info', target: 'Semua Penghuni', subtitle: '' });
  };

  const handleEditOpen = (post) => {
    setEditingPost({ ...post });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title || !editingPost.subtitle) return;

    setPosts(prev => 
      prev.map(p => p.id === editingPost.id ? editingPost : p)
    );
    setEditModalOpen(false);
    showToast(`Informasi "${editingPost.title}" berhasil diperbarui!`);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'Semua Kategori' || post.category === filterCategory;
    const matchesStatus = filterStatus === 'Semua Status' || post.status === filterStatus;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filters Row */}
      <div className="card-section p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Darurat">Darurat</option>
              <option value="Info">Info</option>
              <option value="Promo">Promo</option>
              <option value="Peraturan">Peraturan</option>
              <option value="Pemeliharaan">Pemeliharaan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Tayang">Tayang</option>
              <option value="Draf">Draf</option>
              <option value="Arsip">Arsip</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] placeholder-[#8A857F] focus:outline-none focus:border-[#1E1E1E] font-semibold w-52"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A857F]" size={14} />
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary btn-sm"
        >
          <Plus size={14} />
          <span>Buat Informasi Baru</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card-section p-6">
        <div className="pb-4 border-b border-[#EAE6E1] mb-5">
          <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider font-serif">
            Pusat Informasi & Pengumuman
          </h3>
          <p className="text-xs text-[#8A857F] font-medium mt-0.5">Buat, draf, tayangkan, atau arsipkan info bulletin board untuk penghuni</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-1/3">Judul</th>
                <th>Kategori</th>
                <th>Target</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="space-y-1">
                      <p className="text-[#1E1E1E] font-bold text-sm leading-tight">{post.title}</p>
                      <p className="text-xs text-[#8A857F] font-medium line-clamp-1">{post.subtitle}</p>
                    </td>
                    <td>
                      <span className={`badge-base ${getCategoryBadgeClass(post.category)}`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="text-[#1E1E1E]/80">{post.target}</td>
                    <td className="text-[#8A857F]">{post.date}</td>
                    <td>
                      <span className={`badge-base ${getStatusBadgeClass(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleEditOpen(post)}
                        className="text-xs font-bold text-[#1E1E1E] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#8A857F] font-bold">
                    Tidak ada pengumuman bulletin board yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">Buat Informasi Baru</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Tayangkan pengumuman baru</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Kategori</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Darurat">Darurat</option>
                    <option value="Info">Info</option>
                    <option value="Promo">Promo</option>
                    <option value="Peraturan">Peraturan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Target Penerima</label>
                  <select
                    value={newPost.target}
                    onChange={(e) => setNewPost(prev => ({ ...prev, target: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Semua Penghuni">Semua Penghuni</option>
                    <option value="Tower A">Tower A</option>
                    <option value="Tower B">Tower B</option>
                    <option value="Tower C">Tower C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-modern">Judul Informasi</label>
                <input
                  type="text"
                  required
                  placeholder="Judul informasi/pengumuman"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">Isi Informasi</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Isi informasi pengumuman lengkap..."
                  value={newPost.subtitle}
                  onChange={(e) => setNewPost(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="textarea-modern resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                >
                  Publikasikan
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && editingPost && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">Edit Informasi</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Perbarui data pengumuman</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Kategori</label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, category: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Darurat">Darurat</option>
                    <option value="Info">Info</option>
                    <option value="Promo">Promo</option>
                    <option value="Peraturan">Peraturan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Target Penerima</label>
                  <select
                    value={editingPost.target}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, target: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Semua">Semua Penghuni</option>
                    <option value="Tower A">Tower A</option>
                    <option value="Tower B">Tower B</option>
                    <option value="Tower C">Tower C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Status Penayangan</label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, status: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Tayang">Tayang</option>
                    <option value="Draf">Draf</option>
                    <option value="Arsip">Arsip</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Judul Informasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Judul informasi/pengumuman"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Isi Informasi</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Isi informasi pengumuman lengkap..."
                  value={editingPost.subtitle}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="textarea-modern resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center"
                >
                  Simpan
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
