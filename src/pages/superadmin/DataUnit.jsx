import React, { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Gunakan export default di sini agar bisa di-import tanpa {}
export default function DataUnit() {
  const [units, setUnits] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [towerFilter, setTowerFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: unitData } = await supabase
        .from('unit')
        .select('*, tower(nama_tower)')
        .order('nomor_unit');

      const { data: penghuniData } = await supabase
        .from('penghuni')
        .select('unit_id, nama, email');

      if (unitData) {
        const processed = unitData.map(u => {
          const p = penghuniData?.find(item => item.unit_id === u.id);
          let residentName = '—';
          let isMissing = false;

          if (p) {
            residentName = p.nama || (p.email ? p.email.split('@')[0] : '—');
          } else if (u.status?.toLowerCase() === 'dihuni') {
            residentName = 'Belum Diinput';
            isMissing = true;
          }

          return {
            id: u.id,
            noUnit: u.nomor_unit,
            tower: u.tower?.nama_tower || '—',
            resident: residentName,
            isMissing: isMissing,
            status: u.status === 'dihuni' ? 'Dihuni' : u.status === 'maintenance' ? 'Maintenance' : 'Kosong',
            ipl: `Rp ${((u.luas_m2 || 0) * 18000).toLocaleString('id-ID')}`
          };
        });
        setUnits(processed);
      }

      const { data: towerData } = await supabase.from('tower').select('id, nama_tower').order('nama_tower');
      if (towerData) setTowers(towerData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = units.filter(u => {
    const mTower = towerFilter === 'Semua' || u.tower === towerFilter;
    const mStatus = statusFilter === 'Semua' || u.status === statusFilter;
    const mSearch = u.noUnit.toLowerCase().includes(searchQuery.toLowerCase()) || u.resident.toLowerCase().includes(searchQuery.toLowerCase());
    return mTower && mStatus && mSearch;
  });

  return (
    <div className="space-y-6">
      {/* ... (UI Anda tetap sama seperti sebelumnya) ... */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <table className="w-full text-left text-xs">
           <thead className="bg-[#FAF9F7] border-b">
             <tr>
               {['No. Unit', 'Tower', 'Penghuni', 'Status', 'IPL'].map(h => <th key={h} className="p-4 font-black uppercase">{h}</th>)}
             </tr>
           </thead>
           <tbody className="divide-y">
             {loading ? <tr><td colSpan={5} className="p-10 text-center">Memuat...</td></tr> : filtered.map(r => (
               <tr key={r.id} className="hover:bg-gray-50">
                 <td className="p-4 font-bold">{r.noUnit}</td>
                 <td className="p-4 text-gray-500">{r.tower}</td>
                 <td className={`p-4 font-black ${r.isMissing ? 'text-red-600 italic flex items-center gap-1' : ''}`}>
                   {r.isMissing && <AlertCircle size={12} />}
                   {r.resident}
                 </td>
                 <td className="p-4">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold ${r.status === 'Dihuni' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>{r.status}</span>
                 </td>
                 <td className="p-4 font-mono">{r.ipl}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}