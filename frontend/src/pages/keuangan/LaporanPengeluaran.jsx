import React, { useState } from 'react';
import { Plus, X, FileDown } from 'lucide-react';

export default function LaporanPengeluaran() {
  const [expenses, setExpenses] = useState([
    { id: 1, date: '01 Apr', category: 'SDM/Gaji', desc: 'Gaji karyawan bulanan', division: 'Semua Divisi', amount: 68000000, status: 'Selesai' },
    { id: 2, date: '05 Apr', category: 'Operasional', desc: 'Listrik & Air Gedung', division: 'Keamanan', amount: 18500000, status: 'Selesai' },
    { id: 3, date: '08 Apr', category: 'Perbaikan', desc: 'Ganti pompa air Tower B', division: 'Pemeliharaan', amount: 12000000, status: 'Selesai' },
    { id: 4, date: '10 Apr', category: 'Operasional', desc: 'Pengadaan alat kebersihan', division: 'Kebersihan', amount: 3200000, status: 'Selesai' },
    { id: 5, date: '12 Apr', category: 'Perbaikan', desc: 'Perbaikan lift Tower A lantai 10', division: 'Pemeliharaan', amount: 8500000, status: 'Proses' },
    { id: 6, date: '15 Apr', category: 'Operasional', desc: 'Internet & keamanan CCTV', division: 'Keamanan', amount: 5600000, status: 'Selesai' },
    { id: 7, date: '18 Apr', category: 'Perbaikan', desc: 'Cat ulang koridor Tower C', division: 'Pemeliharaan', amount: 4200000, status: 'Proses' }
  ]);

  const [period, setPeriod] = useState('April 2026');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: 'Operasional',
    desc: '',
    division: 'Umum',
    amount: '', // numeric string only
    status: 'Selesai'
  });

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'SDM/Gaji': return 'badge-base badge-pink';
      case 'Operasional': return 'badge-base badge-lavender';
      case 'Perbaikan': return 'badge-base badge-yellow';
      default: return 'badge-base badge-gray';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Selesai': return 'badge-base badge-mint';
      case 'Proses': return 'badge-base badge-yellow';
      default: return 'badge-base badge-gray';
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Lock Non-Numeric Inputs: Regex replaces anything that is NOT a digit
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitized = value.replace(/\D/g, ''); // Locks non-numeric characters
    setNewExpense(prev => ({ ...prev, amount: sanitized }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.desc || !newExpense.amount) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });

    const added = {
      id: Date.now(),
      date: formattedDate,
      category: newExpense.category,
      desc: newExpense.desc,
      division: newExpense.division,
      amount: parseInt(newExpense.amount),
      status: newExpense.status
    };

    setExpenses(prev => [added, ...prev]);
    setModalOpen(false);
    showToast(`Pengeluaran "${newExpense.desc}" berhasil dicatat!`);
    setNewExpense({ category: 'Operasional', desc: '', division: 'Umum', amount: '', status: 'Selesai' });
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls row */}
      <div className="card-section flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-modern select-modern w-auto inline-block py-2 text-xs font-bold"
          >
            <option value="April 2026">April 2026</option>
            <option value="Maret 2026">Maret 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs"
          >
            <Plus size={14} />
            <span>Input Pengeluaran</span>
          </button>
          
          <button
            onClick={() => showToast('Data pengeluaran berhasil diexport ke format Excel!')}
            className="btn-ghost py-2.5 px-4 text-xs font-bold shadow-softer"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink */}
        <div className="card-pink flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Total Pengeluaran</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">Rp 142 Jt</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">April 2026</span>
        </div>

        {/* Card 2: Yellow */}
        <div className="card-yellow flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">SDM & Gaji</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">Rp 68 Jt</h4>
          </div>
          <span className="text-[10px] text-[#A05820] font-black mt-1">47.9% dari total</span>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Operasional</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">Rp 42 Jt</h4>
          </div>
          <span className="text-[10px] text-[#4840B0] font-black mt-1">29.6% dari total</span>
        </div>

        {/* Card 4: Mint */}
        <div className="card-mint flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Perbaikan Fasilitas</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">Rp 32 Jt</h4>
          </div>
          <span className="text-[10px] text-[#187050] font-black mt-1">22.5% dari total</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="pb-4 border-b border-soft mb-5">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
            Detail Pengeluaran — April 2026
          </h3>
          <p className="text-xs text-muted font-semibold mt-0.5">Buku jurnal pengeluaran operasional dan pemeliharaan gedung terverifikasi</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Divisi</th>
                <th>Nominal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.date}</td>
                  <td>
                    <span className={getCategoryBadgeClass(row.category)}>
                      {row.category}
                    </span>
                  </td>
                  <td className="text-ink font-semibold">{row.desc}</td>
                  <td className="text-muted">{row.division}</td>
                  <td className="font-mono text-ink font-bold">{formatRupiah(row.amount)}</td>
                  <td>
                    <span className={getStatusBadgeClass(row.status)}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="modal-box max-w-md relative z-10 animate-scale-in">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Input Pengeluaran Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpense} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Kategori</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  className="input-modern select-modern"
                >
                  <option value="SDM/Gaji">SDM / Gaji</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Perbaikan">Perbaikan</option>
                </select>
              </div>

              <div>
                <label className="label-modern">Keterangan Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Beli solar genset tower C"
                  value={newExpense.desc}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, desc: e.target.value }))}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Divisi</label>
                  <select
                    value={newExpense.division}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, division: e.target.value }))}
                    className="input-modern select-modern"
                  >
                    <option value="Umum">Umum / Semua</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Fasilitas">Fasilitas</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Nominal Anggaran (Rupiah)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1500000"
                    value={newExpense.amount}
                    onChange={handleAmountChange} // Locks non-numeric inputs
                    className="input-modern font-mono"
                  />
                  <p className="text-[9px] text-muted mt-1 font-semibold">*Hanya diperbolehkan memasukkan angka.</p>
                </div>
              </div>

              <div>
                <label className="label-modern">Status Awal</label>
                <select
                  value={newExpense.status}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, status: e.target.value }))}
                  className="input-modern select-modern"
                >
                  <option value="Selesai">Selesai</option>
                  <option value="Proses">Proses</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 text-xs"
                >
                  Simpan Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost text-xs border-none"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
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
