import React, { useState } from 'react';

export default function PusatInformasi() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Pemadaman Listrik Tower B',
      subtitle: 'Listrik Tower B akan dipadamkan 22 Apr pukul 09.00-12.00 untuk perbaikan panel listrik utama.',
      category: 'Darurat',
      target: 'Semua',
      date: '2026-04-21',
      dateFormatted: '21 Apr 2026',
      status: 'Tayang'
    },
    {
      id: 2,
      title: 'Kolam Renang Dibuka Kembali',
      subtitle: 'Kolam Renang Tower A kembali beroperasi normal mulai 20 April 2026.',
      category: 'Info',
      target: 'Semua',
      date: '2026-04-20',
      dateFormatted: '20 Apr 2026',
      status: 'Tayang'
    },
    {
      id: 3,
      title: 'Promo Sewa Ruang Serbaguna',
      subtitle: 'Diskon 30% untuk sewa Ruang Serbaguna di bulan April 2026.',
      category: 'Promo',
      target: 'Semua',
      date: '2026-04-15',
      dateFormatted: '15 Apr 2026',
      status: 'Tayang'
    },
    {
      id: 4,
      title: 'Peraturan Parkir Baru',
      subtitle: 'Mulai 1 Mei 2026 tarif parkir revisi Rp 3.000/jam dan motor Rp 15.000/hari.',
      category: 'Peraturan',
      target: 'Semua',
      date: '2026-04-10',
      dateFormatted: '10 Apr 2026',
      status: 'Tayang'
    },
    {
      id: 5,
      title: 'Jadwal Pemeliharaan Lift',
      subtitle: 'Lift Tower A lantai 1-10 telah selesai diperiksa dan berfungsi normal.',
      category: 'Pemeliharaan',
      target: 'Tower A',
      date: '2026-04-05',
      dateFormatted: '05 Apr 2026',
      status: 'Selesai'
    }
  ]);

  // Dropdown filter states
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterOrder, setFilterOrder] = useState('Terbaru Dulu');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

  // Modals state
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // New post form state
  const [newPostData, setNewPostData] = useState({
    title: '',
    subtitle: '',
    category: 'Info',
    target: 'Semua',
    status: 'Tayang'
  });

  const [successToast, setSuccessToast] = useState('');

  // Dropdown categories mapping
  const categoryBadgeColors = (category) => {
    switch (category) {
      case 'Darurat':
        return 'bg-coral text-white';
      case 'Info':
        return 'bg-navy text-cream';
      case 'Promo':
        return 'bg-gold text-white';
      case 'Peraturan':
        return 'bg-cream text-navy';
      case 'Pemeliharaan':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusBadgeColors = (status) => {
    switch (status) {
      case 'Tayang':
        return 'bg-navy text-cream';
      case 'Selesai':
        return 'bg-gold text-white';
      default:
        return 'bg-gray-150 text-gray-700';
    }
  };

  const handleResetFilters = () => {
    setFilterCategory('Semua Kategori');
    setFilterOrder('Terbaru Dulu');
    setFilterStatus('Semua Status');
  };

  // Archive Post (changes status to Selesai)
  const handleArchivePost = (id) => {
    setPosts(prev =>
      prev.map(p => p.id === id ? { ...p, status: 'Selesai' } : p)
    );
    setSuccessToast('Informasi berhasil diarsipkan!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Create Post Submit
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.subtitle.trim()) return;

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const formatted = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

    const newPost = {
      id: Date.now(),
      title: newPostData.title,
      subtitle: newPostData.subtitle,
      category: newPostData.category,
      target: newPostData.target,
      date: dateString,
      dateFormatted: formatted,
      status: newPostData.status
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostModalOpen(false);
    setSuccessToast('Pengumuman baru berhasil dipublikasikan!');
    setTimeout(() => setSuccessToast(''), 3000);

    // Reset form
    setNewPostData({
      title: '',
      subtitle: '',
      category: 'Info',
      target: 'Semua',
      status: 'Tayang'
    });
  };

  // Open detail view
  const handleOpenDetail = (post) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  };

  // Filtered & Sorted Posts logic
  const filteredPosts = posts
    .filter(post => {
      const matchCat = filterCategory === 'Semua Kategori' || post.category === filterCategory;
      const matchStat = filterStatus === 'Semua Status' || post.status === filterStatus;
      return matchCat && matchStat;
    })
    .sort((a, b) => {
      if (filterOrder === 'Terbaru Dulu') {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  return (
    <div className="space-y-6 animate-fadeIn relative">
      
      {/* Dynamic Filter Row */}
      <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-4xl">
            {/* Category select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Darurat">Darurat</option>
                <option value="Info">Info</option>
                <option value="Promo">Promo</option>
                <option value="Peraturan">Peraturan</option>
                <option value="Pemeliharaan">Pemeliharaan</option>
              </select>
            </div>

            {/* Sorting select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Urutan</label>
              <select
                value={filterOrder}
                onChange={(e) => setFilterOrder(e.target.value)}
                className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
              >
                <option value="Terbaru Dulu">Terbaru Dulu</option>
                <option value="Terlama Dulu">Terlama Dulu</option>
              </select>
            </div>

            {/* Status select */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status Tayang</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Tayang">Tayang</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setNewPostModalOpen(true)}
              className="w-full lg:w-auto bg-navy hover:bg-navy/95 text-cream hover:scale-102 transition duration-150 px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>+ Buat Informasi Baru</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-500 font-semibold">
            Manajemen Informasi & Pengumuman — Menampilkan {filteredPosts.length} informasi
          </span>
          <button
            onClick={handleResetFilters}
            className="text-gold hover:text-navy hover:underline font-extrabold flex items-center gap-1"
          >
            <span>↺ Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-6 overflow-hidden">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150">
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider w-1/2">Judul</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Target</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 space-y-1">
                    <p className="text-navy font-bold text-sm leading-tight">{post.title}</p>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">{post.subtitle}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${categoryBadgeColors(post.category)}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{post.target}</td>
                  <td className="p-4 text-gray-500">{post.dateFormatted}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${statusBadgeColors(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {post.status === 'Tayang' ? (
                      <div className="flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => handleOpenDetail(post)}
                          className="text-navy hover:text-navy/85 hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchivePost(post.id)}
                          className="text-coral hover:text-coral/85 hover:underline font-bold"
                        >
                          Arsip
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenDetail(post)}
                        className="text-gray-500 hover:text-navy hover:underline font-bold"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 font-medium">
                    Tidak ada informasi pengumuman yang sesuai dengan filter seleksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)}></div>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden relative z-10 animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between">
              <h3 className="text-sm font-black text-navy uppercase tracking-wider">Detail Informasi Pengumuman</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-navy transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Body */}
            <div className="p-5 space-y-4">
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Judul Utama</span>
                <p className="text-sm font-black text-navy leading-snug">{selectedPost.title}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Kategori</span>
                  <div className="mt-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${categoryBadgeColors(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Target</span>
                  <p className="text-xs font-black text-gray-700 mt-1">{selectedPost.target}</p>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tanggal</span>
                  <p className="text-xs font-bold text-gray-500 mt-1">{selectedPost.dateFormatted}</p>
                </div>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status Penayangan</span>
                <div className="mt-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadgeColors(selectedPost.status)}`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Deskripsi Lengkap</span>
                <p className="text-xs font-medium text-gray-700 leading-relaxed">{selectedPost.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="bg-navy hover:bg-navy/95 text-cream px-5 py-2.5 rounded-xl text-xs font-black transition shadow-sm"
                >
                  Tutup Informasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUAT INFORMASI BARU MODAL */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setNewPostModalOpen(false)}></div>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden relative z-10 animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between">
              <h3 className="text-sm font-black text-navy uppercase tracking-wider">Buat Informasi Pengumuman</h3>
              <button onClick={() => setNewPostModalOpen(false)} className="text-gray-400 hover:text-navy transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kategori Pengumuman</label>
                  <select
                    value={newPostData.category}
                    onChange={(e) => setNewPostData(prev => ({ ...prev, category: e.target.value }))}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
                  >
                    <option value="Info">Info</option>
                    <option value="Darurat">Darurat</option>
                    <option value="Promo">Promo</option>
                    <option value="Peraturan">Peraturan</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Audience</label>
                  <select
                    value={newPostData.target}
                    onChange={(e) => setNewPostData(prev => ({ ...prev, target: e.target.value }))}
                    className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
                  >
                    <option value="Semua">Semua Tower / Hunian</option>
                    <option value="Tower A">Tower A saja</option>
                    <option value="Tower B">Tower B saja</option>
                    <option value="Tower C">Tower C saja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Perbaikan Lift Utama Tower A"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Isi Pengumuman / Detail Informasi</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Masukkan pengumuman lengkap detail jam perbaikan, area terdampak..."
                  value={newPostData.subtitle}
                  onChange={(e) => setNewPostData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="block w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy font-semibold resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-navy hover:bg-navy/95 text-cream py-3 px-4 rounded-xl text-xs font-black tracking-wide transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>✓ Publikasikan Pengumuman</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition"
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
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3.5 border border-white/10 animate-slideIn">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Sukses</p>
            <p className="text-[10px] text-gray-300 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
