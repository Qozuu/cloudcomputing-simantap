import React, { useState } from 'react';
import { Eye, CheckCircle2, Printer, X, Download } from 'lucide-react';

export default function EBilling() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const lineItems = [
    { label: 'Iuran Pengelolaan Lingkungan (IPL)', amount: 'Rp 770.000' },
    { label: 'Parkir Kendaraan (L 1234 AB)', amount: 'Rp 150.000' }
  ];

  const paymentHistory = [
    {
      month: 'April 2026',
      ipl: 'Rp 770.000',
      parkir: 'Rp 150.000',
      total: 'Rp 920.000',
      tglBayar: '15 Apr 2026',
      metode: 'Transfer Bank',
      status: 'Lunas',
      trxId: 'TRX-202004-0012'
    },
    {
      month: 'Maret 2026',
      ipl: 'Rp 770.000',
      parkir: 'Rp 150.000',
      total: 'Rp 920.000',
      tglBayar: '12 Mar 2026',
      metode: 'Transfer Bank',
      status: 'Lunas',
      trxId: 'TRX-202003-0008'
    },
    {
      month: 'Februari 2026',
      ipl: 'Rp 770.000',
      parkir: 'Rp 150.000',
      total: 'Rp 920.000',
      tglBayar: '14 Feb 2026',
      metode: 'Transfer Bank',
      status: 'Lunas',
      trxId: 'TRX-202002-0004'
    }
  ];

  const handlePrintMock = () => {
    setSuccessToast('Mempersiapkan printer... Invoice siap dicetak.');
    setTimeout(() => setSuccessToast(''), 3000);
    window.print();
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Top Summary Card */}
      <div className="bg-active text-white rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        {/* Soft background glow */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-pastel-pink/15 to-transparent rounded-full blur-2xl"></div>
        
        <div>
          <span className="text-[10px] font-extrabold text-[#FAF6F0]/80 uppercase tracking-widest block mb-1">
            Tagihan Bulan April 2026 — Unit 1012 Tower A
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Rp 920.000</h2>
        </div>
        
        <p className="text-[11px] text-[#FAF6F0]/80 font-medium tracking-wide mt-4">
          Lunas · 11 April 2026
        </p>
      </div>

      {/* Rincian Tagihan */}
      <div className="card-section p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-soft pb-4">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Rincian Tagihan April 2026
            </h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
              Rata-rata IPL Rp 770.000/unit/bulan
            </p>
          </div>
          <button
            onClick={handlePrintMock}
            className="btn-ghost flex items-center gap-1.5 text-xs font-bold shadow-softer"
          >
            <Printer size={12} />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Line Items */}
        <div className="space-y-3 font-semibold text-xs text-ink">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-0.5">
              <span>{item.label}</span>
              <span className="font-bold text-active">{item.amount}</span>
            </div>
          ))}
          <hr className="border-dashed border-soft my-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-extrabold text-ink uppercase tracking-wide">Total Tagihan</span>
            <span className="text-base font-extrabold text-ink">Rp 920.000</span>
          </div>
        </div>
        {/* Banner konfirmasi verifikasi manual di bagian ini telah dihapus sepenuhnya */}
      </div>

      {/* Histori Pembayaran IPL */}
      <div className="card-section p-6">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-5">
          Histori Pembayaran IPL
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>IPL</th>
                <th>Parkir</th>
                <th>Total</th>
                <th>Tgl Bayar</th>
                <th>Metode</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((history, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-ink">{history.month}</td>
                  <td className="text-muted">{history.ipl}</td>
                  <td className="text-muted">{history.parkir}</td>
                  <td className="font-extrabold text-ink">{history.total}</td>
                  <td className="text-muted">{history.tglBayar}</td>
                  <td className="text-muted">{history.metode}</td>
                  <td>
                    <span className="badge-base badge-mint">
                      {history.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleViewInvoice(history)}
                      className="p-1.5 hover:bg-app-bg text-ink rounded-lg transition"
                      title="Lihat Invoice"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIGITAL RECEIPT MODAL */}
      {modalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="modal-box max-w-md relative z-10 animate-scale-in">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Kwitansi Digital Pembayaran IPL
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="modal-body space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#E8FAF3] text-[#187050] border border-soft flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} className="stroke-[2.5]" />
                </div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Transaksi Berhasil</h4>
                <p className="text-2xl font-extrabold text-ink">{selectedInvoice.total}</p>
                <p className="text-[10px] text-muted font-bold">{selectedInvoice.trxId}</p>
              </div>

              <div className="bg-app-bg p-4 rounded-2xl border border-soft space-y-3 font-semibold text-xs text-ink">
                <div className="flex justify-between">
                  <span className="text-muted">Hunian</span>
                  <span className="text-ink">Unit 1012 (Tower A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Periode Tagihan</span>
                  <span className="text-ink font-bold">{selectedInvoice.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Tanggal Transaksi</span>
                  <span className="text-ink">{selectedInvoice.tglBayar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Metode Pembayaran</span>
                  <span className="text-ink">{selectedInvoice.metode}</span>
                </div>
                <hr className="border-soft" />
                <div className="flex justify-between">
                  <span className="text-muted">Iuran IPL</span>
                  <span className="text-ink font-medium">{selectedInvoice.ipl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Parkir Bulanan</span>
                  <span className="text-ink font-medium">{selectedInvoice.parkir}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSuccessToast('Mendownload tanda terima PDF...');
                    setTimeout(() => setSuccessToast(''), 3000);
                  }}
                  className="flex-1 btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost text-xs border-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Sukses</p>
            <p className="text-[10px] opacity-90 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}