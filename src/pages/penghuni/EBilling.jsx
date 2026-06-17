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

        // 1. Ambil ID internal dari tabel penghuni terlebih dahulu
        const { data: penghuniData, error: pError } = await supabase
          .from('penghuni')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (pError) throw pError;
        if (!penghuniData) {
          setLoading(false);
          return;
        }

        // 2. Ambil data tagihan menggunakan penghuni_id yang sah & join relasi ke unit serta tower
        const { data, error } = await supabase
          .from('tagihan')
          .select(`
            *,
            unit:unit_id(
              nomor_unit, 
              tower:tower_id(nama_tower)
            )
          `)
          .eq('penghuni_id', penghuniData.id)
          .order('periode', { ascending: false });

        if (error) throw error;

        // 3. Ambil nama user pelapor untuk tampilan invoice cetak
        const { data: userData } = await supabase
          .from('users')
          .select('nama')
          .eq('id', user.id)
          .single();

        // 4. Transformasi data agar sesuai dengan skema tabel tunggal 'jumlah' & 'jenis'
        const mappedBills = (data || []).map((bill) => {
          const nominal = Number(bill.jumlah) || 0;
          
          // Karena database berbasis single-item per baris (IPL, listrik, dll),
          // kita petakan dinamis demi estetika UI cetak invoice Anda
          const iplNominal = bill.jenis === 'IPL' ? nominal : 0;
          const biayaLainnya = bill.jenis !== 'IPL' ? nominal : 0;

          // Format penamaan bulan periode
          const namaBulan = bill.periode 
            ? new Date(bill.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
            : '—';

          // Format status ramah pengguna
          let statusLabel = 'Belum Bayar';
          if (bill.status === 'sudah_bayar') statusLabel = 'Lunas';
          if (bill.status === 'terlambat') statusLabel = 'Terlambat';

          return {
            id: bill.id,
            month: namaBulan,
            jenisTagihan: bill.jenis,
            ipl: formatRupiah(iplNominal),
            lainnya: formatRupiah(biayaLainnya),
            total: formatRupiah(nominal),
            tglBayar: bill.status === 'sudah_bayar' && bill.created_at
              ? new Date(bill.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
              : '—',
            metode: 'Transfer Bank (VA)',
            status: statusLabel,
            // Koreksi utama: Memakai kolom invoice_number bawaan dari database Anda sendiri
            trxId: bill.invoice_number || `INV-${String(bill.id).substring(0, 8).toUpperCase()}`,
            unitNum: bill.unit?.nomor_unit || '-',
            towerName: bill.unit?.tower?.nama_tower || '-',
            tenantName: userData?.nama || 'Penghuni',
            raw: bill
          };
        });

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
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat E-Billing...</div>;
  }

  // Generate rincian item dinamis berdasarkan isi baris tagihan aktif database
  const lineItems = activeBill ? [
    { label: `Biaya Iuran Komponen (${activeBill.jenisTagihan})`, amount: activeBill.total }
  ] : [];

  return (
    <div className="space-y-6 animate-fade-up relative text-zinc-800">
      
      {/* 🪄 STYLE PRINT RULES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: none !important;
            box-shadow: none !important;
          }
          #print-invoice-modal-content, #print-invoice-modal-content * {
            visibility: visible;
          }
          #print-invoice-modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .modal-action-buttons, .modal-close-icon {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      {/* =========================================================================
          1. HALAMAN UTAMA BROWSER
          ========================================================================= */}
      
      {/* Top Summary Card */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] print:hidden">
        <div>
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block mb-1">
            Tagihan Terakhir: {activeBill?.month || '—'} — Unit {activeBill?.unitNum || '—'} {activeBill?.towerName || ''}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">{activeBill?.total || 'Rp 0'}</h2>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium tracking-wide mt-4">
          Status: <span className="font-bold text-white">{activeBill?.status || 'Tidak ada tagihan'}</span> {activeBill?.tglBayar !== '—' ? `· Dibayar pada ${activeBill?.tglBayar}` : ''}
        </p>
      </div>

      {/* Box Rincian Tagihan Utama */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-5 print:hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Rincian Item Tagihan ({activeBill?.month || '—'})
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
              Sistem Penagihan Terpadu Apartemen
            </p>
          </div>
          {activeBill && (
            <button
              onClick={() => handleViewInvoice(activeBill)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
            >
              <Printer size={12} />
              <span>Lihat & Cetak Invoice</span>
            </button>
          )}
        </div>

        <div className="space-y-3 font-semibold text-xs text-zinc-700">
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 font-normal">{item.label}</span>
              <span className="font-bold text-zinc-900">{item.amount}</span>
            </div>
          ))}
          <hr className="border-dashed border-zinc-100 my-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-extrabold text-zinc-900 uppercase tracking-wide">Total Pembayaran</span>
            <span className="text-base font-extrabold text-zinc-950">{activeBill?.total || 'Rp 0'}</span>
          </div>
        </div>
      </div>

      {/* Histori Pembayaran IPL */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 print:hidden">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5">
          Histori Semua Invoice Tagihan
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">No. Invoice</th>
                <th className="pb-3">Periode</th>
                <th className="pb-3">Kategori Jenis</th>
                <th className="pb-3">Total Tagihan</th>
                <th className="pb-3">Tgl Pembayaran</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium">
              {bills.map((history, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 font-bold text-zinc-900">{history.trxId}</td>
                  <td className="py-3.5 text-zinc-600">{history.month}</td>
                  <td className="py-3.5 text-zinc-500">
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md font-bold text-[10px]">
                      {history.jenisTagihan}
                    </span>
                  </td>
                  <td className="py-3.5 font-extrabold text-zinc-900">{history.total}</td>
                  <td className="py-3.5 text-zinc-500">{history.tglBayar}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      history.status === 'Lunas' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {history.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleViewInvoice(history)}
                      className="p-1.5 hover:bg-zinc-100 text-zinc-700 rounded-lg transition inline-flex items-center"
                      title="Lihat Detail"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-xs font-semibold text-zinc-400">
                    Belum ada data riwayat tagihan terdaftar di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          2. MODAL BOX INVOICE CETAK RESMI
          ========================================================================= */}
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="fixed inset-0 print:hidden" onClick={() => setModalOpen(false)}></div>
          
          <div 
            id="print-invoice-modal-content" 
            className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl relative z-10 space-y-6 border border-zinc-100 print:shadow-none print:border-none print:max-w-full"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="modal-close-icon absolute right-6 top-6 text-zinc-400 hover:text-zinc-900 transition print:hidden"
            >
              <X size={20} />
            </button>

            {/* Header Identitas */}
            <div className="text-center border-b-2 border-zinc-900 pb-4 space-y-1">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">SiManTap</h1>
              <p className="text-xs text-zinc-500 font-bold tracking-wide">Platform Manajemen Apartemen Cerdas</p>
              <p className="text-[10px] text-zinc-400">Grand Surabaya Apartment · Telp. 085755112289</p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center">
              <h2 className="text-xs font-black text-zinc-900 uppercase tracking-widest border-b-2 border-zinc-900 inline-block pb-1">
                INVOICE RESMI TAGIHAN APARTEMEN
              </h2>
            </div>

            {/* Metadata Info Grid Row */}
            <div className="grid grid-cols-2 gap-y-3 bg-zinc-50 p-5 rounded-2xl text-xs font-semibold text-zinc-800 border border-zinc-100">
              <div className="flex justify-between pr-4 border-r border-zinc-200">
                <span className="text-zinc-400 font-normal">No. Invoice</span>
                <span className="font-bold">{selectedInvoice.trxId}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-zinc-400 font-normal">Periode Penagihan</span>
                <span className="font-bold">{selectedInvoice.month}</span>
              </div>
              <div className="flex justify-between pr-4 border-r border-zinc-200">
                <span className="text-zinc-400 font-normal">Nomor Unit / Tower</span>
                <span className="font-bold">{selectedInvoice.unitNum} / {selectedInvoice.towerName}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-zinc-400 font-normal">Tanggal Unduh</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between pr-4 border-r border-zinc-200">
                <span className="text-zinc-400 font-normal">Nama Penghuni</span>
                <span className="font-bold">{selectedInvoice.tenantName}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-zinc-400 font-normal">Status Invoice</span>
                <span className="font-bold text-zinc-900">{selectedInvoice.status}</span>
              </div>
            </div>

            {/* Rincian Tabel Komponen Biaya */}
            <div className="space-y-3 font-semibold text-xs text-zinc-800">
              <div className="bg-zinc-950 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                Rincian Tagihan
              </div>
              
              <div className="space-y-2.5 px-2">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 font-normal">Iuran Layanan Jenis ({selectedInvoice.jenisTagihan})</span>
                  <span className="font-bold text-zinc-900">{selectedInvoice.total}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-4 border-t border-zinc-100 px-2">
                <span className="font-extrabold text-zinc-900 uppercase tracking-wide">Grand Total</span>
                <span className="text-base font-extrabold text-zinc-950">{selectedInvoice.total}</span>
              </div>

              <div className="flex gap-3 pt-4 modal-action-buttons print:hidden">
                <button
                  onClick={handlePrintMock}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Download size={14} />
                  <span>Cetak / Save PDF</span>
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 print:hidden animate-fade-in">
          <div>
            <p className="text-xs font-extrabold">Sistem Pemrosesan</p>
            <p className="text-[10px] text-zinc-400">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}