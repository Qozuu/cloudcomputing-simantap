import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Pengumuman() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  const categories = ['Semua', 'Darurat', 'Info', 'Promo', 'Peraturan'];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
<<<<<<< HEAD

        // 1. Dapatkan data user penghuni yang sedang login
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        console.log("MATA-MATA 1 (ID User Login):", user?.id);

        let userTower = 'Semua';

        // 2. Ambil data tower si user dari tabel profiles
        if (user) {
          const { data: profile, error: profError } = await supabase
            .from('profiles') // ◄ Kalo nama tabel profilmu bukan 'profiles' (misal 'users' atau 'penghuni'), ganti ini
            .select('tower')
            .eq('id', user.id)
            .single();
          
          if (profError) {
            console.error("MATA-MATA 2 (Gagal ambil profil):", profError.message);
          } else {
            console.log("MATA-MATA 3 (Data Profil ditemukan):", profile);
            if (profile?.tower) userTower = profile.tower;
          }
        }

        console.log("MATA-MATA 4 (Tower yang akan difilter):", userTower);

        // 3. Ambil data dari tabel 'informasi' umum bawaan kamu
        const { data: infoData, error: infoError } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true);
        
        if (infoError) throw infoError;

        // 4. Ambil data dari tabel 'notifications' rekap broadcast (Sesuai Skemamu)
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_active', true)
          .or(`target_tower.eq.Semua Penghuni, target_tower.eq.${userTower}`);

        if (notifError) {
          console.error("MATA-MATA 5 (Gagal ambil tabel notifications):", notifError.message);
        }

        // 5. Gabungkan kedua data ke dalam satu list
        const combined = [
          ...(infoData || []).map(item => ({
            id: `info-${item.id}`,
            category: item.kategori || 'Info',
            title: item.judul || 'Pengumuman Resmi',
            description: item.deskripsi || '',
            timestamp: new Date(item.created_at).getTime(),
            date: new Date(item.created_at).toLocaleDateString('id-ID', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })
          })),
          ...(notifData || []).map(item => ({
            id: `notif-${item.id}`,
            category: item.priority || 'Darurat', 
            title: item.title || 'Pesan Broadcast',
            description: item.message || '',
            timestamp: new Date(item.created_at).getTime(),
            date: new Date(item.created_at).toLocaleDateString('id-ID', { 
              day: 'numeric', month: 'short', year: 'numeric' 
            })
          }))
        ];

        // Urutkan dari yang paling baru
        combined.sort((a, b) => b.timestamp - a.timestamp);
        setAnnouncements(combined);

=======
        
        // 🛠️ MEMPERBAIKI SOURCE: Mengambil langsung dari tabel 'broadcast_pesan'
        const { data, error } = await supabase
          .from('broadcast_pesan')
          .select('*');
        
        if (error) throw error;
        
        // 🛠️ MENYESUAIKAN KOLOM: id, judul, isi (deskripsi), dan target/kategori
        const mapped = (data || []).map(item => ({
          id: item.id,
          category: item.target || 'Info', // Menggunakan kolom 'target' sebagai pengelompokan kategori
          title: item.judul || 'Pengumuman Resmi', // Menggunakan kolom 'judul'
          description: item.isi || '', // Menggunakan kolom 'isi'
          date: item.created_at 
            ? new Date(item.created_at).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
            : 'Baru Saja'
        }));
        setAnnouncements(mapped);
>>>>>>> bc552b99346d604c2d2e299dd1eace85ba4b18e5
      } catch (err) {
        console.error('Gagal memuat papan informasi:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

<<<<<<< HEAD
  // Styling badge
=======
  // Styling badge kategori agar kontras dan mudah dibaca
>>>>>>> bc552b99346d604c2d2e299dd1eace85ba4b18e5
  const getBadgeStyles = (category) => {
    switch (String(category).toLowerCase()) {
      case 'darurat':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
      case 'semua penghuni': // Menangani jika teks target berisi 'Semua Penghuni'
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promo':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'peraturan':
        return 'bg-zinc-800 text-white border-zinc-900';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

<<<<<<< HEAD
=======
  // Filter pencarian & kategori aman (Case-Insensitive)
>>>>>>> bc552b99346d604c2d2e299dd1eace85ba4b18e5
  const filteredAnnouncements = announcements.filter(item => {
    const titleText = item.title ? String(item.title).toLowerCase() : '';
    const descText = item.description ? String(item.description).toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();

    const matchSearch = titleText.includes(searchLower) || descText.includes(searchLower);
    
    // Jika filter tab 'Semua' diklik, loloskan semua data. Jika tidak, samakan dengan kolom kategori/target.
    const matchCategory = 
      activeCategory === 'Semua' || 
      String(item.category).toLowerCase().includes(activeCategory.toLowerCase());
      
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-fade-up text-zinc-800">
      {/* Search & Filter */}
      <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="absolute left-3.5 text-zinc-400 pointer-events-none" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci pengumuman..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition border ${
                activeCategory === cat
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-zinc-50 text-zinc-500 border-zinc-200/60 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-5 flex items-center gap-1.5 border-b border-zinc-100 pb-3.5">
          <Bell size={15} className="text-zinc-500" />
          <span>Arsip Pengumuman Resmi Pengelola</span>
        </h3>

        <div className="divide-y divide-zinc-100">
<<<<<<< HEAD
          {filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start gap-3 md:gap-6">
=======
          {loading ? (
            <div className="text-center py-12 text-zinc-400 font-semibold text-xs animate-pulse">
              Sedang mengunduh data pengumuman...
            </div>
          ) : filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start gap-3 md:gap-6"
            >
              {/* Kolom Kategori/Target & Tanggal Rilis */}
>>>>>>> bc552b99346d604c2d2e299dd1eace85ba4b18e5
              <div className="flex-shrink-0 w-24 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getBadgeStyles(ann.category)}`}>
                  {ann.category}
                </span>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide md:mt-1">
                  {ann.date}
                </span>
              </div>

              <div className="space-y-1 flex-1 text-xs">
                <h4 className="font-bold text-zinc-900 leading-snug tracking-wide">
                  {ann.title}
                </h4>
                <p className="text-zinc-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {ann.description}
                </p>
              </div>
            </div>
          ))}

          {!loading && filteredAnnouncements.length === 0 && (
            <div className="text-center py-12 text-zinc-400 font-semibold text-xs border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              Tidak ada pengumuman resmi yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}