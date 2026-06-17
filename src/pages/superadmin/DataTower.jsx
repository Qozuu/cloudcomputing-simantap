import React, { useState, useEffect } from 'react';
import { Building2, Info, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataTower() {
  const [towers, setTowers] = useState([]);

  // Modal States (Hanya menyisakan Detail Modal)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);

  const loadTowers = async () => {
    try {
      const { data } = await supabase
        .from('tower')
        .select('*, unit(count)')
        .order('nama_tower');

      if (data) {
        const { data: allUnits } = await supabase
          .from('unit')
          .select('tower_id, status');

        setTowers(data.map(t => {
          const towerUnits = allUnits?.filter(u => u.tower_id === t.id) || [];
          const totalUnits = t.unit?.[0]?.count ?? t.unit?.count ?? towerUnits.length ?? 0;
          const activeUnits = towerUnits.filter(u => u.status === 'dihuni' || u.status === 'Dihuni').length;
          const emptyUnits = totalUnits - activeUnits;
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
    }
  };

  useEffect(() => {
    loadTowers();
  }, []);

  // Open Detail Modal
  const openDetail = (tower) => {
    setSelectedTower(tower);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header controls (Tombol Tambah Tower SUDAH DIHAPUS) */}
      <div className="card-section p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Data Tower / Gedung</h2>
          <p className="text-xs text-muted">
            Total {towers.length} Tower · {towers.reduce((a, b) => a + b.totalUnits, 0)} unit terintegrasi
          </p>
        </div>
      </div>

      {/* Tower Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {towers.map((tower, idx) => {
          const sectionClasses = ['card-section-pink', 'card-section-yellow', 'card-section-lavender', 'card-section-mint'];
          const cardClass = sectionClasses[idx % 4];
          return (
            <div key={tower.id} className={`${cardClass} flex flex-col justify-between hover:translate-y-[-2px] transition duration-200`}>
              {/* Card Header */}
              <div className="p-5 text-ink flex items-center justify-between border-b border-soft">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1E1E1E]">{tower.name}</h3>
                  <p className="text-[10px] text-[#8A857F] font-bold uppercase tracking-wider">
                    {tower.floors} Lantai · {tower.totalUnits} Unit
                  </p>
                </div>
                <Building2 size={24} className="text-[#8A857F] opacity-60 stroke-[2.5]" />
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[#8A857F] font-semibold text-xs mb-1.5">Unit Pembeli</p>
                    <p className="text-base font-extrabold text-[#1E1E1E]">{tower.activeUnits}</p>
                  </div>
                  <div>
                    <p className="text-[#8A857F] font-semibold text-xs mb-1.5">Okupansi</p>
                    <p className="text-base font-extrabold text-[#1E1E1E]">{tower.occupancy}%</p>
                  </div>
                  <div>
                    <p className="text-[#8A857F] font-semibold text-xs mb-1.5">Kosong</p>
                    <p className="text-base font-extrabold text-[#B85040]">{tower.emptyUnits}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Buttons (Hanya menyisakan tombol Detail dengan lebar penuh W-FULL) */}
              <div className="border-t border-soft px-5 py-3.5 flex justify-between gap-3">
                <button 
                  onClick={() => openDetail(tower)}
                  className="w-full py-2 text-center text-xs font-bold btn-ghost justify-center rounded-xl transition duration-150 border border-gray-200 hover:bg-gray-50"
                >
                  Detail
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Tower (Daftar Penghuni SUDAH DIHAPUS) */}
      {detailModalOpen && selectedTower && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Rincian Informasi {selectedTower.name}</h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted hover:text-ink transition">
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            <div className="modal-body space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl space-y-1 border border-gray-100">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Deskripsi Wilayah</span>
                <p className="text-xs text-gray-700 font-semibold leading-relaxed">{selectedTower.desc || 'Tidak ada deskripsi tambahan.'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <BarChart3 size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Statistik Infrastruktur</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-muted font-semibold">Total Lantai:</span>
                    <span className="font-bold text-ink">{selectedTower.floors} Lantai</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-muted font-semibold">Total Kapasitas:</span>
                    <span className="font-bold text-ink">{selectedTower.totalUnits} Unit</span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center">
                    <span className="text-emerald-700 font-semibold">Unit Dihuni:</span>
                    <span className="font-bold text-emerald-700">{selectedTower.activeUnits} Unit</span>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex justify-between items-center">
                    <span className="text-amber-700 font-semibold">Sisa Kosong:</span>
                    <span className="font-bold text-amber-700">{selectedTower.emptyUnits} Unit</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={() => setDetailModalOpen(false)} 
                  className="w-full btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold border border-gray-200"
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