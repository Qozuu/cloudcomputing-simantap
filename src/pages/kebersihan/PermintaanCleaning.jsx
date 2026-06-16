import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PermintaanCleaning() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('22 Apr');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [successToast, setSuccessToast] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservasi')
        .select('*, penghuni:users(nama), fasilitas(nama)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRequests(data.map(item => {
          const reqDateObj = new Date(item.created_at);
          const reqDateFormatted = `${reqDateObj.getDate()} ${reqDateObj.toLocaleDateString('id-ID', { month: 'short' })}`;

          const schDate = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '';
          const schTime = item.jam_mulai ? item.jam_mulai.substring(0, 5) : '';
          const scheduleFormatted = item.status && item.status.toLowerCase() === 'disetujui' && schDate && schTime ? `${schDate} ${schTime}` : '—';

          const s = (item.status || '').toLowerCase();
          const statusMapped = s === 'disetujui' ? 'Terjadwal' : (s === 'selesai' ? 'Selesai' : 'Menunggu');

          return {
            id: item.id,
            unit: item.unit_no || item.nomor_unit || 'N/A',
            name: item.penghuni?.nama || 'Warga',
            service: item.fasilitas?.nama || 'Cleaning',
            reqDate: reqDateFormatted,
            schedule: scheduleFormatted,
            status: statusMapped,
            description: item.keterangan || item.deskripsi || 'Tidak ada keterangan tambahan.'
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load cleaning requests:', err.message);
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
        return (
          <span className="badge-base badge-lavender">
            Terjadwal
          </span>
        );
      case 'Menunggu':
        return (
          <span className="badge-base badge-pink">
            Menunggu
          </span>
        );
      case 'Selesai':
        return (
          <span className="badge-base badge-mint">
            <svg className="w-3 h-3 text-[#187050]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setDetailModalOpen(true);
  };

  const handleOpenSchedule = (id) => {
    setSchedulingId(id);
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingId) return;

    try {
      const day = scheduleDate.split(' ')[0];
      const scheduleFormattedDate = `2026-04-${day.padStart(2, '0')}`;

      const { error } = await supabase
        .from('reservasi')
        .update({
          status: 'disetujui',
          tanggal: scheduleFormattedDate,
          jam_mulai: scheduleTime
        })
        .eq('id', schedulingId);

      if (error) throw error;

      const targetReq = requests.find(r => r.id === schedulingId);
      setScheduleModalOpen(false);
      setSuccessToast(`Permintaan cleaning ${targetReq ? targetReq.name : ''} berhasil dijadwalkan!`);
      setTimeout(() => setSuccessToast(''), 3000);
      loadRequests();
    } catch (err) {
      console.error('Failed to schedule cleaning request:', err.message);
    }
  };

  const waitingCount = requests.filter(r => r.status === 'Menunggu').length;

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-pink hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-pink mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Menunggu Respons</p>
            <h4 className="text-[#C05040] font-black text-2xl mt-2 mb-1">{waitingCount} Permintaan</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Perlu segera dijadwalkan</span>
        </div>

        <div className="card-yellow hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-yellow mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Terjadwal</p>
            <h4 className="text-[#A05820] font-black text-2xl mt-2 mb-1">
              {requests.filter(r => r.status === 'Terjadwal').length} Unit
            </h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Siap dikerjakan petugas</span>
        </div>

        <div className="card-lavender hover:translate-y-[-2px] transition duration-150 flex flex-col justify-between">
          <div>
            <div className="card-icon-lavender mb-3 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Selesai Hari Ini</p>
            <h4 className="text-[#4840B0] font-black text-2xl mt-2 mb-1">
              {requests.filter(r => r.status === 'Selesai').length} Unit
            </h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Penyelesaian yang solid</span>
        </div>
      </div>

      {/* Main card section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-5 border-b border-soft mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-ink">Permintaan Cleaning Service</h2>
            {waitingCount > 0 && (
              <span className="badge-base badge-pink">
                {waitingCount} menunggu
              </span>
            )}
          </div>
          <p className="text-xs text-muted">Manajemen laundry, cuci sofa, & unit cleaning</p>
        </div>

        {/* Responsive Table */}
        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Nama</th>
                <th>Layanan</th>
                <th>Tgl Permintaan</th>
                <th>Jadwal</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="font-bold text-ink">{req.unit}</td>
                  <td>{req.name}</td>
                  <td className="font-semibold text-ink">{req.service}</td>
                  <td className="text-muted">{req.reqDate}</td>
                  <td>
                    <span className={req.schedule === '—' ? 'text-muted font-normal' : 'font-semibold text-ink'}>
                      {req.schedule}
                    </span>
                  </td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td className="text-right">
                    {req.status === 'Menunggu' ? (
                      <button
                        onClick={() => handleOpenSchedule(req.id)}
                        className="text-ink hover:underline font-bold text-xs"
                      >
                        Jadwalkan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenDetail(req)}
                        className="text-muted hover:text-ink hover:underline font-bold text-xs"
                      >
                        Detail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Detail Permintaan Cleaning</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Body */}
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="label-modern mb-0.5">Penghuni</span>
                  <p className="text-xs font-bold text-ink">{selectedRequest.name} (Unit {selectedRequest.unit})</p>
                </div>
                <div>
                  <span className="label-modern mb-0.5">Layanan</span>
                  <p className="text-xs font-bold text-ink">{selectedRequest.service}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="label-modern mb-0.5">Tgl Masuk</span>
                  <p className="text-xs font-semibold text-muted">{selectedRequest.reqDate}</p>
                </div>
                <div>
                  <span className="label-modern mb-0.5">Jadwal Tugas</span>
                  <p className="text-xs font-semibold text-muted">{selectedRequest.schedule}</p>
                </div>
              </div>

              <div>
                <span className="label-modern mb-0.5">Status Pekerjaan</span>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>

              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-soft">
                <span className="label-modern mb-1.5">Deskripsi Permintaan</span>
                <p className="text-xs font-medium text-ink leading-relaxed">{selectedRequest.description}</p>
              </div>

              <div className="pt-3 border-t border-soft flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tentukan Jadwal Cleaning</h3>
              <button onClick={() => setScheduleModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Tanggal</label>
                  <select
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="22 Apr">22 Apr</option>
                    <option value="23 Apr">23 Apr</option>
                    <option value="24 Apr">24 Apr</option>
                    <option value="25 Apr">25 Apr</option>
                    <option value="26 Apr">26 Apr</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Jam Kerja</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="09:00">09:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  <span>✓ Konfirmasi Jadwal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
