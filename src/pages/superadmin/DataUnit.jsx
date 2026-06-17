import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function DataUnit() {
  const [units, setUnits] = useState([]);
  const [towers, setTowers] = useState([]);

  const [towerFilter, setTowerFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

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
      }
    } catch (err) {
      console.error('Error loading unit data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

          {/* SEARCH BOX FIXED */}
          <div className="relative flex items-center" style={{ minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Cari unit atau penghuni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern font-semibold w-full"
              style={{ 
                paddingLeft: '16px', 
                paddingRight: '40px', 
                borderRadius: '99px' 
              }}
            />
            <Search 
              className="text-muted" 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '15px',      
                left: 'auto',       
                pointerEvents: 'none' 
              }} 
            />
          </div>
        </div>
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
    </div>
  );
}