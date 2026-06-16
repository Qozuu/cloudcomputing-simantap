import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AktivasiAkun() {
  const [pendingActivation, setPendingActivation] = useState([]);
  const [activeAccounts, setActiveAccounts] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    try {
      const { data: pendingData } = await supabase
        .from('users')
        .select('*, unit(nomor_unit)')
        .eq('role', 'penghuni')
        .eq('must_change_password', true)
        .order('nama');

      if (pendingData) {
        setPendingActivation(pendingData.map(acc => {
          const unitObj = acc.unit?.[0] || acc.unit;
          return {
            id: acc.id,
            name: acc.nama,
            unit: unitObj?.nomor_unit || '—',
            email: acc.email,
            dateReg: acc.created_at ? new Date(acc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            status: 'Menunggu Aktivasi'
          };
        }));
      }

      const { data: activeData } = await supabase
        .from('users')
        .select('*, unit(nomor_unit)')
        .eq('role', 'penghuni')
        .eq('must_change_password', false)
        .order('nama');

      if (activeData) {
        setActiveAccounts(activeData.map(acc => {
          const unitObj = acc.unit?.[0] || acc.unit;
          return {
            id: acc.id,
            name: acc.nama,
            unit: unitObj?.nomor_unit || '—',
            email: acc.email,
            dateActive: acc.updated_at ? new Date(acc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            status: 'Aktif'
          };
        }));
      }
    } catch (err) {
      console.error('Error loading account verification data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivate = async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ must_change_password: false })
        .eq('id', id);

      if (error) throw error;

      showToast(`Akun berhasil diaktifkan!`);
      loadData();
    } catch (err) {
      console.error('Failed to activate account:', err.message);
    }
  };

  const handleRejectActivation = async (id) => {
    const confirmReject = window.confirm(`Apakah Anda yakin ingin menolak permintaan aktivasi akun?`);
    if (confirmReject) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) throw error;

        showToast(`Permintaan aktivasi akun ditolak.`);
        loadData();
      } catch (err) {
        console.error('Failed to reject activation:', err.message);
      }
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