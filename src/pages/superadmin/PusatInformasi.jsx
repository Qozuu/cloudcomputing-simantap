import React, { useState, useEffect } from 'react';
import { Search, Plus, X, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PusatInformasi() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [filterTarget, setFilterTarget] = useState('Semua Target');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  const [newPost, setNewPost] = useState({
    title: '',
    target: 'all',
    content: '',
    isPublished: true // Default langsung ditayangkan
  });

  const [selectedPost, setSelectedPost] = useState(null);

  // Ambil data singkron dengan skema tabel informasi
  const loadPosts = async () => {
    try {
      // Ambil user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: infos } = await supabase
        .from('informasi')
        .select('*')
        .order('created_at', { ascending: false });

      if (infos) {
        const formatted = infos.map(bc => {
          const bcDate = new Date(bc.created_at);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dateStr = `${bcDate.getDate()} ${months[bcDate.getMonth()]} ${bcDate.getFullYear()}`;
          
          return {
            id: bc.id,
            title: bc.judul || '',
            subtitle: bc.isi || '',
            target: bc.target_role || 'all',
            date: dateStr,
            isPublished: bc.is_published,
            status: bc.is_published ? 'Tayang' : 'Draf',
            createdBy: bc.dibuat_oleh
          };
        });
        setPosts(formatted);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const getStatusBadgeClass = (isPublished) => {
    return isPublished ? 'badge-mint' : 'badge-gray';
  };

  // LOGIKA UTAMA MENYIMPAN DATA (INSERT) SESUAI SKEMA SQL
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert("Judul dan Isi Informasi tidak boleh kosong!");
      return;
    }

    try {
      // Mengambil ID user saat ini
      let creatorId = currentUser?.id;

      // FALLBACK AMAN: Jika auth Supabase kosong/belum login di lokal, ambil ID user pertama dari DB agar tidak kena error NOT NULL
      if (!creatorId) {
        const { data: users } = await supabase.from('users').select('id').limit(1);
        if (users && users.length > 0) {
          creatorId = users[0].id;
        } else {
          alert("Gagal mempublikasikan: Tidak ada data pengguna (users) di database untuk mengisi kolom dibuat_oleh.");
          return;
        }
      }

      // Format data murni sesuai kolom tabel Informasi Supabase kamu
      const dataInput = {
        dibuat_oleh: creatorId, 
        judul: newPost.title,
        isi: newPost.content,
        target_role: newPost.target,
        is_published: newPost.isPublished
      };

      const { error } = await supabase
        .from('informasi')
        .insert(dataInput);

      if (error) throw error;

      setCreateModalOpen(false);
      showToast(`Informasi "${newPost.title}" sukses diterbitkan ke database!`);
      setNewPost({ title: '', target: 'all', content: '', isPublished: true });
      loadPosts(); // Refresh tabel data
    } catch (err) {
      console.error('Gagal Insert Supabase:', err);
      alert(`Gagal Menyimpan! Pesan Error Database: ${err.message}`);
    }
  };

  const handleDetailOpen = (post) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Logika Filter Sisi Klien
  const filteredPosts = posts.filter(post => {
    const matchesTarget = filterTarget === 'Semua Target' || post.target === filterTarget;
    const matchesStatus = filterStatus === 'Semua Status' || 
                          (filterStatus === 'Tayang' && post.isPublished) || 
                          (filterStatus === 'Draf' && !post.isPublished);
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTarget && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Filters Row */}
      <div className="card-section p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8A857F] uppercase tracking-wider">Target Role:</span>
            <select
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              className="px-3 py-1.5 border border-[#EAE6E1] rounded-xl text-xs bg-[#FAF6F0] text-[#1E1E1E] font-bold focus:outline-none focus:border-[#1E1E1E]"
            >
              <option value="Semua Target">Semua Target</option>
              <option value="all">all (Semua)</option>
              <option value="penghuni">penghuni</option>
              <option value="teknisi">teknisi</option>
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

        <button onClick={() => setCreateModalOpen(true)} className="btn-primary btn-sm">
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
          <p className="text-xs text-[#8A857F] font-medium mt-0.5">Daftar bulletin board informasi internal apartemen</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-1/2">Judul & Konten</th>
                <th>Target Role</th>
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
                      <span className="badge-base badge-lavender">
                        {post.target}
                      </span>
                    </td>
                    <td className="text-[#8A857F] text-xs font-medium">{post.date}</td>
                    <td>
                      <span className={`badge-base ${getStatusBadgeClass(post.isPublished)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleDetailOpen(post)}
                        className="text-xs font-bold text-[#8A857F] hover:text-[#1E1E1E] flex items-center gap-1 ml-auto bg-[#FAF6F0] border border-[#EAE6E1] px-3 py-1 rounded-xl transition"
                      >
                        <Eye size={12} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[#8A857F] font-bold text-xs">
                    Tidak ada pengumuman yang sesuai filter skema saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INPUT DATA BARU */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">Buat Informasi Baru</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Kirim data informasi resmi ke database</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Target Pembaca (Role)</label>
                  <select
                    value={newPost.target}
                    onChange={(e) => setNewPost(prev => ({ ...prev, target: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="all">all (Semua)</option>
                    <option value="penghuni">penghuni</option>
                    <option value="teknisi">teknisi</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Status Publikasi</label>
                  <select
                    value={newPost.isPublished}
                    onChange={(e) => setNewPost(prev => ({ ...prev, isPublished: e.target.value === 'true' }))}
                    className="input-modern select-modern"
                  >
                    <option value="true">Langsung Tayang</option>
                    <option value="false">Simpan Ke Draf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-modern">Judul Informasi</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul pengumuman..."
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="label-modern">Isi Pengumuman</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan isi pengumuman lengkap disini..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="textarea-modern resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Publikasikan
                </button>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn-ghost">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: READ-ONLY DETAIL */}
      {detailModalOpen && selectedPost && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">Detail Pengumuman Resmi</h3>
                <p className="text-[10px] text-[#8A857F] font-semibold mt-0.5">Dibuat tanggal {selectedPost.date}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-[#8A857F] hover:text-[#1E1E1E] transition">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body space-y-5">
              <div className="flex items-center gap-4 bg-[#FAF6F0] p-3 rounded-xl border border-[#EAE6E1]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8A857F] tracking-wider">Penerima</p>
                  <span className="badge-base inline-block mt-1 badge-lavender">
                    {selectedPost.target}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-[#EAE6E1]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#8A857F] tracking-wider">Status Tayang</p>
                  <span className={`badge-base inline-block mt-1 ${getStatusBadgeClass(selectedPost.isPublished)}`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-black text-[#1E1E1E] leading-snug">
                  {selectedPost.title}
                </h2>
                <div className="w-10 h-[2px] bg-[#1E1E1E]" />
              </div>

              <div className="bg-[#FAF6F0]/50 border border-[#EAE6E1] p-4 rounded-xl max-h-[250px] overflow-y-auto">
                <p className="text-xs text-[#1E1E1E]/90 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedPost.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE6E1] flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="btn-primary px-6 justify-center text-xs py-2"
                >
                  Tutup
                </button>
              </div>
            </div>
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