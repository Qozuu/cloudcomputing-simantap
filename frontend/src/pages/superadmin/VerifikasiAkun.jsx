import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function AktivasiAkun() {
  // Mengubah status awal menjadi 'Menunggu Aktivasi'
  const [pendingActivation, setPendingActivation] = useState([
    { id: 1, name: 'Eko Prasetyo', unit: '9A', email: 'eko.p@email.com', dateReg: '21 Apr 2026', status: 'Menunggu Aktivasi' },
    { id: 2, name: 'Anita Kusuma', unit: '31B', email: 'anita.k@email.com', dateReg: '21 Apr 2026', status: 'Menunggu Aktivasi' },
    { id: 3, name: 'Bima Rahardjo', unit: '22C', email: 'bima.r@email.com', dateReg: '21 Apr 2026', status: 'Menunggu Aktivasi' }
  ]);

  const [activeAccounts, setActiveAccounts] = useState([
    { id: 101, name: 'Hendra Gunawan', unit: '12A', email: 'hendra.g@email.com', dateActive: '20 Apr 2026', status: 'Aktif' },
    { id: 102, name: 'Maya Sari', unit: '05B', email: 'maya.s@email.com', dateActive: '19 Apr 2026', status: 'Aktif' },
    { id: 103, name: 'Rudi Hartono', unit: '18C', email: 'rudi.h@email.com', dateActive: '18 Apr 2026', status: 'Aktif' }
  ]);

  const [toastMessage, setToastMessage] = useState('');

  // Handler untuk menyetujui aktivasi akun
  const handleActivate = (id) => {
    const target = pendingActivation.find(acc => acc.id === id);
    if (!target) return;

    // Hapus dari daftar tunggu aktivasi
    setPendingActivation(prev => prev.filter(acc => acc.id !== id));

    // Format tanggal aktivasi hari ini
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const activated = {
      id: target.id,
      name: target.name,
      unit: target.unit,
      email: target.email,
      dateActive: formattedDate,
      status: 'Aktif'
    };

    setActiveAccounts(prev => [activated, ...prev]);
    showToast(`Akun ${target.name} berhasil diaktifkan!`);
  };

  // Handler untuk menolak atau membatalkan permintaan aktivasi
  const handleRejectActivation = (id) => {
    const target = pendingActivation.find(acc => acc.id === id);
    if (!target) return;

    const confirmReject = window.confirm(`Apakah Anda yakin ingin menolak permintaan aktivasi akun untuk ${target.name}?`);
    if (confirmReject) {
      setPendingActivation(prev => prev.filter(acc => acc.id !== id));
      showToast(`Permintaan aktivasi akun ${target.name} ditolak.`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Teks dobel "Aktivasi Akun" dan "General Manager" di sini sudah dihapus */}
      {/* Konten langsung dimulai dari Banner Sub-Section */}
      <div className="card-section p-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Aktivasi Akun Penghuni</h2>
          <p className="text-xs text-muted">Tinjau dokumen kelengkapan untuk aktivasi akun portal penghuni baru</p>
        </div>
        <span className="badge-base badge-pink animate-pulse">
          {pendingActivation.length} Menunggu Aktivasi
        </span>
      </div>

      {/* SEKSI 1: Permintaan Aktivasi Akun */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
          Permintaan Aktivasi Menunggu
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Dokumen Syarat</th>
                <th>Tgl Ajuan</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingActivation.length > 0 ? (
                pendingActivation.map((acc) => (
                  <tr key={acc.id}>
                    <td className="font-bold text-ink">{acc.name}</td>
                    <td className="text-ink font-bold">{acc.unit}</td>
                    <td className="font-mono text-muted">{acc.email}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="badge-base badge-mint">
                          <Check size={10} className="stroke-[3]" />
                          <span>KTP</span>
                        </span>
                        <span className="badge-base badge-mint">
                          <Check size={10} className="stroke-[3]" />
                          <span>KK</span>
                        </span>
                      </div>
                    </td>
                    <td className="text-muted">{acc.dateReg}</td>
                    <td>
                      <span className="badge-base badge-yellow">
                        {acc.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleActivate(acc.id)}
                          className="btn-primary py-1.5 px-3.5 text-[10px] font-bold rounded-xl"
                        >
                          Aktifkan
                        </button>
                        <button
                          onClick={() => handleRejectActivation(acc.id)}
                          className="btn-ghost hover:bg-pastel-pink-bg hover:text-[#B85040] hover:border-pastel-pink/30 py-1.5 px-3.5 text-[10px] font-bold rounded-xl"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted font-bold">
                    Tidak ada permintaan aktivasi akun yang menunggu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEKSI 2: Daftar Akun yang Sudah Aktif */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
          Akun Sudah Diaktivasi (Aktif)
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Tgl Aktivasi</th>
                <th>Status Portal</th>
              </tr>
            </thead>
            <tbody>
              {activeAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="font-bold text-ink">{acc.name}</td>
                  <td className="text-ink font-bold">{acc.unit}</td>
                  <td className="font-mono text-muted">{acc.email}</td>
                  <td className="text-muted">{acc.dateActive}</td>
                  <td>
                    <span className="badge-base badge-mint">
                      <Check size={10} className="stroke-[3]" />
                      <span>{acc.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notifikasi Berhasil */}
      {toastMessage && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}