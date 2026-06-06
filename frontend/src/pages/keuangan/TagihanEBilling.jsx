import React, { useState } from 'react';
import { Search, FileDown, Plus, X, Loader2, HelpCircle, Printer } from 'lucide-react';

export default function TagihanEBilling() {
  const [bills, setBills] = useState([
    { id: 1, unit: '12A', name: 'Hendra Gunawan', tower: 'Tower A', ipl: 770000, parkir: 150000, lainnya: 0, total: 920000, status: 'Lunas', payDate: '15 Apr 2026' },
    { id: 2, unit: '05B', name: 'Maya Sari', tower: 'Tower A', ipl: 770000, parkir: 50000, lainnya: 0, total: 820000, status: 'Menunggu', payDate: '—' },
    { id: 3, unit: '18C', name: 'Rudi Hartono', tower: 'Tower B', ipl: 770000, parkir: 150000, lainnya: 0, total: 920000, status: 'Terlambat', payDate: '—' },
    { id: 4, unit: '07A', name: 'Dewi Lestari', tower: 'Tower A', ipl: 770000, parkir: 0, lainnya: 0, total: 770000, status: 'Lunas', payDate: '12 Apr 2026' },
    { id: 5, unit: '22B', name: 'Fajar Nugraha', tower: 'Tower B', ipl: 770000, parkir: 150000, lainnya: 25000, total: 945000, status: 'Menunggu', payDate: '—' },
    { id: 6, unit: '11B', name: 'Anita Kusuma', tower: 'Tower B', ipl: 770000, parkir: 0, lainnya: 0, total: 770000, status: 'Terlambat', payDate: '—' },
    { id: 7, unit: '09C', name: 'Bima Rahardjo', tower: 'Tower C', ipl: 770000, parkir: 150000, lainnya: 0, total: 920000, status: 'Menunggu', payDate: '—' }
  ]);

  const [period, setPeriod] = useState('April 2026');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const handleOpenConfirm = (bill) => {
    setConfirmTarget(bill);
  };

  const handleCloseConfirm = () => {
    setConfirmTarget(null);
  };

  const handleExecuteLunas = () => {
    if (!confirmTarget) return;
    const targetId = confirmTarget.id;
    const targetName = confirmTarget.name;
    
    setConfirmTarget(null);
    setLoadingId(targetId);

    setTimeout(() => {
      setBills(prev => 
        prev.map(b => {
          if (b.id === targetId) {
            const today = new Date();
            const formattedDate = today.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            return {
              ...b,
              status: 'Lunas',
              payDate: formattedDate
            };
          }
          return b;
        })
      );
      setLoadingId(null);
      showToast(`Konfirmasi Lunas untuk ${targetName} berhasil dilakukan!`);
    }, 1500);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleGenerateInvoice = () => {
    showToast('Generate tagihan bulanan otomatis berhasil diproses!');
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

          {/* 🔥 SEKSI INPUT PENCARIAN YANG SUDAH DIPERBAIKI AGAR TIDAK TUMPUK */}
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
          onClick={handleGenerateInvoice}
          className="btn-primary btn-sm flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>Generate Tagihan Otomatis</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Total Tagihan</span>
            <h4 className="text-[#1E1E1E] font-black text-2xl mt-1">440 Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">April 2026</span>
        </div>

        <div className="card-yellow flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Sudah Lunas</span>
            <h4 className="text-[#187050] font-black text-2xl mt-1">322 Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Rp 248 Jt terkumpul</span>
        </div>

        <div className="card-lavender flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Menunggu</span>
            <h4 className="text-[#A05820] font-black text-2xl mt-1">58 Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Rp 44.6 Jt pending</span>
        </div>

        <div className="card-mint flex flex-col justify-between">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider">Terlambat</span>
            <h4 className="text-[#C05040] font-black text-2xl mt-1">60 Unit</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1 block">Rp 46.2 Jt tunggakan</span>
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
            onClick={() => showToast('Data tagihan berhasil diexport ke format Excel!')}
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
                <th>Lainnya</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tgl Bayar</th>
                <th className="text-center w-16">Nota</th>
                <th className="text-right pr-6 w-32">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {filteredBills.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold text-ink">{row.unit}</td>
                  <td className="font-bold text-ink">{row.name}</td>
                  <td className="text-muted">{row.tower}</td>
                  <td className="font-mono text-muted">{formatRupiah(row.ipl)}</td>
                  <td className="font-mono text-muted">{formatRupiah(row.parkir)}</td>
                  <td className="font-mono text-muted">{formatRupiah(row.lainnya)}</td>
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
                      onClick={() => showToast(`Mencetak invoice unit ${row.unit} (Simulasi)...`)}
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
              ))}
            </tbody>
          </table>
        </div>

        <p className="p-4 border-t border-soft italic text-[11px] text-muted">
          * Rata-rata tagihan IPL: Rp 770.000/unit/Bulan · Parkir: Rp 150.000/kendaraan
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