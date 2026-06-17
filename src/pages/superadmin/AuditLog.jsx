import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk manajemen filter data
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        
        // Menyelaraskan query ke nama tabel & constraint foreign key yang benar
        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            id,
            action,
            module,
            description,
            created_at,
            action_type,
            users!audit_logs_user_id_fkey (
              nama,
              role
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (data && data.length > 0) {
          setLogs(data.map(log => {
            const dateObj = new Date(log.created_at);
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            
            let divName = 'Sistem';
            let bgClass = 'bg-[#F2F2F2] text-[#555555]';
            
            // Menyelaraskan dengan CHECK constraint asli tabel users ('admin_...')
            const role = (log.users?.role || '').toLowerCase();
            
            if (role.includes('keuangan')) {
              divName = 'Keuangan';
              bgClass = 'bg-[#EEEDFB] text-[#4840B0]';
            } else if (role.includes('pemeliharaan') || role.includes('teknisi')) {
              divName = 'Pemeliharaan';
              bgClass = 'bg-[#FEF7EC] text-[#A05820]';
            } else if (role.includes('keamanan')) {
              divName = 'Keamanan';
              bgClass = 'bg-[#E8FAF3] text-[#187050]';
            } else if (role.includes('kebersihan')) {
              divName = 'Kebersihan';
              bgClass = 'bg-[#FEF0EE] text-[#C05040]';
            } else if (role.includes('fasilitas')) {
              divName = 'Fasilitas';
              bgClass = 'bg-[#EAF6F5] text-[#208078]';
            }

            return {
              id: log.id,
              waktu: `${dateStr} - ${timeStr}`,
              admin: log.users?.nama || 'Sistem Otomatis',
              divisi: divName,
              aksi: log.action || log.action_type || 'Aktivitas',
              detail: log.description || 'Tidak ada rincian deskripsi.',
              modul: log.module || 'Umum',
              color: bgClass
            };
          }));
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  // Memproses penyaringan data secara lokal (Client-side filtering)
  const filteredLogs = logs.filter(log => {
    const matchDivisi = selectedDivisi === '' || log.divisi.toLowerCase() === selectedDivisi.toLowerCase();
    
    const query = searchQuery.toLowerCase();
    const matchQuery = searchQuery === '' || 
      log.aksi.toLowerCase().includes(query) || 
      log.detail.toLowerCase().includes(query) ||
      log.modul.toLowerCase().includes(query) ||
      log.admin.toLowerCase().includes(query);

    return matchDivisi && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Bagian Filter Kontrol */}
      <div className="card-section p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Operator / Divisi */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8A857F] uppercase italic">Operator:</span>
              <select 
                value={selectedDivisi} 
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="bg-[#F8F7F5] border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
              >
                <option value="">Semua Divisi</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Pemeliharaan">Pemeliharaan</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Fasilitas">Fasilitas</option>
                <option value="Kebersihan">Kebersihan</option>
              </select>
            </div>

            {/* Input Pencarian Teks */}
            <div className="relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#8A857F] group-focus-within:text-[#1E1E1E] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari aksi, detail, admin, modul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8F7F5] border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#EAE6E1] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tabel Log */}
      <div className="card-section !p-0 overflow-hidden shadow-sm border border-gray-200 bg-white rounded-xl">
        <div className="p-6 border-b border-gray-100">
           <h3 className="text-xs font-black text-[#1E1E1E] uppercase tracking-widest">Audit Log Aktivitas Sistem</h3>
           <p className="text-[10px] text-[#8A857F] font-medium mt-1 italic">Rekaman jejak digital dari perubahan data yang dilakukan oleh administrator</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-gray-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Waktu</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Admin / Operator</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Divisi</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Modul</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Aksi</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Rincian Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-medium text-xs animate-pulse">
                    Menghubungkan ke database public.audit_logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFDFD] transition-colors group">
                    <td className="p-4 text-xs font-bold text-[#1E1E1E] tabular-nums whitespace-nowrap">{log.waktu}</td>
                    <td className="p-4 text-xs font-extrabold text-[#1E1E1E]">{log.admin}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${log.color}`}>
                        {log.divisi}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700">{log.modul}</span>
                    </td>
                    <td className="p-4 text-xs font-bold text-[#1E1E1E]">{log.aksi}</td>
                    <td className="p-4 text-xs text-[#8A857F] font-medium max-w-xs break-words">{log.detail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic text-xs">
                    Tidak ada riwayat aktivitas yang cocok dengan filter atau database kosong.
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