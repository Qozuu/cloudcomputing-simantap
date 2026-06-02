import React, { useState } from 'react';
import { Bell, Search, Filter } from 'lucide-react';

export default function Pengumuman() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Darurat', 'Info', 'Promo', 'Peraturan'];

  const list = [
    {
      category: 'Darurat',
      title: 'Pemadaman Listrik Tower B',
      description: 'Pemadaman terjadwal Selasa 22 Apr pukul 09:00-12:00 untuk perbaikan panel utama lantai B2. Penghuni dimohon mempersiapkan kebutuhan sebelumnya.',
      date: '21 Apr 2026'
    },
    {
      category: 'Info',
      title: 'Kolam Renang Kembali Dibuka',
      description: 'Setelah perawatan rutin selama 3 hari, kolam renang kembali beroperasi normal mulai Senin 21 April 2026.',
      date: '20 Apr 2026'
    },
    {
      category: 'Promo',
      title: 'Promo Sewa Ruang Serbaguna',
      description: 'Diskon 30% untuk pemesanan Ruang Serbaguna di bulan April 2026. Hubungi admin untuk reservasi.',
      date: '18 Apr 2026'
    },
    {
      category: 'Peraturan',
      title: 'Peraturan Parkir Baru Berlaku',
      description: 'Mulai 1 Mei 2026, setiap kendaraan wajib memiliki stiker parkir resmi dari pengelola. Pendaftaran di kantor pengelola.',
      date: '15 Apr 2026'
    }
  ];

  const getBadgeStyles = (category) => {
    switch (category) {
      case 'Darurat':
        return 'badge-base badge-pink';
      case 'Info':
        return 'badge-base badge-lavender';
      case 'Promo':
        return 'badge-base badge-yellow';
      case 'Peraturan':
        return 'badge-base badge-dark';
      default:
        return 'badge-base badge-gray';
    }
  };

  const filteredAnnouncements = list.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Search & Filter Header */}
      <div className="card-section p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pengumuman..."
            className="input-modern pl-9"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                activeCategory === cat
                  ? 'bg-active text-white shadow-soft'
                  : 'bg-app-bg text-muted hover:bg-app-bg/85'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clean list view */}
      <div className="card-section p-6">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-6 flex items-center gap-1.5 border-b border-soft pb-4">
          <Bell size={16} />
          <span>Arsip Pengumuman Resmi</span>
        </h3>

        <div className="divide-y divide-soft">
          {filteredAnnouncements.map((ann, idx) => (
            <div
              key={idx}
              className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start gap-4"
            >
              {/* Left category badge */}
              <div className="flex-shrink-0 w-24">
                <span className={`inline-block ${getBadgeStyles(ann.category)}`}>
                  {ann.category}
                </span>
                <span className="block text-[9px] font-bold text-muted uppercase tracking-widest mt-2">
                  {ann.date}
                </span>
              </div>

              {/* Right content */}
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-ink leading-snug">
                  {ann.title}
                </h4>
                <p className="text-xs text-muted font-medium leading-relaxed">
                  {ann.description}
                </p>
              </div>
            </div>
          ))}

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-10 text-muted font-bold text-xs">
              Tidak ada pengumuman yang sesuai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
