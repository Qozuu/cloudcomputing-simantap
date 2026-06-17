import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PermintaanCleaning() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State hanya untuk Modal Detail Deskripsi
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Fungsi Ambil Data dari Database
  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data: resData, error: resError } = await supabase
        .from('reservasi')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (resError) throw resError;

      const { data: fasData } = await supabase.from('fasilitas').select('id, nama');
      const { data: usrData } = await supabase.from('users').select('id, nama');

      if (resData) {
        const formattedData = resData.map(item => {
          const facilitiesMatch = fasData?.find(f => f.id === item.fasilitas_id);
          const usersMatch = usrData?.find(u => u.id === item.penghuni_id);

          const reqDateObj = new Date(item.created_at);
          const reqDateFormatted = `${reqDateObj.getDate()} ${reqDateObj.toLocaleDateString('id-ID', { month: 'short' })}`;

          // Membaca tanggal dan jam operasional langsung dari database
          const schDate = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '';
          const schTimeStart = item.jam_mulai ? item.jam_mulai.substring(0, 5) : '';
          const schTimeEnd = item.jam_selesai ? item.jam_selesai.substring(0, 5) : '';
          const scheduleFormatted = schDate && schTimeStart ? `${schDate} (${schTimeStart} - ${schTimeEnd})` : '—';
          
          // Membaca status asli dari database dan memetakan ke warna badge UI
          let statusMapped = 'Menunggu'; 
          if (item.status?.toLowerCase() === 'disetujui') statusMapped = 'Terjadwal';
          if (item.status?.toLowerCase() === 'dibatalkan' || item.status?.toLowerCase() === 'ditolak') {
            statusMapped = 'Selesai';
          }

          return {
            id: item.id,
            unit: 'Fasilitas Publik',
            name: usersMatch?.nama || 'Penghuni / Staf',
            service: facilitiesMatch?.nama || 'Cleaning Area',
            reqDate: reqDateFormatted,
            schedule: scheduleFormatted,
            status: statusMapped, 
            description: item.catatan || 'Mohon lakukan pembersihan menyeluruh pada area cakupan.'
          };
        });

        setRequests(formattedData);
      }
    } catch (err) {
      console.error('Error loading data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terjadwal': 
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Terjadwal</span>;
      case 'Menunggu': 
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Menunggu</span>;
      case 'Selesai': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Selesai
          </span>
        );
      default: 
        return null;
    }
  };

  if (loading) return <div className="p-6 text-slate-500 font-medium text-sm animate-pulse">Memuat log operasional...</div>;

  return (
    <div className="space-y-6 relative">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Menunggu Respons</p>
            <h4 className="text-slate-900 font-black text-2xl mt-1">{requests.filter(r => r.status === 'Menunggu').length} Permintaan</h4>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Terjadwal</p>
            <h4 className="text-slate-900 font-black text-2xl mt-1">{requests.filter(r => r.status === 'Terjadwal').length} Tugas</h4>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Selesai Steril</p>
            <h4 className="text-slate-900 font-black text-2xl mt-1">{requests.filter(r => r.status === 'Selesai').length} Sesi</h4>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="pb-5 border-b border-slate-100 mb-6">
          <h2 className="text-base font-black text-slate-900">Log Monitoring Sanitasi & Pembersihan Fasilitas</h2>
          <p className="text-xs text-slate-400 mt-0.5">Riwayat penggunaan dan jadwal sterilisasi berkala area publik</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="p-3.5">Zonasi</th>
                <th className="p-3.5">Pelapor / Pemesan</th>
                <th className="p-3.5">Area Fasilitas</th>
                <th className="p-3.5">Waktu Masuk</th>
                <th className="p-3.5">Rencana Kerja (Durasi)</th>
                <th className="p-3.5">Status Alokasi</th>
                <th className="p-3.5 text-right">Informasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-400">{req.unit}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{req.name}</td>
                  <td className="p-3.5 font-black text-slate-900">{req.service}</td>
                  <td className="p-3.5 text-slate-500 font-medium">{req.reqDate}</td>
                  <td className="p-3.5 font-bold text-slate-900">{req.schedule}</td>
                  <td className="p-3.5">{getStatusBadge(req.status)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => { setSelectedRequest(req); setDetailModalOpen(true); }}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] hover:bg-slate-800 transition shadow-sm"
                    >
                      Lihat Deskripsi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Detail Informasi Lapangan</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pelapor</span>
                  <p className="font-black text-slate-900 mt-0.5">{selectedRequest.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fasilitas</span>
                  <p className="font-black text-slate-900 mt-0.5">{selectedRequest.service}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-900 font-black block text-[10px] uppercase mb-1">Catatan Tambahan</span>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedRequest.description}</p>
              </div>
              <button type="button" onClick={() => setDetailModalOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}