import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, Printer, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function EBilling() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [activeBill, setActiveBill] = useState(null);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('tagihan')
          .select('*, unit(nomor_unit, tower(nama_tower)), penghuni:users(nama)')
          .eq('penghuni_id', user.id)
          .order('periode', { ascending: false });

        if (error) throw error;

        const mappedBills = (data || []).map((bill) => ({
          month: bill.periode,
          ipl: formatRupiah(bill.ipl),
          parkir: formatRupiah(bill.parkir),
          total: formatRupiah(bill.total),
          tglBayar: bill.tgl_bayar 
            ? new Date(bill.tgl_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : '—',
          metode: bill.metode_bayar || 'Transfer Bank',
          status: bill.status === 'lunas' || bill.status === 'Lunas' ? 'Lunas' : bill.status === 'sudah_bayar' ? 'Sudah Bayar' : 'Belum Lunas',
          trxId: `INV-${String(bill.id).substring(0, 8).toUpperCase()}`,
          unitNum: bill.unit?.nomor_unit || '-',
          towerName: bill.unit?.tower?.nama_tower || '-',
          tenantName: bill.penghuni?.nama || '-',
          raw: bill
        }));

        setBills(mappedBills);
        if (mappedBills.length > 0) {
          setActiveBill(mappedBills[0]);
        }
      } catch (err) {
        console.error('Gagal memuat tagihan:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrintMock = () => {
    setSuccessToast('Mempersiapkan printer... Invoice siap dicetak.');
    setTimeout(() => setSuccessToast(''), 3000);
    window.print();
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  const lineItems = activeBill ? [
    { label: 'Iuran Pengelolaan Lingkungan (IPL)', amount: activeBill.ipl },
    { label: 'Parkir Kendaraan', amount: activeBill.parkir }
  ] : [];

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* 🪄 STYLE PRINT RULES: Memastikan cetakan bersih hanya mengambil isi invoice modal */}
      <style>{`
        @media print {
          /* Sembunyikan semua elemen di luar modal, termasuk sidebar utama */
          body * {
            visibility: hidden;
            background: none !important;
            box-shadow: none !important;
          }
          
          /* Hanya tampilkan area kertas invoice modal */
          #print-invoice-modal-content, #print-invoice-modal-content * {
            visibility: visible;
          }

          /* Atur posisi modal agar pas memenuhi satu kertas cetak penuh */
          #print-invoice-modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Sembunyikan tombol tutup dan tombol print bawaan di hasil kertas */
          .modal-action-buttons, .modal-close-icon {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      {/* =========================================================================
          1. HALAMAN UTAMA BROWSER (Akan Tersembunyi Otomatis Saat Print)
          ========================================================================= */}
      
      {/* Top Summary Card */}
      <div className="bg-active text-white rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between min-h-[140px] print:hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-pastel-pink/15 to-transparent rounded-full blur-2xl"></div>
        <div>
          <span className="text-[10px] font-extrabold text-[#FAF6F0]/80 uppercase tracking-widest block mb-1">
            Tagihan Bulan {activeBill?.month || '—'} — Unit {activeBill?.unitNum || '—'} {activeBill?.towerName || ''}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">{activeBill?.total || 'Rp 0'}</h2>
        </div>
        <p className="text-[11px] text-[#FAF6F0]/80 font-medium tracking-wide mt-4">
          {activeBill?.status || 'Belum Lunas'} {activeBill?.tglBayar !== '—' ? `· ${activeBill?.tglBayar}` : ''}
        </p>
      </div>

      {/* Box Rincian Tagihan Utama */}
      <div className="card-section p-6 space-y-5 bg-white print:hidden">
        <div className="flex items-center justify-between border-b border-soft pb-4">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Rincian Tagihan {activeBill?.month || '—'}
            </h3>
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">
              Rata-rata IPL {activeBill?.ipl || '—'}/unit/bulan
            </p>
          </div>
          {activeBill && (
            <button
              onClick={() => handleViewInvoice(activeBill)}
              className="btn-ghost flex items-center gap-1.5 text-xs font-bold shadow-softer"
            >
              <Printer size={12} />
              <span>Lihat & Print Invoice</span>
            </button>
          )}
        </div>

        <div className="space-y-3 font-semibold text-xs text-ink">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-0.5">
              <span className="text-muted font-normal">{item.label}</span>
              <span className="font-bold text-ink">{item.amount}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-0.5">
            <span className="text-muted font-normal">Lainnya</span>
            <span className="font-bold text-ink">Rp 0</span>
          </div>
          <hr className="border-dashed border-soft my-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-extrabold text-ink uppercase tracking-wide">Total Tagihan</span>
            <span className="text-base font-extrabold text-[#2060A0]">{activeBill?.total || 'Rp 0'}</span>
          </div>
        </div>
      </div>

      {/* Histori Pembayaran IPL */}
      <div className="card-section p-6 print:hidden">
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
              {bills.map((history, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-ink">{history.month}</td>
                  <td className="text-muted">{history.ipl}</td>
                  <td className="text-muted">{history.parkir}</td>
                  <td className="font-extrabold text-ink">{history.total}</td>
                  <td className="text-muted">{history.tglBayar}</td>
                  <td className="text-muted">{history.metode}</td>
                  <td>
                    <span className={`badge-base ${history.status === 'Lunas' ? 'badge-mint' : 'badge-pink'}`}>
                      {history.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {/* KLIK AKSI MATA INI UNTUK MEMBUKA MODAL INVOICE RESMI */}
                    <button
                      onClick={() => handleViewInvoice(history)}
                      className="p-1.5 hover:bg-app-bg text-ink rounded-lg transition"
                      title="Lihat Invoice Resmi"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-xs font-semibold text-muted">
                    Belum ada riwayat tagihan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          2. MODAL BOX: FIX TAMPILAN INVOICE SESUAI GAMBAR REFERENSI
          ========================================================================= */}
      {modalOpen && selectedInvoice && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="fixed inset-0 print:hidden" onClick={() => setModalOpen(false)}></div>
          
          {/* Main Wrapper Konten Invoice */}
          <div 
            id="print-invoice-modal-content" 
            className="modal-box w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 border border-soft print:shadow-none print:border-none print:max-w-full"
          >
            {/* Tombol Close Pojok Kanan Atas (Hilang saat diprint) */}
            <button
              onClick={() => setModalOpen(false)}
              className="modal-close-icon absolute right-6 top-6 text-muted hover:text-ink transition print:hidden"
            >
              <X size={20} />
            </button>

            {/* Header Identitas SiManTap */}
            <div className="text-center border-b-2 border-[#2060A0] pb-4 space-y-1">
              <h1 className="text-3xl font-black text-[#2060A0] tracking-tight">SiManTap</h1>
              <p className="text-xs text-muted font-bold tracking-wide">Platform Manajemen Apartemen Cerdas</p>
              <p className="text-[10px] text-muted opacity-80">Grand Surabaya Apartment · Telp. 085755112289</p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center">
              <h2 className="text-sm font-black text-ink uppercase tracking-widest border-b-2 border-soft inline-block pb-1">
                INVOICE TAGIHAN IPL
              </h2>
            </div>

            {/* Metadata Info Grid Row */}
            <div className="grid grid-cols-2 gap-y-3 bg-app-bg/60 p-5 rounded-2xl text-xs font-semibold text-ink border border-soft">
              <div className="flex justify-between pr-4 border-r border-soft">
                <span className="text-muted">No. Invoice</span>
                <span className="font-bold">{selectedInvoice.trxId}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-muted">Periode Tagihan</span>
                <span className="font-bold">{selectedInvoice.month}</span>
              </div>
              <div className="flex justify-between pr-4 border-r border-soft">
                <span className="text-muted">No. Unit</span>
                <span className="font-bold">{selectedInvoice.unitNum}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-muted">Tanggal Cetak</span>
                <span className="font-medium">10 Juni 2026</span>
              </div>
              <div className="flex justify-between pr-4 border-r border-soft">
                <span className="text-muted">Nama Penghuni</span>
                <span className="font-bold">{selectedInvoice.tenantName}</span>
              </div>
              <div className="flex justify-between pl-4">
                {/* Spacer balance */}
              </div>
            </div>

            {/* Rincian Tabel Komponen Biaya */}
            <div className="space-y-3 font-semibold text-xs text-ink">
              <div className="bg-[#2060A0] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                Rincian Tagihan
              </div>
              
              <div className="space-y-2.5 px-2">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted font-normal">Iuran Pengelolaan Lingkungan (IPL)</span>
                  <span className="font-bold text-ink">{selectedInvoice.ipl}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted font-normal">Parkir Kendaraan</span>
                  <span className="font-bold text-ink">{selectedInvoice.parkir}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted font-normal">Lainnya</span>
                  <span className="font-bold text-ink">Rp 0</span>
                </div>
              </div>

              <hr className="border-dashed border-soft my-4" />
              
              <div className="flex justify-between items-center text-sm px-2">
                <span className="font-extrabold text-[#2060A0] uppercase tracking-wide">TOTAL TAGIHAN</span>
                <span className="text-lg font-black text-[#2060A0]">{selectedInvoice.total}</span>
              </div>
            </div>

            {/* NOTE: TULISAN BANNER KUNING "BELUM DIKONFIRMASI" TELAH DIHAPUS SEPENUHNYA DARI KODE INI */}

            {/* Footer Cetak Garis Dotted */}
            <div className="text-center pt-4 border-t border-dotted border-soft text-[9px] text-muted font-medium">
              Dokumen ini dicetak otomatis oleh sistem SiManTap · simantap.id · 10 Juni 2026
            </div>

            {/* Baris Tombol Aksi di Bagian Bawah Modal (Otomatis tersembunyi saat proses cetak printer) */}
            <div className="modal-action-buttons flex justify-end gap-3 pt-2 border-t border-soft print:hidden">
              <button
                onClick={handlePrintMock}
                className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 font-bold bg-[#2060A0] hover:bg-[#1a4f85] text-white transition"
              >
                <Printer size={14} />
                <span>Print / Simpan PDF</span>
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-soft text-ink hover:bg-app-bg transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successToast && (
        <div className="toast-modern toast-success print:hidden">
          <div>
            <p className="text-xs font-extrabold">Sukses</p>
            <p className="text-[10px] opacity-90">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}