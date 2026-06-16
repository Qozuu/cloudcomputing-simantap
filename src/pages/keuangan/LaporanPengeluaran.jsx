import React, { useState, useEffect } from 'react';
import { Plus, X, FileDown, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LaporanPengeluaran() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState('April 2026');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // 1. STATE BARU: Untuk mengontrol modal konfirmasi status
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: 'Operasional',
    desc: '',
    division: 'Umum',
    amount: '',
    status: 'Selesai'
  });

  useEffect(() => {
    async function loadExpenses() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pengeluaran')
          .select('*, created_by:users(nama)')
          .order('tanggal', { ascending: false });

        if (error) throw error;

        if (data) {
          setExpenses(data.map(item => ({
            id: item.id,
            date: item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            category: item.kategori || 'Operasional',
            desc: item.keterangan || '',
            division: item.divisi || 'Umum',
            amount: item.nominal || 0,
            status: item.status ? (item.status.toLowerCase() === 'proses' ? 'Proses' : 'Selesai') : 'Selesai'
          })));
        }
      } catch (err) {
        console.error('Failed to load expenses:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadExpenses();
  }, []);

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
      case 'Selesai': return 'badge-base badge-mint cursor-default select-none';
      case 'Proses': return 'badge-base badge-yellow cursor-pointer hover:brightness-95 active:scale-95 transition-all duration-150 shadow-sm';
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

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitized = value.replace(/\D/g, '');
    setNewExpense(prev => ({ ...prev, amount: sanitized }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.desc || !newExpense.amount) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      const tanggal = today.toISOString().split('T')[0];
      const nominal = parseInt(newExpense.amount);
      const { category: kategori, desc: keterangan, division: divisi } = newExpense;

      const { data, error } = await supabase
        .from('pengeluaran')
        .insert({
          tanggal,
          kategori,
          keterangan,
          divisi,
          nominal,
          status: 'proses',
          created_by: user.id
        })
        .select('*, created_by:users(nama)')
        .single();

      if (error) throw error;

      if (data) {
        const added = {
          id: data.id,
          date: data.tanggal ? new Date(data.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : new Date(data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          category: data.kategori || kategori,
          desc: data.keterangan || keterangan,
          division: data.divisi || divisi,
          amount: data.nominal || nominal,
          status: 'Proses'
        };
        setExpenses(prev => [added, ...prev]);
        showToast(`Pengeluaran "${keterangan}" berhasil dicatat!`);
      }
    } catch (err) {
      console.error('Failed to insert in DB:', err.message);
      showToast(`Gagal mencatat pengeluaran: ${err.message}`);
    } finally {
      setModalOpen(false);
      setNewExpense({ category: 'Operasional', desc: '', division: 'Umum', amount: '', status: 'Selesai' });
    }
  };

  // 2. LOGIKA BARU: Klik badge tidak langsung mengubah data, melainkan membuka modal pengaman dulu
  const handleRequestToggleStatus = (item) => {
    if (item.status !== 'Proses') return; // Kunci jika sudah Selesai
    setSelectedExpense(item);
    setConfirmModalOpen(true);
  };

  // 3. LOGIKA BARU: Eksekusi perubahan status HANYA jika disetujui di dalam modal
  const handleConfirmStatusChange = async () => {
    if (!selectedExpense) return;

    try {
      const { error } = await supabase
        .from('pengeluaran')
        .update({ status: 'selesai' })
        .eq('id', selectedExpense.id);

      if (error) throw error;

      setExpenses(prevExpenses =>
        prevExpenses.map(item =>
          item.id === selectedExpense.id ? { ...item, status: 'Selesai' } : item
        )
      );
      showToast(`Status pengeluaran "${selectedExpense.desc}" berhasil diubah menjadi SELESAI!`);
    } catch (err) {
      console.error('Failed to update status in DB:', err.message);
      showToast(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setConfirmModalOpen(false);
      setSelectedExpense(null);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const totalPengeluaran = expenses.reduce((sum, item) => sum + item.amount, 0);
  const sdmTotal = expenses.filter(item => item.category === 'SDM/Gaji').reduce((sum, item) => sum + item.amount, 0);
  const operasionalTotal = expenses.filter(item => item.category === 'Operasional').reduce((sum, item) => sum + item.amount, 0);
  const perbaikanTotal = expenses.filter(item => item.category === 'Perbaikan').reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

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
          <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs">
            <Plus size={14} />
            <span>Input Pengeluaran</span>
          </button>
          <button onClick={() => showToast('Data pengeluaran berhasil diexport ke format Excel!')} className="btn-ghost py-2.5 px-4 text-xs font-bold shadow-softer">
            <FileDown size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-pink flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Total Pengeluaran</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(totalPengeluaran)}</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">April 2026</span>
        </div>
        <div className="card-yellow flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">SDM & Gaji</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(sdmTotal)}</h4>
          </div>
          <span className="text-[10px] text-[#A05820] font-black mt-1">{totalPengeluaran > 0 ? ((sdmTotal / totalPengeluaran) * 100).toFixed(1) : 0}% dari total</span>
        </div>
        <div className="card-lavender flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Operasional</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(operasionalTotal)}</h4>
          </div>
          <span className="text-[10px] text-[#4840B0] font-black mt-1">{totalPengeluaran > 0 ? ((operasionalTotal / totalPengeluaran) * 100).toFixed(1) : 0}% dari total</span>
        </div>
        <div className="card-mint flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Perbaikan Fasilitas</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(perbaikanTotal)}</h4>
          </div>
          <span className="text-[10px] text-[#187050] font-black mt-1">{totalPengeluaran > 0 ? ((perbaikanTotal / totalPengeluaran) * 100).toFixed(1) : 0}% dari total</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="pb-4 border-b border-soft mb-5">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Detail Pengeluaran — April 2026</h3>
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
                  <td><span className={getCategoryBadgeClass(row.category)}>{row.category}</span></td>
                  <td className="text-ink font-semibold">{row.desc}</td>
                  <td className="text-muted">{row.division}</td>
                  <td className="font-mono text-ink font-bold">{formatRupiah(row.amount)}</td>
                  <td>
                    {/* Mengarah ke fungsi penanganan request konfirmasi */}
                    <span 
                      onClick={() => handleRequestToggleStatus(row)}
                      className={getStatusBadgeClass(row.status)}
                      title={row.status === 'Proses' ? 'Klik untuk verifikasi penyelesaian' : undefined}
                    >
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
            <div className="modal-header">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Input Pengeluaran Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Kategori</label>
                <select value={newExpense.category} onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))} className="input-modern select-modern">
                  <option value="SDM/Gaji">SDM / Gaji</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Perbaikan">Perbaikan</option>
                </select>
              </div>
              <div>
                <label className="label-modern">Keterangan Pengeluaran</label>
                <input type="text" required placeholder="Misal: Beli solar genset tower C" value={newExpense.desc} onChange={(e) => setNewExpense(prev => ({ ...prev, desc: e.target.value }))} className="input-modern" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Divisi</label>
                  <select value={newExpense.division} onChange={(e) => setNewExpense(prev => ({ ...prev, division: e.target.value }))} className="input-modern select-modern">
                    <option value="Umum">Umum / Semua</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Fasilitas">Fasilitas</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Nominal Anggaran (Rupiah)</label>
                  <input type="text" required placeholder="Contoh: 1500000" value={newExpense.amount} onChange={handleAmountChange} className="input-modern font-mono" />
                </div>
              </div>
              <div>
                <label className="label-modern">Status Awal</label>
                <select value={newExpense.status} onChange={(e) => setNewExpense(prev => ({ ...prev, status: e.target.value }))} className="input-modern select-modern">
                  <option value="Selesai">Selesai</option>
                  <option value="Proses">Proses</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary py-2.5 text-xs">Simpan Pengeluaran</button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-xs border-none">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL BARU: Modal Pengaman Konfirmasi Anti-Salah-Pencet */}
      {confirmModalOpen && selectedExpense && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmModalOpen(false)}></div>
          <div className="modal-box max-w-sm relative z-10 p-5 rounded-2xl animate-scale-in bg-white shadow-xl border border-soft">
            <div className="flex items-center gap-3 text-amber-500 mb-3">
              <AlertTriangle size={24} className="animate-pulse" />
              <h3 className="text-sm font-black text-ink uppercase tracking-wide">Konfirmasi Verifikasi</h3>
            </div>
            
            <p className="text-xs text-muted font-medium leading-relaxed">
              Apakah Anda yakin ingin mengubah status pengeluaran <strong className="text-ink">"{selectedExpense.desc}"</strong> sebesar <strong className="text-ink font-mono">{formatRupiah(selectedExpense.amount)}</strong> menjadi <span className="text-emerald-600 font-bold">Selesai</span>?
            </p>
            <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200/60 p-2 rounded-lg mt-3">
              ⚠️ Tindakan ini akan mengunci pencatatan jurnal keuangan secara permanen.
            </p>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-soft">
              <button
                onClick={handleConfirmStatusChange}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-sm"
              >
                Ya, Selesaikan
              </button>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="btn-ghost text-xs border border-soft py-2 px-4 rounded-xl text-muted"
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
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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