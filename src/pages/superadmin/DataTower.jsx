import React, { useState, useEffect } from 'react';
import { Building2, Info, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);

  const loadTowers = async () => {
    try {
      setLoading(true);
      
      // SATU QUERY UNTUK SEMUA: Mengambil data tower beserta seluruh data unit di dalamnya
      const { data, error } = await supabase
        .from('tower')
        .select(`
          id,
          nama_tower,
          alamat,
          jumlah_lantai,
          unit (
            id,
            status
          )
        `)
        .order('nama_tower');

      if (error) throw error;

      if (data) {
        setTowers(data.map(t => {
          // Ambil array unit dari tower ini (jika tidak ada, default array kosong)
          const towerUnits = t.unit || [];
          
          // 1. Total Unit dihitung dari jumlah baris unit yang terikat ke tower_id ini
          const totalUnits = towerUnits.length;
          
          // 2. Unit Pembeli (Dihuni) mencocokkan status 'dihuni' (case-insensitive)
          const activeUnits = towerUnits.filter(u => 
            u.status?.toLowerCase() === 'dihuni'
          ).length;
          
          // 3. Sisa unit kosong
          const emptyUnits = totalUnits - activeUnits;
          
          // 4. Persentase Okupansi Gedung
          const occupancy = totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0;

          return {
            id: t.id,
            name: t.nama_tower,
            floors: t.jumlah_lantai,
            totalUnits,
            activeUnits,
            occupancy,
            emptyUnits,
            desc: t.alamat || 'Tidak ada keterangan tambahan.'
          };
        }));
      }
    } catch (err) {
      console.error('Error loading towers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTowers();
  }, []);

  const openDetail = (tower) => {
    setSelectedTower(tower);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header controls */}
      <div className="card-section p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-gray-900 tracking-tight">Data Tower / Gedung</h2>
          <p className="text-xs font-bold text-gray-400 mt-0.5">
            Total {towers.length} Tower · {towers.reduce((a, b) => a + b.totalUnits, 0)} unit terintegrasi
          </p>
        </div>
      </div>

      {/* Tower Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center p-12 text-xs font-bold text-gray-400 animate-pulse">
            Mengkalkulasi statistik okupansi tower...
          </div>
        ) : towers.length > 0 ? (
          towers.map((tower, idx) => {
            const sectionClasses = ['card-section-pink', 'card-section-yellow', 'card-section-lavender', 'card-section-mint'];
            const cardClass = sectionClasses[idx % 4] || 'bg-white';
            
            return (
              <div key={tower.id} className={`${cardClass} flex flex-col justify-between rounded-xl border border-gray-100 shadow-sm hover:translate-y-[-2px] transition duration-200 bg-white`}>
                {/* Card Header */}
                <div className="p-5 text-gray-900 flex items-center justify-between border-b border-gray-100">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-gray-900">{tower.name}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                      {tower.floors} Lantai · {tower.totalUnits} Unit
                    </p>
                  </div>
                  <Building2 size={22} className="text-gray-400 opacity-60 stroke-[2.5]" />
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 font-bold text-[11px] mb-1.5 uppercase tracking-wide">Unit Dihuni</p>
                      <p className="text-base font-black text-gray-900">{tower.activeUnits}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold text-[11px] mb-1.5 uppercase tracking-wide">Okupansi</p>
                      <p className="text-base font-black text-indigo-600">{tower.occupancy}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold text-[11px] mb-1.5 uppercase tracking-wide">Sisa Kosong</p>
                      <p className="text-base font-black text-amber-600">{tower.emptyUnits}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Buttons */}
                <div className="border-t border-gray-100 px-5 py-3.5">
                  <button 
                    onClick={() => openDetail(tower)}
                    className="w-full py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition duration-150 border border-gray-200"
                  >
                    Detail
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 p-12 text-center text-gray-400 font-bold italic text-xs">
            Tidak ada data gedung yang terdaftar di database.
          </div>
        )}
      </div>

      {/* Modal Detail Tower */}
      {detailModalOpen && selectedTower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Rincian Informasi {selectedTower.name}</h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-xl font-bold transition leading-none">
                &times;
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl space-y-1 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Alamat / Lokasi</span>
                <p className="text-xs text-gray-700 font-bold leading-relaxed">{selectedTower.desc}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <BarChart3 size={14} />
                  <span className="text-[11px] font-black uppercase tracking-wider">Statistik Infrastruktur</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-gray-500 font-bold">Total Lantai:</span>
                    <span className="font-black text-gray-900">{selectedTower.floors} Lantai</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-gray-500 font-bold">Total Kapasitas:</span>
                    <span className="font-black text-gray-900">{selectedTower.totalUnits} Unit</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center">
                    <span className="text-emerald-700 font-bold">Unit Dihuni:</span>
                    <span className="font-black text-emerald-800">{selectedTower.activeUnits} Unit</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center">
                    <span className="text-amber-700 font-bold">Sisa Kosong:</span>
                    <span className="font-black text-amber-800">{selectedTower.emptyUnits} Unit</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => setDetailModalOpen(false)} 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}