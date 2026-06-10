import React from 'react';
import { Search, Download, Calendar, User, ShieldCheck } from 'lucide-react';

export default function AuditLog() {
  const logs = [
    { id: 1, waktu: '09:42:13', admin: 'Rina K.', divisi: 'Keuangan', aksi: 'Generate Tagihan', detail: 'Tagihan IPL April 2026 – 440 unit', ip: '192.168.1.42', color: 'bg-[#EEEDFB] text-[#4840B0]' },
    { id: 2, waktu: '09:15:07', admin: 'Doni P.', divisi: 'Pemeliharaan', aksi: 'Assign Teknisi', detail: 'TK-0088 → Pak Roni', ip: '192.168.1.35', color: 'bg-[#FEF7EC] text-[#A05820]' },
    { id: 3, waktu: '08:55:44', admin: 'Agus W.', divisi: 'Keamanan', aksi: 'Broadcast Darurat', detail: 'Lift Tower B bermasalah', ip: '192.168.1.33', color: 'bg-[#E8FAF3] text-[#187050]' },
    { id: 4, waktu: '08:30:00', admin: 'Sistem', divisi: 'Otomatis', aksi: 'Auto Rekonsiliasi', detail: 'Midtrans payment gateway', ip: '127.0.0.1', color: 'bg-[#F2F2F2] text-[#555555]' },
    { id: 5, waktu: '07:00:00', admin: 'Siti R.', divisi: 'Kebersihan', aksi: 'Update Jadwal', detail: 'Jadwal Minggu ke-14 2026', ip: '192.168.1.43', color: 'bg-[#FEF0EE] text-[#C05040]' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header & Filter Card */}
      <div className="card-section p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Waktu */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8A857F] uppercase italic">Waktu:</span>
              <select className="bg-[#F8F7F5] border border-soft rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none">
                <option>Hari Ini</option>
                <option>7 Hari Terakhir</option>
              </select>
            </div>

            {/* Filter Operator */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#8A857F] uppercase italic">Operator:</span>
              <select className="bg-[#F8F7F5] border border-soft rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none">
                <option>Semua Admin</option>
                <option>Super Admin</option>
              </select>
            </div>

            {/* Search Bar - FIXED PL-10 */}
            <div className="relative group w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#8A857F] group-focus-within:text-[#1E1E1E] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari aksi atau detail..."
                className="w-full bg-[#F8F7F5] border border-soft rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#EAE6E1] transition-all"
              />
            </div>
          </div>

        
        </div>
      </div>

      {/* Table Card */}
      <div className="card-section !p-0 overflow-hidden shadow-sm border border-soft">
        <div className="p-6 border-b border-soft">
           <h3 className="text-xs font-black text-[#1E1E1E] uppercase tracking-widest">Audit Log Aktivitas Sistem</h3>
           <p className="text-[10px] text-[#8A857F] font-medium mt-1 italic">Rekaman jejak digital dari perubahan data yang dilakukan oleh administrator</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F7] border-b border-soft">
              <tr>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Waktu</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Admin</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Divisi</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Aksi</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">Detail</th>
                <th className="p-4 text-[10px] font-black text-[#8A857F] uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FDFDFD] transition-colors group">
                  <td className="p-4 text-xs font-bold text-[#1E1E1E] tabular-nums">{log.waktu}</td>
                  <td className="p-4 text-xs font-extrabold text-[#1E1E1E]">{log.admin}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${log.color}`}>
                      {log.divisi}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-[#1E1E1E]">{log.aksi}</td>
                  <td className="p-4 text-xs text-[#8A857F] font-medium">{log.detail}</td>
                  <td className="p-4 text-[10px] font-bold text-[#C8C2BC] font-mono group-hover:text-[#8A857F] transition-colors">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}