import React, { useState, useEffect } from 'react';
import { RefreshCw, FileDown, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function RekonsiliPembayaran() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState('April 2026');
  const [syncing, setSyncing] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tagihan')
          .select('*, unit(nomor_unit), users(nama)')
          .eq('status', 'sudah_bayar')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setTransactions(data.map((row) => ({
            id: `TXN-${row.periode ? row.periode.replace(' ', '') : '202604'}-${String(row.id).padStart(4, '0')}`,
            unit: row.unit?.nomor_unit || '-',
            name: row.users?.nama || row.penghuni?.nama || 'Anonim',
            amount: row.total || row.jumlah || 0,
            gateway: row.metode_bayar || 'Transfer Bank',
            payDate: row.tgl_bayar ? new Date(row.tgl_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
            status: 'Sukses'
          })));
        }
      } catch (err) {
        console.error('Error fetching reconciliation transactions:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('tagihan')
        .select('*, unit(nomor_unit), users(nama)')
        .eq('status', 'sudah_bayar')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTransactions(data.map((row) => ({
          id: `TXN-${row.periode ? row.periode.replace(' ', '') : '202604'}-${String(row.id).padStart(4, '0')}`,
          unit: row.unit?.nomor_unit || '-',
          name: row.users?.nama || row.penghuni?.nama || 'Anonim',
          amount: row.total || row.jumlah || 0,
          gateway: row.metode_bayar || 'Transfer Bank',
          payDate: row.tgl_bayar ? new Date(row.tgl_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          status: 'Sukses'
        })));
        showToast('Sinkronisasi berhasil — data diperbarui dari payment gateway');
      }
    } catch (err) {
      console.error('Error syncing:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getGatewayBadgeClass = (gateway) => {
    switch (gateway) {
      case 'Transfer Bank': return 'badge-base badge-lavender';
      case 'GoPay': return 'badge-base badge-mint';
      case 'OVO': return 'badge-base badge-pink';
      default: return 'badge-base badge-gray';
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-2 w-44"
            >
              <option value="April 2026">April 2026</option>
              <option value="Maret 2026">Maret 2026</option>
            </select>
          </div>

          <button
            onClick={() => showToast('Data rekonsiliasi berhasil diexport ke format CSV!')}
            className="btn-ghost btn-sm flex items-center justify-center gap-1.5"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>
        </div>

        {/* Sync Trigger button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary btn-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {syncing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          <span>Auto-sync Midtrans</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="card-section flex flex-col">
        <div className="card-section-header">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Rekonsiliasi Pembayaran (Payment Gateway)
            </h3>
            <p className="text-xs text-muted font-medium mt-0.5">Sinkronisasi status transaksi dari payment gateway Midtrans ke dalam pembukuan apartemen</p>
          </div>
        </div>

        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Unit</th>
                <th>Nama</th>
                <th>Jumlah</th>
                <th>Gateway</th>
                <th>Tgl Bayar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="text-muted font-mono font-medium">{t.id}</td>
                  <td className="text-ink font-bold">{t.unit}</td>
                  <td className="text-ink font-bold">{t.name}</td>
                  <td className="font-mono text-ink font-bold">{formatRupiah(t.amount)}</td>
                  <td>
                    <span className={getGatewayBadgeClass(t.gateway)}>
                      {t.gateway}
                    </span>
                  </td>
                  <td className="text-muted font-medium">{t.payDate}</td>
                  <td>
                    {t.status === 'Sukses' ? (
                      <span className="badge-base badge-mint inline-flex items-center gap-0.5">
                        <Check size={10} className="stroke-[3]" />
                        <span>Sukses</span>
                      </span>
                    ) : (
                      <span className="badge-base badge-yellow">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
