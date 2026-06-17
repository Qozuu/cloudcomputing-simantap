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
        // Mengambil data dari tabel 'informasi' sesuai dengan nama tabel database Anda
        const { data, error } = await supabase
          .from('informasi')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const mapped = (data || []).map(item => ({
          id: item.id,
          category: item.kategori || 'Info',
          title: item.judul || 'Pengumuman Resmi',
          description: item.deskripsi || '',
          date: new Date(item.created_at).toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })
        }));
        setAnnouncements(mapped);
      } catch (err) {
        console.error('Gagal memuat papan informasi/pengumuman:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Styling badge yang disesuaikan dengan skema warna modern & bersih
  const getBadgeStyles = (category) => {
    switch (category.toLowerCase()) {
      case 'darurat':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'promo':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'peraturan':
        return 'bg-zinc-800 text-white border-zinc-900';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  // Filter pencarian dengan proteksi case-insensitive agar tidak meleset saat demo
  const filteredAnnouncements = announcements.filter(item => {
    const matchSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = 
      activeCategory === 'Semua' || 
      item.category.toLowerCase() === activeCategory.toLowerCase();
      
    return matchSearch && matchCategory;
  });

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat Papan Informasi...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up text-zinc-800">
      
      {/* Search & Filter Header Kontrol */}
      <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-sm">
        
        {/* Input Pencarian */}
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="absolute left-3.5 text-zinc-450 pointer-events-none" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci pengumuman..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition font-medium"
          />
        </div>

        {/* Filter Kategori Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
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

      {/* Kontainer Utama List View Pengumuman */}
      <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider mb-5 flex items-center gap-1.5 border-b border-zinc-100 pb-3.5">
          <Bell size={15} className="text-zinc-500" />
          <span>Arsip Pengumuman Resmi Pengelola</span>
        </h3>

        <div className="divide-y divide-zinc-100">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start gap-3 md:gap-6"
            >
              {/* Kolom Kategori & Tanggal Rilis */}
              <div className="flex-shrink-0 w-24 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getBadgeStyles(ann.category)}`}>
                  {ann.category}
                </span>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide md:mt-1">
                  {ann.date}
                </span>
              </div>

              {/* Isi Konten Informasi */}
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

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-12 text-zinc-400 font-semibold text-xs border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              Tidak ada pengumuman resmi yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}