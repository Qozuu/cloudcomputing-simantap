import React, { useState } from 'react';
import { Plus, X, Search, Home, User, Layers, Maximize2, Banknote } from 'lucide-react';

export default function DataUnit() {
  const [units, setUnits] = useState([
    { id: 1, noUnit: '12A', tower: 'Tower A', floor: 'Lt. 12', size: '42 m²', resident: 'Hendra Gunawan', status: 'Dihuni', ipl: 'Rp 770.000' },
    { id: 2, noUnit: '05B', tower: 'Tower A', floor: 'Lt. 5', size: '36 m²', resident: 'Maya Sari', status: 'Dihuni', ipl: 'Rp 770.000' },
    { id: 3, noUnit: '03A', tower: 'Tower A', floor: 'Lt. 3', size: '28 m²', resident: '—', status: 'Kosong', ipl: 'Rp 770.000' },
    { id: 4, noUnit: '18C', tower: 'Tower B', floor: 'Lt. 18', size: '54 m²', resident: 'Rudi Hartono', status: 'Dihuni', ipl: 'Rp 770.000' },
    { id: 5, noUnit: '07A', tower: 'Tower A', floor: 'Lt. 7', size: '42 m²', resident: 'Dewi Lestari', status: 'Dihuni', ipl: 'Rp 770.000' }
  ]);

  const [towerFilter, setTowerFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [newUnit, setNewUnit] = useState({
    noUnit: '', tower: 'Tower A', floor: '', size: '', status: 'Kosong'
  });

  const openDetail = (unit) => {
    setSelectedUnit(unit);
    setDetailOpen(true);
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnit.noUnit || !newUnit.floor || !newUnit.size) return;
    const added = {
      id: Date.now(),
      noUnit: newUnit.noUnit,
      tower: newUnit.tower,
      floor: `Lt. ${newUnit.floor}`,
      size: `${newUnit.size} m²`,
      resident: newUnit.status === 'Dihuni' ? 'Penghuni Baru' : '—',
      status: newUnit.status,
      ipl: 'Rp 770.000'
    };
    setUnits(prev => [added, ...prev]);
    setModalOpen(false);
    setNewUnit({ noUnit: '', tower: 'Tower A', floor: '', size: '', status: 'Kosong' });
  };

  const filteredUnits = units.filter(unit => {
    const matchesTower = towerFilter === 'Semua' || unit.tower === towerFilter;
    const matchesStatus = statusFilter === 'Semua' || unit.status === statusFilter;
    const matchesSearch =
      unit.noUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.resident.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTower && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Filters and Search Row */}
      <div className="card-section p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Tower:</span>
            <select
              value={towerFilter}
              onChange={(e) => setTowerFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-1 px-3 w-32"
            >
              <option value="Semua">Semua Tower</option>
              <option value="Tower A">Tower A</option>
              <option value="Tower B">Tower B</option>
              <option value="Tower C">Tower C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-1 px-3 w-32"
            >
              <option value="Semua">Semua Status</option>
              <option value="Dihuni">Dihuni</option>
              <option value="Kosong">Kosong</option>
            </select>
          </div>

          <div className="relative flex items-center" style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Cari unit atau penghuni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern font-semibold w-full"
              style={{ paddingLeft: '16px', paddingRight: '40px', borderRadius: '99px' }}
            />
            <Search
              className="text-muted"
              size={16}
              style={{ position: 'absolute', right: '15px', left: 'auto', pointerEvents: 'none' }}
            />
          </div>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs font-bold">
          <Plus size={14} />
          <span>Tambah Unit</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="table-wrap">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="text-left">No. Unit</th>
                <th className="text-left">Tower</th>
                <th className="text-left">Lantai</th>
                <th className="text-left">Luas</th>
                <th className="text-left">Penghuni</th>
                <th className="text-left">Status</th>
                <th className="text-left">IPL / Bulan</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length > 0 ? (
                filteredUnits.map((row) => (
                  <tr key={row.id}>
                    <td className="font-bold text-ink">{row.noUnit}</td>
                    <td className="text-muted">{row.tower}</td>
                    <td className="text-ink font-semibold">{row.floor}</td>
                    <td className="text-muted font-mono">{row.size}</td>
                    <td className="text-ink font-bold">{row.resident}</td>
                    <td>
                      <span className={`badge-base ${row.status === 'Dihuni' ? 'badge-mint' : 'badge-gray'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="text-ink font-bold font-mono">{row.ipl}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openDetail(row)}
                        className="text-[10px] font-black uppercase text-ink hover:underline tracking-tighter"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted font-bold">
                    Tidak ada unit yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Unit */}
      {detailOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="relative h-24 bg-[#EAE6E1]">
              <button
                onClick={() => setDetailOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-all"
              >
                <X size={16} />
              </button>
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                <Home size={32} className="text-[#C8C2BC]" />
              </div>
            </div>

            <div className="pt-14 p-8 space-y-6">
              <div>
                <h4 className="text-lg font-black text-ink tracking-tight">Unit {selectedUnit.noUnit}</h4>
                <p className="text-xs font-bold text-muted flex items-center gap-1.5 mt-1">
                  <Layers size={12} /> {selectedUnit.tower} — {selectedUnit.floor}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Penghuni</p>
                    <p className="text-xs font-bold text-ink">{selectedUnit.resident}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Maximize2 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Luas Unit</p>
                    <p className="text-xs font-bold text-ink">{selectedUnit.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Banknote size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">IPL / Bulan</p>
                    <p className="text-xs font-bold text-ink">{selectedUnit.ipl}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F7F5] flex items-center justify-center text-muted">
                    <Home size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#C8C2BC] uppercase tracking-widest">Status Unit</p>
                    <span className={`badge-base mt-1 inline-block ${selectedUnit.status === 'Dihuni' ? 'badge-mint' : 'badge-gray'}`}>
                      {selectedUnit.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailOpen(false)}
                className="w-full btn-primary py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Unit */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Unit Apartemen</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUnit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">No. Unit</label>
                  <input
                    type="text"
                    required
                    value={newUnit.noUnit}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, noUnit: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Tower</label>
                  <select
                    value={newUnit.tower}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, tower: e.target.value }))}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Tower A">Tower A</option>
                    <option value="Tower B">Tower B</option>
                    <option value="Tower C">Tower C</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Lantai</label>
                  <input
                    type="number"
                    required
                    value={newUnit.floor}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, floor: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Luas (m²)</label>
                  <input
                    type="number"
                    required
                    value={newUnit.size}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, size: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="label-modern">Status Unit</label>
                <select
                  value={newUnit.status}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, status: e.target.value }))}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Kosong">Kosong</option>
                  <option value="Dihuni">Dihuni</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold">
                  Tambah Unit
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold border border-gray-200">
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