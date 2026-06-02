import React, { useState } from 'react';
import { Plus, X, Building2 } from 'lucide-react';

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
      residents: 'Hendra G., Maya S., Dewi L., Rian K., Budi S.'
    },
    {
      id: 2,
      name: 'Tower B',
      floors: 20,
      totalUnits: 160,
      activeUnits: 152,
      occupancy: 95,
      emptyUnits: 8,
      residents: 'Rudi H., Anita K., Agus W., Siti R., Doni P.'
    },
    {
      id: 3,
      name: 'Tower C',
      floors: 14,
      totalUnits: 104,
      activeUnits: 92,
      occupancy: 88,
      emptyUnits: 12,
      residents: 'Dewi P., Rina K., Eko P., Bima R., Lina K.'
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTower, setNewTower] = useState({
    name: '',
    floors: '',
    totalUnits: '',
    desc: ''
  });

  const handleAddTower = (e) => {
    e.preventDefault();
    if (!newTower.name || !newTower.floors || !newTower.totalUnits) return;

    const floorNum = parseInt(newTower.floors);
    const unitNum = parseInt(newTower.totalUnits);

    const added = {
      id: Date.now(),
      name: newTower.name,
      floors: floorNum,
      totalUnits: unitNum,
      activeUnits: Math.floor(unitNum * 0.9), // simulate 90% active
      occupancy: 90,
      emptyUnits: unitNum - Math.floor(unitNum * 0.9),
      residents: 'Belum ada penghuni baru terdaftar...'
    };

    setTowers(prev => [added, ...prev]);
    setModalOpen(false);
    setNewTower({ name: '', floors: '', totalUnits: '', desc: '' });
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
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
          <Plus size={16} />
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
                    <p className="text-[#8A857F] font-semibold text-xs mb-1.5">Unit Aktif</p>
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

              {/* Footer Buttons */}
              <div className="border-t border-soft px-5 py-3.5 flex justify-between gap-3">
                <button className="flex-1 py-2 text-center text-xs font-bold btn-ghost justify-center rounded-xl transition duration-150">
                  Detail
                </button>
                <button className="flex-1 py-2 text-center text-xs font-bold btn-ghost justify-center rounded-xl transition duration-150">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Tower Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Tower / Gedung</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
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
                <label className="label-modern">Alamat / Keterangan</label>
                <textarea
                  placeholder="Keterangan lokasi tower"
                  value={newTower.desc}
                  onChange={(e) => setNewTower(prev => ({ ...prev, desc: e.target.value }))}
                  rows={3}
                  className="textarea-modern"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Tambah Tower
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
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
