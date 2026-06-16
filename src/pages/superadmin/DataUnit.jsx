import React, { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataUnit() {
  const [units, setUnits] = useState([]);
  const [towers, setTowers] = useState([]);

  const [towerFilter, setTowerFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [newUnit, setNewUnit] = useState({
    noUnit: '',
    tower: '',
    floor: '',
    size: '',
    status: 'Kosong'
  });

  const loadData = async () => {
    try {
      const { data: unitData } = await supabase
        .from('unit')
        .select('*, tower(nama_tower), penghuni:users!penghuni_id(nama)')
        .order('nomor_unit');

      if (unitData) {
        setUnits(unitData.map(u => ({
          id: u.id,
          noUnit: u.nomor_unit,
          tower: u.tower?.nama_tower || '—',
          floor: `Lt. ${u.lantai}`,
          size: `${u.luas} m²`,
          resident: u.penghuni?.nama || '—',
          status: u.status === 'dihuni' ? 'Dihuni' : 'Kosong',
          ipl: `Rp ${(u.luas * 18000).toLocaleString('id-ID')}`
        })));
      }

      const { data: towerData } = await supabase
        .from('tower')
        .select('id, nama_tower')
        .order('nama_tower');
      if (towerData) {
        setTowers(towerData);
        if (towerData.length > 0 && !newUnit.tower) {
          setNewUnit(prev => ({ ...prev, tower: towerData[0].nama_tower }));
        }
      }
    } catch (err) {
      console.error('Error loading unit data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.noUnit || !newUnit.floor || !newUnit.size) return;

    const matchedTower = towers.find(t => t.nama_tower === newUnit.tower);
    if (!matchedTower) return;

    const formData = {
      nomor_unit: newUnit.noUnit,
      tower_id: matchedTower.id,
      lantai: parseInt(newUnit.floor),
      luas: parseInt(newUnit.size),
      status: newUnit.status.toLowerCase(),
      penghuni_id: null
    };

    try {
      const { error } = await supabase
        .from('unit')
        .insert(formData);

      if (error) throw error;

      setModalOpen(false);
      setNewUnit({ noUnit: '', tower: towers[0]?.nama_tower || '', floor: '', size: '', status: 'Kosong' });
      loadData();
    } catch (err) {
      console.error('Error adding unit:', err.message);
    }
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
              {towers.map(t => (
                <option key={t.id} value={t.nama_tower}>{t.nama_tower}</option>
              ))}
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

          {/* SEARCH BOX FIXED (Menggunakan Inline Style untuk memaksa posisi) */}
          <div className="relative flex items-center" style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Cari unit atau penghuni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern font-semibold w-full"
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '40px', // Ruang agar teks tidak menimpa ikon
                borderRadius: '99px' 
              }}
            />
            <Search 
              className="text-muted" 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '15px',      // Ikon dikunci di kanan
                left: 'auto',       // Menghapus paksa settingan CSS global
                pointerEvents: 'none' 
              }} 
            />
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
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
                {/* HEAD AKSI TENGAH */}
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
                    {/* ISI AKSI TENGAH */}
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="text-ink hover:underline font-bold text-xs"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
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

      {/* Modal Add Unit tetap seperti kode asli Anda */}
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
                    {towers.map(t => (
                      <option key={t.id} value={t.nama_tower}>{t.nama_tower}</option>
                    ))}
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