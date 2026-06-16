import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PusatInformasi({ userRole = 'Kebersihan' }) {
  const isManagement = userRole === 'GM' || userRole === 'SuperAdmin';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterOrder, setFilterOrder] = useState('Terbaru Dulu');
  const [filterStatus, setFilterStatus] = useState('Semua Status');

  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [newPostData, setNewPostData] = useState({
    title: '',
    subtitle: '',
    category: 'Info',
    target: 'Semua',
    status: 'Tayang'
  });

  const [successToast, setSuccessToast] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('informasi')
        .select('*, pembuat:users(nama)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data.map(item => {
          const dateObj = new Date(item.created_at);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dateFormatted = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
          
          return {
            id: item.id,
            title: item.judul || '',
            subtitle: item.deskripsi || '',
            category: item.kategori || 'Info',
            target: item.target || 'Semua',
            date: item.created_at?.split('T')[0] || '',
            dateFormatted,
            status: item.is_published ? 'Tayang' : 'Selesai'
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load announcements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Sinkronisasi dengan Palet Pastel Sistem Manajemen Apartemen Anda
  const categoryBadgeColors = (category) => {
    switch (category) {
      case 'Darurat': return 'bg-red-50 text-red-600 border border-red-100 font-semibold';
      case 'Info': return 'bg-blue-50 text-blue-600 border border-blue-100 font-semibold';
      case 'Promo': return 'bg-amber-50 text-amber-600 border border-amber-100 font-semibold';
      case 'Peraturan': return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
      case 'Pemeliharaan': return 'bg-purple-50 text-purple-600 border border-purple-100 font-semibold';
      default: return 'bg-zinc-50 text-zinc-600 border border-zinc-200';
    }
  };

  const statusBadgeColors = (status) => {
    switch (status) {
      case 'Tayang': return 'bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold';
      case 'Selesai': return 'bg-zinc-100 text-zinc-400 border border-zinc-200 font-normal';
      default: return 'bg-zinc-50 text-zinc-500';
    }
  };

  const handleResetFilters = () => {
    setFilterCategory('Semua Kategori');
    setFilterOrder('Terbaru Dulu');
    setFilterStatus('Semua Status');
  };

  const handleArchivePost = async (id) => {
    if (!isManagement) return;
    try {
      const { error } = await supabase
        .from('informasi')
        .update({ is_published: false })
        .eq('id', id);

      if (error) throw error;
      setSuccessToast('Informasi berhasil diarsipkan!');
      setTimeout(() => setSuccessToast(''), 3000);
      loadPosts();
    } catch (err) {
      console.error('Failed to archive announcement:', err.message);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isManagement) return;
    if (!newPostData.title.trim() || !newPostData.subtitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('informasi')
        .insert({
          judul: newPostData.title,
          deskripsi: newPostData.subtitle,
          kategori: newPostData.category,
          target: newPostData.target,
          is_published: newPostData.status === 'Tayang',
          dibuat_oleh: user.id
        });

      if (error) throw error;
      setNewPostModalOpen(false);
      setSuccessToast('Pengumuman baru berhasil dipublikasikan!');
      setTimeout(() => setSuccessToast(''), 3000);
      setNewPostData({ title: '', subtitle: '', category: 'Info', target: 'Semua', status: 'Tayang' });
      loadPosts();
    } catch (err) {
      console.error('Failed to create announcement:', err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  const filteredPosts = posts
    .filter(post => {
      const matchCat = filterCategory === 'Semua Kategori' || post.category === filterCategory;
      const matchStat = filterStatus === 'Semua Status' || post.status === filterStatus;
      return matchCat && matchStat;
    })
    .sort((a, b) => filterOrder === 'Terbaru Dulu' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6 relative text-zinc-800">
      
      {/* Dynamic Filter Row */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-4xl">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-semibold"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Darurat">Darurat</option>
                <option value="Info">Info</option>
                <option value="Promo">Promo</option>
                <option value="Peraturan">Peraturan</option>
                <option value="Pemeliharaan">Pemeliharaan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Urutan</label>
              <select
                value={filterOrder}
                onChange={(e) => setFilterOrder(e.target.value)}
                className="block w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-semibold"
              >
                <option value="Terbaru Dulu">Terbaru Dulu</option>
                <option value="Terlama Dulu">Terlama Dulu</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status Tayang</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-semibold"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Tayang">Tayang</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {isManagement && (
            <div className="flex items-end">
              <button
                onClick={() => setNewPostModalOpen(true)}
                className="w-full lg:w-auto bg-zinc-950 hover:bg-zinc-900 text-white transition duration-150 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>+ Buat Informasi Baru</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-50 pt-3 text-xs">
          <span className="text-zinc-400 font-semibold">
            {isManagement ? 'Manajemen Informasi & Pengumuman' : 'Pusat Informasi & Pengumuman'} — Menampilkan {filteredPosts.length} informasi
          </span>
          <button
            onClick={handleResetFilters}
            className="text-zinc-500 hover:text-zinc-950 hover:underline font-bold flex items-center gap-1"
          >
            <span>↺ Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-1/2">Judul</th>
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Kategori</th>
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Target</th>
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tanggal</th>
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-750">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-50/30 transition">
                  <td className="p-4 space-y-1">
                    <p className="text-zinc-900 font-bold text-sm leading-tight">{post.title}</p>
                    <p className="text-xs text-zinc-400 font-medium line-clamp-1">{post.subtitle}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider text-xs ${categoryBadgeColors(post.category)}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-600">{post.target}</td>
                  <td className="p-4 text-zinc-400">{post.dateFormatted}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider text-xs ${statusBadgeColors(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isManagement && post.status === 'Tayang' ? (
                      <div className="flex items-center justify-end gap-3.5">
                        <button onClick={() => { setSelectedPost(post); setDetailModalOpen(true); }} className="text-zinc-900 hover:underline font-bold">Edit</button>
                        <button onClick={() => handleArchivePost(post.id)} className="text-zinc-400 hover:text-zinc-900 hover:underline font-bold">Arsip</button>
                      </div>
                    ) : (
                      <button onClick={() => { setSelectedPost(post); setDetailModalOpen(true); }} className="text-zinc-900 hover:underline font-bold">Lihat Detail</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)}></div>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-zinc-100 overflow-hidden relative z-10">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Detail Informasi Pengumuman</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 transition">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Judul Utama</span>
                <p className="text-sm font-bold text-zinc-900 leading-snug">{selectedPost.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Kategori</span>
                  <div className="mt-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider ${categoryBadgeColors(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Tanggal</span>
                  <p className="text-xs font-bold text-zinc-500 mt-1">{selectedPost.dateFormatted}</p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Deskripsi Lengkap</span>
                <p className="text-xs font-medium text-zinc-600 leading-relaxed">{selectedPost.subtitle}</p>
              </div>
              <div className="pt-3 border-t border-zinc-100 flex justify-end">
                <button onClick={() => setDetailModalOpen(false)} className="bg-zinc-950 text-white px-5 py-2 rounded-xl text-xs font-bold">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}