import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TagihanReservasi() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const loadBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tagihan_fasilitas')
        .select('*, fasilitas(nama), penghuni(nama, unit_id, unit:unit(nomor_unit))')
        .order('created_at', { ascending: false });

      console.log('Tagihan data:', data);
      console.log('Tagihan error:', error);
      if (error) throw error;

      if (data) {
        setBills(data.map(item => {
          const rawStatus = (item.status || '').toLowerCase();
          let statusMapped = 'Belum Bayar';
          if (rawStatus === 'disetujui') statusMapped = 'Lunas';

          return {
            id: item.id,
            resident: item.penghuni?.nama || 'Warga',
            unit: item.penghuni?.unit?.nomor_unit || 'N/A',
            facility: item.fasilitas?.nama || 'Fasilitas',
            session: `${item.tgl_reservasi || '-'} ${item.sesi_waktu || ''}`.trim(),
            cost: item.total_tarif || 0,
            status: statusMapped,
            statusRaw: item.status || 'Menunggu',
          };
        }));
      }
    } catch (err) {
      console.error('Failed to load facility bills:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  // Dynamic calculations based on state values
  const unpaidBills = bills.filter(b => b.status === 'Belum Bayar');
  const paidBills = bills.filter(b => b.status === 'Lunas');

  const unpaidCount = unpaidBills.length;
  const unpaidSum = unpaidBills.reduce((acc, curr) => acc + curr.cost, 0);

  const paidCount = paidBills.length;
  const paidSum = paidBills.reduce((acc, curr) => acc + curr.cost, 0);

  const totalSum = paidSum + unpaidSum;

  const handleConfirmPayment = async (id) => {
    try {
      const { error } = await supabase
        .from('tagihan_fasilitas')
        .update({ status: 'Disetujui' })
        .eq('id', id);

      if (error) throw error;
      showToast('Pembayaran berhasil dikonfirmasi!');
      loadBills();
    } catch (err) {
      console.error('Failed to confirm payment:', err.message);
      showToast(`Gagal konfirmasi: ${err.message}`);
    }
  };

  const handleShowInvoice = (bill) => {
    setSelectedInvoice(bill);
    setInvoiceModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatRupiah = (val) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="card-pink flex flex-col justify-between h-28 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Belum Bayar</span>
            <span className="text-xl font-black text-[#1E1E1E] mt-1 block">{formatRupiah(unpaidSum)}</span>
          </div>
          <div className="flex items-center justify-between text-[#8A857F] font-semibold text-xs">
            <span>{unpaidCount} Tagihan Pending</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-yellow flex flex-col justify-between h-28 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Sudah Lunas</span>
            <span className="text-xl font-black text-[#1E1E1E] mt-1 block">{formatRupiah(paidSum)}</span>
          </div>
          <div className="flex items-center justify-between text-[#8A857F] font-semibold text-xs">
            <span>{paidCount} Tagihan Lunas</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-lavender flex flex-col justify-between h-28 hover:translate-y-[-2px] transition duration-200">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs block">Total Bulan Ini</span>
            <span className="text-xl font-black text-[#1E1E1E] mt-1 block">{formatRupiah(totalSum)}</span>
          </div>
          <div className="flex items-center justify-between text-[#8A857F] font-semibold text-xs">
            <span>Akumulasi booking berbayar</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="pb-5 border-b border-soft mb-6">
          <h2 className="text-base font-bold text-ink">Tagihan Reservasi Fasilitas Berbayar</h2>
          <p className="text-xs text-muted">Konfirmasi dan cetak invoice untuk reservasi warga</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>NO</th>
                <th>PENGHUNI</th>
                <th>UNIT</th>
                <th>FASILITAS</th>
                <th>SESI</th>
                <th>BIAYA</th>
                <th>STATUS</th>
                <th className="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id}>
                  <td className="font-mono text-muted">{b.id}</td>
                  <td className="font-bold text-ink">{b.resident}</td>
                  <td>{b.unit}</td>
                  <td className="font-bold text-ink">{b.facility}</td>
                  <td className="font-mono text-muted">{b.session}</td>
                  <td className="font-bold text-ink text-sm">
                    {formatRupiah(b.cost)}
                  </td>
                  <td>
                    {b.status === 'Belum Bayar' ? (
                      <span className="badge-base badge-pink">
                        Belum Bayar
                      </span>
                    ) : (
                      <span className="badge-base badge-mint">
                        <svg className="w-3.5 h-3.5 text-[#187050]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Lunas</span>
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {b.status === 'Belum Bayar' ? (
                      <button
                        onClick={() => handleConfirmPayment(b.id)}
                        className="btn-primary py-1.5 px-3.5 text-[10px] font-bold rounded-xl"
                      >
                        Konfirmasi
                      </button>
                    ) : (
                      <button
                        onClick={() => handleShowInvoice(b)}
                        className="text-ink hover:underline font-bold text-xs"
                      >
                        Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE MODAL */}
      {invoiceModalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Kuitansi Pembayaran Digital</h3>
              <button onClick={() => setInvoiceModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Invoice Body */}
            <div className="modal-body space-y-6">
              
              {/* Status Header */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-pastel-mint-bg text-[#187050] border border-pastel-mint/30 flex items-center justify-center mx-auto shadow-inner">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider mt-2">TRANSAKSI SUKSES</h4>
                <p className="text-[10px] text-muted font-mono font-bold">{selectedInvoice.id}</p>
              </div>

              {/* Specs */}
              <div className="space-y-2.5 text-xs border-y border-dashed border-soft py-4">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted">Penghuni</span>
                  <span className="text-ink font-semibold">{selectedInvoice.resident} ({selectedInvoice.unit})</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted">Fasilitas</span>
                  <span className="text-ink font-semibold">{selectedInvoice.facility}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted">Waktu Sesi</span>
                  <span className="text-ink font-mono font-semibold">{selectedInvoice.session}</span>
                </div>
                <div className="flex justify-between font-bold pt-2.5 border-t border-soft">
                  <span className="text-ink uppercase tracking-wider text-[10px]">Total Bayar</span>
                  <span className="text-[#A05820] font-extrabold text-sm">{formatRupiah(selectedInvoice.cost)}</span>
                </div>
              </div>

              {/* Note */}
              <div className="text-center text-[10px] text-muted font-medium">
                Kuitansi ini diterbitkan secara sah oleh pengelola Apartemen Grand Surabaya sebagai bukti pembayaran resmi.
              </div>

              {/* Action */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Invoice - ${selectedInvoice.id}</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
                            h2 { text-align: center; letter-spacing: 2px; }
                            .id { text-align: center; color: #888; font-size: 12px; margin-bottom: 24px; }
                            .icon { text-align: center; font-size: 40px; margin-bottom: 8px; }
                            hr { border: none; border-top: 1px dashed #ccc; margin: 16px 0; }
                            .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
                            .label { color: #888; }
                            .total { font-weight: bold; font-size: 15px; }
                            .total-val { font-weight: bold; color: #A05820; font-size: 15px; }
                            .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 24px; }
                          </style>
                        </head>
                        <body>
                          <div class="icon">✅</div>
                          <h2>KUITANSI PEMBAYARAN DIGITAL</h2>
                          <p class="id">${selectedInvoice.id}</p>
                          <hr/>
                          <div class="row"><span class="label">Penghuni</span><span>${selectedInvoice.resident} (${selectedInvoice.unit})</span></div>
                          <div class="row"><span class="label">Fasilitas</span><span>${selectedInvoice.facility}</span></div>
                          <div class="row"><span class="label">Waktu Sesi</span><span>${selectedInvoice.session}</span></div>
                          <hr/>
                          <div class="row"><span class="total">Total Bayar</span><span class="total-val">${formatRupiah(selectedInvoice.cost)}</span></div>
                          <hr/>
                          <p class="footer">Kuitansi ini diterbitkan secara sah oleh pengelola Apartemen Grand Surabaya sebagai bukti pembayaran resmi.</p>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="w-full btn-primary py-3 rounded-xl text-xs font-bold justify-center"
                >
                  Cetak Invoice
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
