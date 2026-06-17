import React, { useState, useEffect } from 'react';
import { Search, FileDown, Plus, X, Loader2, HelpCircle, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TagihanEBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); // State loading khusus generate otomatis

  const [period, setPeriod] = useState('April 2026');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const loadBillsData = async () => {
    const { data, error } = await supabase
      .from('tagihan')
      .select(`
        id,
        invoice_number,
        jumlah,
        periode,
        status,
        created_at,
        unit (
          nomor_unit,
          tower ( nama_tower )
        ),
        penghuni (
          id,
          users ( nama )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      return data.map(row => {
        const totalAmount = parseFloat(row.jumlah) || 0;
        const iplMock = totalAmount > 150000 ? totalAmount - 150000 : totalAmount;
        const parkirMock = totalAmount > 150000 ? 150000 : 0;

        let statusUI = 'Terlambat';
        if (row.status === 'lunas' || row.status === 'Lunas' || row.status === 'sudah_bayar') {
          statusUI = 'Lunas';
        } else if (row.status === 'menunggu' || row.status === 'Menunggu' || row.status === 'belum_bayar') {
          statusUI = 'Menunggu';
        }

        return {
          id: row.id,
          invoiceNumber: row.invoice_number || `INV-${row.id.toString().substring(0,8).toUpperCase()}`,
          unit: row.unit?.nomor_unit || '-',
          name: row.penghuni?.users?.nama || 'Anonim',
          tower: row.unit?.tower?.nama_tower || '-',
          ipl: iplMock,
          parkir: parkirMock,
          total: totalAmount,
          status: statusUI,
          payDate: (row.status === 'sudah_bayar' || row.status === 'lunas') && row.created_at 
            ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : '—'
        };
      });
    }
    return [];
  };

  useEffect(() => {
    async function initLoad() {
      try {
        setLoading(true);
        const mappedBills = await loadBillsData();
        setBills(mappedBills);
      } catch (err) {
        console.error('Error fetching bills:', err.message);
      } finally {
        setLoading(false);
      }
    }
    initLoad();
  }, []);

  // 🌟 UTILITY FUNCTION: Deteksi super aman menggunakan mapping regex murni
  const convertPeriodToDatabaseDate = (periodText) => {
    // Ekstrak angka tahun (4 digit) dari string apa pun
    const yearMatch = periodText.match(/\d{4}/);
    const year = yearMatch ? yearMatch : '2026';

    // Mapping nama bulan Indonesia ke angka string dua digit
    const monthMapping = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
      'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
      'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };

    let monthCode = '01';
    // Cari apakah ada nama bulan di dalam teks period tersebut
    for (const key in monthMapping) {
      if (periodText.toLowerCase().includes(key.toLowerCase())) {
        monthCode = monthMapping[key];
        break;
      }
    }

    // Mengembalikan format murni "YYYY-MM-DD" -> Contoh: "2026-04-01"
    return `${year}-${monthCode}-01`; 
  };

  // 🔥 LOGIKA REAL GENERATE TAGIHAN OTOMATIS MASSAL
  const handleGenerateTagihanOtomatis = async () => {
    try {
      setGenerating(true);

      // Memastikan nilai tanggal yang dioper bersih dan berupa format YYYY-MM-DD murni
      const validDatabaseDate = convertPeriodToDatabaseDate(period);

      // 1. Ambil data seluruh unit beserta penghuni aktifnya
      const { data: units, error: unitError } = await supabase
        .from('unit')
        .select(`
          id, 
          nomor_unit,
          penghuni ( id )
        `);

      if (unitError) throw unitError;
      if (!units || units.length === 0) {
        alert('Tidak ada data unit apartemen yang ditemukan di database.');
        return;
      }

      // 2. Ambil tagihan yang sudah ada di periode ini untuk mencegah duplikasi data
      const { data: existingBills, error: checkError } = await supabase
        .from('tagihan')
        .select('invoice_number')
        .eq('periode', validDatabaseDate);

      if (checkError) throw checkError;
      const existingInvoices = new Set(existingBills?.map(b => b.invoice_number) || []);

      // 3. Rumus nominal bawaan penentu (IPL Rp 770.000 + Parkir Rp 150.000 = Rp 920.000)
      const defaultIPL = 770000;
      const defaultParkir = 150000;
      const totalJumlah = defaultIPL + defaultParkir;

      const newBillsPayload = [];

      // Ambil teks penanda invoice murni abjad dan angka (cth: "April2026")
      const invoicePeriodStr = period.replace(/[^a-zA-Z0-9]/g, '');

      units.forEach(u => {
        const cleanUnitNum = u.nomor_unit.replace(/[^a-zA-Z0-9]/g, '');
        const generatedInvoiceNum = `INV-${invoicePeriodStr}-${cleanUnitNum}`;

        if (!existingInvoices.has(generatedInvoiceNum)) {
          newBillsPayload.push({
            invoice_number: generatedInvoiceNum,
            jumlah: totalJumlah,
            periode: validDatabaseDate, // 🌟 Format "YYYY-MM-DD" yang murni tanpa teks terselip
            status: 'belum_bayar', 
            unit_id: u.id,
            penghuni_id: u.penghuni && u.penghuni.length > 0 ? u.penghuni.id : null
          });
        }
      });

      if (newBillsPayload.length === 0) {
        showToast(`Tagihan seluruh unit untuk periode ${period} sudah siap dan terisi.`);
        return;
      }

      // 4. Kirim data baru sekaligus secara massal (Bulk Insert)
      const { error: insertError } = await supabase
        .from('tagihan')
        .insert(newBillsPayload);

      if (insertError) throw insertError;

      // 5. Refresh visual tabel depan dan tampilkan umpan balik sukses
      const refreshedData = await loadBillsData();
      setBills(refreshedData);
      showToast(`Sukses memproses ${newBillsPayload.length} tagihan baru untuk periode ${period}!`);

    } catch (err) {
      console.error('Error executing automated bill generator:', err.message);
      alert(`Gagal memproses tagihan otomatis: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenConfirm = (bill) => {
    setConfirmTarget(bill);
  };

  const handleCloseConfirm = () => {
    setConfirmTarget(null);
  };

  const handleExecuteLunas = async () => {
    if (!confirmTarget) return;
    const targetId = confirmTarget.id;
    const targetName = confirmTarget.name;
    
    setConfirmTarget(null);
    setLoadingId(targetId);

    try {
      const { error } = await supabase
        .from('tagihan')
        .update({ status: 'sudah_bayar' })
        .eq('id', targetId);

      if (error) throw error;

      const updatedBills = await loadBillsData();
      setBills(updatedBills);
      
      showToast(`Konfirmasi Lunas untuk ${targetName} berhasil dilakukan!`);
    } catch (err) {
      console.error('Error confirming payment:', err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const filteredBills = bills.filter(bill => {
    const matchesStatus = statusFilter === 'Semua' || bill.status === statusFilter;
    const matchesSearch = 
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.unit.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportExcel = () => {
    if (filteredBills.length === 0) {
      showToast('Tidak ada data untuk diexport!');
      return;
    }

    const headers = ['Nomor Invoice', 'Unit', 'Nama Penghuni', 'Tower', 'IPL', 'Parkir', 'Total Tagihan', 'Status', 'Tanggal Bayar'];
    
    const rows = filteredBills.map(b => [
      `"${b.invoiceNumber}"`,
      `"${b.unit}"`,
      `"${b.name}"`,
      `"${b.tower}"`,
      b.ipl,
      b.parkir,
      b.total,
      `"${b.status}"`,
      `"${b.payDate}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Tagihan_Billing_${period.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data tagihan berhasil di-export ke format Excel/CSV!');
  };

  const handlePrintNota = (item) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Tagihan - ${item.invoiceNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e1e1e; }
            .meta-box { margin-top: 20px; display: flex; justify-content: space-between; font-size: 14px; }
            .table-nota { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table-nota th { background: #f4f4f4; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            .table-nota td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row { font-weight: bold; font-size: 16px; background: #fafafa; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px dashed #ccc; padding-top: 20px; }
            .badge { padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block; }
            .badge-lunas { background: #e6f7ed; color: #187050; }
            .badge-proses { background: #fff9db; color: #a05820; }
            @media print {
              body { padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">SiManTap Apartments</div>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">Sistem Manajemen Finansial Hunian Modern</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">NOTA TAGIHAN</div>
              <div style="color: #666; font-size: 13px; margin-top: 5px;">${item.invoiceNumber}</div>
            </div>
          </div>
          
          <div class="meta-box">
            <div>
              <strong>Ditujukan Kepada:</strong><br>
              Nama: ${item.name}<br>
              Unit: ${item.unit} (${item.tower})
            </div>
            <div style="text-align: right;">
              <strong>Detail Invoice:</strong><br>
              Periode: ${period}<br>
              Status: <span class="badge ${item.status === 'Lunas' ? 'badge-lunas' : 'badge-proses'}">${item.status.toUpperCase()}</span><br>
              Tgl Bayar: ${item.payDate}
            </div>
          </div>

          <table class="table-nota">
            <thead>
              <tr>
                <th>Deskripsi Pembiayaan</th>
                <th style="text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Iuran Pengelolaan Lingkungan (IPL)</td>
                <td style="text-align: right;">${formatRupiah(item.ipl)}</td>
              </tr>
              <tr>
                <td>Fasilitas Parkir Berlangganan</td>
                <td style="text-align: right;">${formatRupiah(item.parkir)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL YANG DIBAYARKAN</td>
                <td style="text-align: right; color: #1e1e1e;">${formatRupiah(item.total)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Terima kasih atas pembayaran tepat waktu Anda untuk kenyamanan bersama.</p>
            <p style="font-style: italic; color: #aaa; margin-top: 15px;">Dicetak otomatis melalui Sistem Finansial SiManTap · Dokumen ini Sah</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalBillsCount = bills.length;
  const lunasCount = bills.filter(b => b.status === 'Lunas').length;
  const menungguCount = bills.filter(b => b.status === 'Menunggu').length;
  const terlambatCount = bills.filter(b => b.status === 'Terlambat').length;

  const lunasAmount = bills.filter(b => b.status === 'Lunas').reduce((sum, b) => sum + b.total, 0);
  const menungguAmount = bills.filter(b => b.status === 'Menunggu').reduce((sum, b) => sum + b.total, 0);
  const terlambatAmount = bills.filter(b => b.status === 'Terlambat').reduce((sum, b) => sum + b.total, 0);

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat modul e-billing...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Row */}
      <div className="card-section p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-modern input-modern text-xs font-bold py-2 w-44"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none z-10 text-muted flex items-center justify-center">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Cari unit atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pr-4 py-2 text-xs font-semibold w-52"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        <button
          onClick={handleGenerateTagihanOtomatis}
          disabled={generating}
          className="btn-primary btn-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          <span>{generating ? 'Membuat Tagihan...' : 'Generate Tagihan Otomatis'}</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Tagihan</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">{totalBillsCount} Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">{period}</span>
        </div>

        <div className="card-yellow flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Sudah Lunas</span>
            <h4 className="text-[#187050] font-black text-2xl mt-1">{lunasCount} Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">{formatRupiah(lunasAmount)} terkumpul</span>
        </div>

        <div className="card-lavender flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Menunggu</span>
            <h4 className="text-[#A05820] font-black text-2xl mt-1">{menungguCount} Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">{formatRupiah(menungguAmount)} pending</span>
        </div>

        <div className="card-mint flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Terlambat</span>
            <h4 className="text-[#C05040] font-black text-2xl mt-1">{terlambatCount} Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">{formatRupiah(terlambatAmount)} tunggakan</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-section flex flex-col">
        <div className="card-section-header">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Daftar E-Billing Seluruh Penghuni
            </h3>
          </div>
          <button
            onClick={handleExportExcel}
            className="btn-ghost btn-sm flex items-center justify-center gap-1.5"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>
        </div>

        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Nama Penghuni</th>
                <th>Tower</th>
                <th>IPL</th>
                <th>Parkir</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tgl Bayar</th>
                <th className="text-center w-16">Nota</th>
                <th className="text-right pr-6 w-32">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-6 text-muted font-normal">Tidak ada data tagihan yang sesuai filter.</td>
                </tr>
              ) : (
                filteredBills.map((row) => (
                  <tr key={row.id}>
                    <td className="font-bold text-ink">{row.unit}</td>
                    <td className="font-bold text-ink">{row.name}</td>
                    <td className="text-muted">{row.tower}</td>
                    <td className="font-mono text-muted">{formatRupiah(row.ipl)}</td>
                    <td className="font-mono text-muted">{formatRupiah(row.parkir)}</td>
                    <td className="font-mono text-ink font-bold">{formatRupiah(row.total)}</td>
                    <td>
                      {row.status === 'Lunas' ? (
                        <span className="badge-base badge-mint">Lunas</span>
                      ) : row.status === 'Menunggu' ? (
                        <span className="badge-base badge-yellow">Menunggu</span>
                      ) : (
                        <span className="badge-base badge-pink">Terlambat</span>
                      )}
                    </td>
                    <td className="text-muted font-medium">{row.payDate}</td>
                    
                    <td className="text-center">
                      <button
                        onClick={() => handlePrintNota(row)}
                        className="p-2 text-ink hover:text-ink/70 hover:bg-gray-100 rounded-lg inline-flex items-center justify-center transition"
                        title="Print Invoice"
                      >
                        <Printer size={15} />
                      </button>
                    </td>

                    <td className="text-right pr-6">
                      <div className="flex justify-end font-bold text-[10px] tracking-wider uppercase">
                        {row.status === 'Lunas' ? (
                          <span className="badge-base badge-mint py-1 px-2.5">Selesai</span>
                        ) : (
                          <button
                            onClick={() => handleOpenConfirm(row)}
                            disabled={loadingId === row.id}
                            className={`px-3 py-1.5 rounded-full text-white font-bold transition flex items-center gap-1 shadow-sm ${
                              loadingId === row.id 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : row.status === 'Menunggu' 
                                ? 'bg-ink hover:bg-active' 
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {loadingId === row.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <span>Konfirmasi</span>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="p-4 border-t border-soft italic text-[11px] text-muted">
          * Statistik di atas dikalkulasi otomatis secara real-time dari relasi tabel PostgreSQL Supabase.
        </p>
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="modal-overlay">
          <div className="modal-box text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EEEDFB] text-[#4840B0] flex items-center justify-center mx-auto shadow-sm">
              <HelpCircle size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">Konfirmasi Pembayaran</h4>
              <p className="text-xs text-muted font-medium leading-relaxed">
                Apakah Anda yakin ingin menyatakan tagihan unit <strong className="text-ink font-bold">{confirmTarget.unit}</strong> ({confirmTarget.name}) sebesar <strong className="text-ink font-bold">{formatRupiah(confirmTarget.total)}</strong> telah <strong className="text-ink font-bold">LUNAS</strong>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExecuteLunas}
                className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
              >
                Ya, Konfirmasi Lunas
              </button>
              <button
                onClick={handleCloseConfirm}
                className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
            </div>
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