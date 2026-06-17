import React, { useState, useEffect } from 'react';
import { Plus, X, FileDown, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LaporanPengeluaran() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState('April 2026');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // State untuk mengontrol modal konfirmasi status
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form states - Diselaraskan dengan nilai lowercase/snake_case di Supabase
  const [newExpense, setNewExpense] = useState({
    category: 'operasional', 
    desc: '',
    division: 'Pemeliharaan', 
    amount: '',
    status: 'proses' // Default 'proses' mengikuti DEFAULT skema database
  });

  useEffect(() => {
    async function loadExpenses() {
      try {
        setLoading(true);
        // Menyesuaikan query select dengan struktur foreign key public.users
        const { data, error } = await supabase
          .from('pengeluaran')
          .select('*, created_by:users(nama)')
          .order('tanggal', { ascending: false });

        if (error) throw error;

        if (data) {
          setExpenses(data.map(item => ({
            id: item.id,
            date: item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
            category: item.kategori || 'operasional', 
            desc: item.keterangan || '',
            division: item.divisi || 'Umum',
            amount: parseFloat(item.nominal) || 0, // Mengonversi tipe numeric database
            status: item.status || 'proses'
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

  // Helper untuk mengubah nilai database snake_case menjadi tampilan UI yang rapi
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'sdm_gaji': return 'SDM / Gaji';
      case 'operasional': return 'Operasional';
      case 'perbaikan': return 'Perbaikan';
      default: return category;
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'sdm_gaji': return 'badge-base badge-pink';
      case 'operasional': return 'badge-base badge-lavender';
      case 'perbaikan': return 'badge-base badge-yellow';
      default: return 'badge-base badge-gray';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'selesai': return 'badge-base badge-mint cursor-default select-none';
      case 'proses': return 'badge-base badge-yellow cursor-pointer hover:brightness-95 active:scale-95 transition-all duration-150 shadow-sm';
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
      // Step 1: Ambil User ID dari Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Autentikasi gagal. Silakan login kembali.');

      // Step 2: Ambil matching ID dari public.users menggunakan ID Auth (Lebih aman & cepat dibanding email)
      const { data: publicUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !publicUser) {
        throw new Error('User Anda belum terdaftar atau tidak ditemukan di tabel public.users.');
      }

      const today = new Date();
      const tanggal = today.toISOString().split('T');
      const nominal = parseInt(newExpense.amount);
      const { category: kategori, desc: keterangan, division: divisi, status } = newExpense;

      // Step 3: Insert data pengeluaran dengan ID public.users
      const { data, error } = await supabase
        .from('pengeluaran')
        .insert({
          tanggal,
          kategori,     // Nilai: 'sdm_gaji', 'operasional', atau 'perbaikan' (Lolos CHECK constraint)
          keterangan,
          divisi,
          nominal,
          status,       // Nilai: 'proses' atau 'selesai' (Lolos CHECK constraint)
          created_by: publicUser.id // Menggunakan ID dari public.users agar tidak memicu Foreign Key Error
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
          amount: parseFloat(data.nominal) || nominal,
          status: data.status || status
        };
        setExpenses(prev => [added, ...prev]);
        showToast(`Pengeluaran "${keterangan}" berhasil dicatat!`);
      }
    } catch (err) {
      console.error('Error lengkap Supabase:', err);
      alert(`Gagal menyimpan ke database: ${err.message}`); 
    } finally {
      setModalOpen(false);
      setNewExpense({ category: 'operasional', desc: '', division: 'Pemeliharaan', amount: '', status: 'proses' });
    }
  };

  const handleRequestToggleStatus = (item) => {
    if (item.status !== 'proses') return; 
    setSelectedExpense(item);
    setConfirmModalOpen(true);
  };

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
          item.id === selectedExpense.id ? { ...item, status: 'selesai' } : item
        )
      );
      showToast(`Status pengeluaran "${selectedExpense.desc}" berhasil diubah menjadi SELESAI!`);
    } catch (err) {
      console.error('Failed to update status in DB:', err.message);
      alert(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setConfirmModalOpen(false);
      setSelectedExpense(null);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Kalkulasi total pengeluaran
  const totalPengeluaran = expenses.reduce((sum, item) => sum + item.amount, 0);
  const sdmTotal = expenses.filter(item => item.category === 'sdm_gaji').reduce((sum, item) => sum + item.amount, 0);
  const operasionalTotal = expenses.filter(item => item.category === 'operasional').reduce((sum, item) => sum + item.amount, 0);
  const perbaikanTotal = expenses.filter(item => item.category === 'perbaikan').reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat Jurnal Keuangan...</div>;
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
                  <td><span className={getCategoryBadgeClass(row.category)}>{getCategoryLabel(row.category)}</span></td>
                  <td className="text-ink font-semibold">{row.desc}</td>
                  <td className="text-muted">{row.division}</td>
                  <td className="font-mono text-ink font-bold">{formatRupiah(row.amount)}</td>
                  <td>
                    <span 
                      onClick={() => handleRequestToggleStatus(row)}
                      className={getStatusBadgeClass(row.status)}
                      title={row.status === 'proses' ? 'Klik untuk verifikasi penyelesaian' : undefined}
                    >
                      {row.status === 'proses' ? 'Proses' : 'Selesai'}
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
                  <option value="sdm_gaji">SDM / Gaji</option>
                  <option value="operasional">Operasional</option>
                  <option value="perbaikan">Perbaikan</option>
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
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Umum">Umum / Semua</option>
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
                  <option value="proses">Proses</option>
                  <option value="selesai">Selesai</option>
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

      {/* Modal Pengaman Konfirmasi */}
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
    </div>
  );
}