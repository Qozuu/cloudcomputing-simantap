import React, { useState } from 'react';
import { Plus, X, Building2, Info, Edit3, CheckCircle, BarChart3, Users } from 'lucide-react';

export default function DataTower() {
  const [towers, setTowers] = useState([
    {
      id: 1,
      name: 'Tower A',
      floors: 22,
      totalUnits: 176,
      activeUnits: 168,
      occupancy: 95,
      emptyUnits: 8,
      residents: 'Hendra Gunawan, Maya Sari, Dewi Lestari, Rian Kurniawan, Budi Santoso',
      desc: 'Sektor Utama - Dekat fasilitas kolam renang dan lobi utama'
    },
    {
      id: 2,
      name: 'Tower B',
      floors: 20,
      totalUnits: 160,
      activeUnits: 152,
      occupancy: 95,
      emptyUnits: 8,
      residents: 'Rudi Hartono, Anita Kusuma, Agus Wijaya, Siti Rahma, Doni Putra',
      desc: 'Sektor Barat - Akses langsung ke gedung parkir bertingkat B'
    },
    {
      id: 3,
      name: 'Tower C',
      floors: 14,
      totalUnits: 104,
      activeUnits: 92,
      occupancy: 88,
      emptyUnits: 12,
      residents: 'Dewi Permata, Rina Kurnia, Eko Prasetyo, Bima Sakti, Lina Karlina',
      desc: 'Sektor Timur - Dekat area komersial dan taman bermain anak'
    }
  ]);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Selected Tower State for Detail & Edit
  const [selectedTower, setSelectedTower] = useState(null);

  // Form States
  const [newTower, setNewTower] = useState({ name: '', floors: '', totalUnits: '', desc: '' });
  const [editFormData, setEditFormData] = useState({ name: '', floors: '', totalUnits: '', desc: '' });

  // Handle Add Tower
  const handleAddTower = (e) => {
    e.preventDefault();
    if (!newTower.name || !newTower.floors || !newTower.totalUnits) return;

    const floorNum = parseInt(newTower.floors);
    const unitNum = parseInt(newTower.totalUnits);
    const simulatedActive = Math.floor(unitNum * 0.9);

    const added = {
      id: Date.now(),
      name: newTower.name,
      floors: floorNum,
      totalUnits: unitNum,
      activeUnits: simulatedActive,
      occupancy: 90,
      emptyUnits: unitNum - simulatedActive,
      residents: 'Belum ada penghuni baru terdaftar...',
      desc: newTower.desc || 'Tidak ada keterangan tambahan.'
    };

    setTowers(prev => [added, ...prev]);
    setModalOpen(false);
    setNewTower({ name: '', floors: '', totalUnits: '', desc: '' });
  };

  // Open Detail Modal
  const openDetail = (tower) => {
    setSelectedTower(tower);
    setDetailModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (tower) => {
    setSelectedTower(tower);
    setEditFormData({
      name: tower.name,
      floors: tower.floors,
      totalUnits: tower.totalUnits,
      desc: tower.desc || ''
    });
    setEditModalOpen(true);
  };

  // Handle Update/Save Edit Tower
  const handleUpdateTower = (e) => {
    e.preventDefault();
    setTowers(prev => prev.map(t => {
      if (t.id === selectedTower.id) {
        const totalUnits = parseInt(editFormData.totalUnits);
        // Menjaga agar unit aktif tidak melebihi kapasitas total unit baru
        const activeUnits = t.activeUnits > totalUnits ? totalUnits : t.activeUnits;
        const emptyUnits = totalUnits - activeUnits;
        const occupancy = totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0;

        return {
          ...t,
          name: editFormData.name,
          floors: parseInt(editFormData.floors),
          totalUnits,
          activeUnits,
          emptyUnits,
          occupancy,
          desc: editFormData.desc
        };
      }
      return t;
    }));
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header controls */}
      <div className="card-section p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Data Tower / Gedung</h2>
          <p className="text-xs text-muted">Total {towers.length} Tower · {towers.reduce((a, b) => a + b.totalUnits, 0)} unit terintegrasi</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>Tambah Tower</span>
        </button>
      </div>

      {/* Tower Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {towers.map((tower, idx) => {
          const sectionClasses = ['card-section-pink', 'card-section-yellow', 'card-section-lavender', 'card-section-mint'];
          const cardClass = sectionClasses[idx % 4];
          return (
            <div key={tower.id} className={`${cardClass} flex flex-col justify-between hover:translate-y-[-2px] transition duration-200`}>
              {/* Header */}
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
                <div className="grid grid-cols-3 gap-4 border-b border-soft pb-4 text-center">
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

                <div className="space-y-1">
                  <p className="text-[#8A857F] font-semibold text-xs">Daftar Penghuni Utama</p>
                  <p className="text-xs font-semibold text-muted truncate leading-relaxed">
                    {tower.residents}
                  </p>
                </div>
              </div>

              {/* Footer Buttons — Diperbaiki agar berfungsi */}
              <div className="border-t border-soft px-5 py-3.5 flex justify-between gap-3">
                <button 
                  onClick={() => openDetail(tower)}
                  className="flex-1 py-2 text-center text-xs font-bold btn-ghost justify-center rounded-xl transition duration-150 border border-gray-200 hover:bg-gray-50"
                >
                  Detail
                </button>
                <button 
                  onClick={() => openEdit(tower)}
                  className="flex-1 py-2 text-center text-xs font-bold btn-ghost justify-center rounded-xl transition duration-150 border border-gray-200 hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Add Tower Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Tower / Gedung</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTower} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Tower</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tower D"
                  value={newTower.name}
                  onChange={(e) => setNewTower(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jumlah Lantai</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 20"
                    value={newTower.floors}
                    onChange={(e) => setNewTower(prev => ({ ...prev, floors: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jumlah Unit</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 160"
                    value={newTower.totalUnits}
                    onChange={(e) => setNewTower(prev => ({ ...prev, totalUnits: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Keterangan / Deskripsi</label>
                <textarea
                  placeholder="Keterangan lokasi tower atau fasilitas internal..."
                  value={newTower.desc}
                  onChange={(e) => setNewTower(prev => ({ ...prev, desc: e.target.value }))}
                  rows={3}
                  className="textarea-modern"
                />
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold">
                  Tambah Tower
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Detail Tower (Baru) */}
      {detailModalOpen && selectedTower && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Rincian Informasi {selectedTower.name}</h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
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

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Users size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Daftar Penghuni Utama Terverifikasi</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-ink font-semibold leading-relaxed">{selectedTower.residents}</p>
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

      {/* 3. Modal Edit Tower (Baru) */}
      {editModalOpen && selectedTower && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Ubah Struktur {selectedTower.name}</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateTower} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Tower / Gedung</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jumlah Lantai</label>
                  <input
                    type="number"
                    required
                    value={editFormData.floors}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, floors: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Total Kapasitas Unit</label>
                  <input
                    type="number"
                    required
                    value={editFormData.totalUnits}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, totalUnits: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Keterangan Wilayah / Catatan Tambahan</label>
                <textarea
                  value={editFormData.desc}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, desc: e.target.value }))}
                  rows={3}
                  className="textarea-modern"
                />
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}