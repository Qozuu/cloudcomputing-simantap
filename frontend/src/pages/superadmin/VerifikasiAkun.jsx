import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function VerifikasiAkun() {
  const [pendingAccounts, setPendingAccounts] = useState([
    { id: 1, name: 'Eko Prasetyo', unit: '#9A', email: 'eko.p@email.com', dateReg: '21 Apr 2026', status: 'Menunggu' },
    { id: 2, name: 'Anita Kusuma', unit: '31B', email: 'anita.k@email.com', dateReg: '21 Apr 2026', status: 'Menunggu' },
    { id: 3, name: 'Bima Rahardjo', unit: '22C', email: 'bima.r@email.com', dateReg: '21 Apr 2026', status: 'Menunggu' }
  ]);

  const [verifiedAccounts, setVerifiedAccounts] = useState([
    { id: 101, name: 'Hendra Gunawan', unit: '12A', email: 'hendra.g@email.com', dateVerif: '20 Apr 2026', status: 'Aktif' },
    { id: 102, name: 'Maya Sari', unit: '05B', email: 'maya.s@email.com', dateVerif: '19 Apr 2026', status: 'Aktif' },
    { id: 103, name: 'Rudi Hartono', unit: '18C', email: 'rudi.h@email.com', dateVerif: '18 Apr 2026', status: 'Aktif' }
  ]);

  const [toastMessage, setToastMessage] = useState('');

  const handleApprove = (id) => {
    const target = pendingAccounts.find(acc => acc.id === id);
    if (!target) return;

    // Remove from pending
    setPendingAccounts(prev => prev.filter(acc => acc.id !== id));

    // Prepend to verified
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const approved = {
      id: target.id,
      name: target.name,
      unit: target.unit,
      email: target.email,
      dateVerif: formattedDate,
      status: 'Aktif'
    };

    setVerifiedAccounts(prev => [approved, ...prev]);
    showToast(`Akun ${target.name} berhasil diverifikasi!`);
  };

  const handleReject = (id) => {
    const target = pendingAccounts.find(acc => acc.id === id);
    if (!target) return;

    const confirmReject = window.confirm(`Apakah Anda yakin ingin menolak pendaftaran akun oleh ${target.name}?`);
    if (confirmReject) {
      setPendingAccounts(prev => prev.filter(acc => acc.id !== id));
      showToast(`Pendaftaran ${target.name} ditolak.`);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Header controls & Pending notification */}
      <div className="card-section p-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">Verifikasi Registrasi Penghuni</h2>
          <p className="text-xs text-muted">Tinjau dokumen identitas KTP & KK untuk aktivasi akun portal penghuni</p>
        </div>
        <span className="badge-base badge-pink animate-pulse">
          {pendingAccounts.length} Menunggu
        </span>
      </div>

      {/* Section 1: Verifikasi Akun Baru */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
          Permintaan Verifikasi Menunggu
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Dokumen</th>
                <th>Tgl Daftar</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length > 0 ? (
                pendingAccounts.map((acc) => (
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
                          onClick={() => handleApprove(acc.id)}
                          className="btn-primary py-1.5 px-3.5 text-[10px] font-bold rounded-xl"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(acc.id)}
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
                    Tidak ada permintaan verifikasi yang menunggu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Akun Sudah Diverifikasi */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-soft pb-3">
          Akun Sudah Diverifikasi (Aktif)
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Tgl Verifikasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {verifiedAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="font-bold text-ink">{acc.name}</td>
                  <td className="text-ink font-bold">{acc.unit}</td>
                  <td className="font-mono text-muted">{acc.email}</td>
                  <td className="text-muted">{acc.dateVerif}</td>
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

      {/* Success Toast */}
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
