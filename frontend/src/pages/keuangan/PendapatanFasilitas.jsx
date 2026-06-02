import React, { useState } from 'react';
import { AlertCircle, Calendar, HelpCircle, Loader2, Search, DollarSign } from 'lucide-react';

export default function PendapatanFasilitas() {
  const [reservations, setReservations] = useState([
    { id: 'RSV-0982', facility: 'Aula Clubhouse', unit: '12A', name: 'Hendra Gunawan', date: '30 Mei 2026', time: '09:00 - 13:00', price: 500000, status: 'Menunggu' },
    { id: 'RSV-0981', facility: 'Lapangan Tenis', unit: '05B', name: 'Maya Sari', date: '29 Mei 2026', time: '16:00 - 18:00', price: 150000, status: 'Lunas' },
    { id: 'RSV-0980', facility: 'Area BBQ Rooftop', unit: '18C', name: 'Rudi Hartono', date: '28 Mei 2026', time: '18:00 - 22:00', price: 300000, status: 'Menunggu' },
    { id: 'RSV-0979', facility: 'Lapangan Tenis', unit: '22B', name: 'Fajar Nugraha', date: '27 Mei 2026', time: '08:00 - 10:00', price: 150000, status: 'Lunas' },
    { id: 'RSV-0978', facility: 'Ruang Serbaguna', unit: '11B', name: 'Anita Kusuma', date: '26 Mei 2026', time: '13:00 - 17:00', price: 400000, status: 'Lunas' },
    { id: 'RSV-0977', facility: 'Area BBQ Rooftop', unit: '09C', name: 'Bima Rahardjo', date: '25 Mei 2026', time: '17:00 - 21:00', price: 300000, status: 'Menunggu' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('Semua');

  // Safety Confirmation and Loading states
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleOpenConfirm = (rsv) => {
    setConfirmTarget(rsv);
  };

  const handleCloseConfirm = () => {
    setConfirmTarget(null);
  };

  const handleExecuteLunas = () => {
    if (!confirmTarget) return;
    const targetId = confirmTarget.id;
    const targetFacility = confirmTarget.facility;
    const targetName = confirmTarget.name;

    // Close confirmation dialog
    setConfirmTarget(null);

    // Set row loading state
    setLoadingId(targetId);

    // Simulate 1.5s lag
    setTimeout(() => {
      setReservations(prev =>
        prev.map(r => {
          if (r.id === targetId) {
            return { ...r, status: 'Lunas' };
          }
          return r;
        })
      );
      setLoadingId(null);
      showToast(`Konfirmasi Lunas reservasi ${targetFacility} atas nama ${targetName} sukses dilakukan!`);
    }, 1500);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter reservations
  const filteredReservations = reservations.filter(r => {
    const matchesFacility = facilityFilter === 'Semua' || r.facility === facilityFilter;
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFacility && matchesSearch;
  });

  // Calculation for stats
  const totalIncome = reservations.reduce((sum, r) => sum + r.price, 0);
  const lunasIncome = reservations.filter(r => r.status === 'Lunas').reduce((sum, r) => sum + r.price, 0);
  const pendingIncome = reservations.filter(r => r.status === 'Menunggu').reduce((sum, r) => sum + r.price, 0);
  const pendingCount = reservations.filter(r => r.status === 'Menunggu').length;

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Full-width Warning Banner */}
      <div className="bg-[#FEF7EC] border border-soft p-4 rounded-2xl shadow-softer flex items-start gap-3">
        <AlertCircle size={20} className="text-[#B06020] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-[#B06020] uppercase tracking-wider">
            Rekonsiliasi Reservasi Fasilitas Aktif
          </h4>
          <p className="text-xs text-muted font-semibold mt-1">
            Seluruh transaksi penyewaan fasilitas wajib divalidasi ke bank statement sebelum dinyatakan Lunas. Gunakan tombol aksi "Konfirmasi Lunas" setelah memverifikasi nomor mutasi bank yang cocok.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card-section flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Filter selector */}
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="input-modern select-modern w-auto inline-block py-2 text-xs font-bold"
          >
            <option value="Semua">Semua Fasilitas</option>
            <option value="Aula Clubhouse">Aula Clubhouse</option>
            <option value="Lapangan Tenis">Lapangan Tenis</option>
            <option value="Area BBQ Rooftop">Area BBQ Rooftop</option>
            <option value="Ruang Serbaguna">Ruang Serbaguna</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari ID, unit, atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-8 w-56 py-2 text-xs"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
          </div>
        </div>

        <div className="text-xs font-bold text-muted">
          Menampilkan <span className="text-ink">{filteredReservations.length}</span> data reservasi
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pink */}
        <div className="card-pink flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Total Reservasi</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{reservations.length} Transaksi</h4>
          </div>
          <span className="text-[10px] text-[#8A857F] font-semibold mt-1">Sewa aktif bulan ini</span>
        </div>

        {/* Card 2: Yellow */}
        <div className="card-yellow flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Pemasukan Diterima</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(lunasIncome)}</h4>
          </div>
          <span className="text-[10px] text-[#187050] font-bold mt-1">Telah terekonsiliasi lunas</span>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Pemasukan Pending</span>
            <h4 className="text-[#1E1E1E] font-black text-xl mt-1.5">{formatRupiah(pendingIncome)}</h4>
          </div>
          <span className="text-[10px] text-[#B06020] font-bold mt-1">Dalam proses transfer</span>
        </div>

        {/* Card 4: Mint */}
        <div className="card-mint flex flex-col justify-between hover:shadow-soft transition">
          <div>
            <span className="text-[#8A857F] font-semibold text-xs uppercase tracking-wider block">Menunggu Validasi</span>
            <h4 className="text-[#C05040] font-black text-xl mt-1.5">{pendingCount} Pengajuan</h4>
          </div>
          <span className="text-[10px] text-[#C05040] font-bold mt-1">Verifikasi manual diperlukan</span>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="card-section p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-5 border-b border-soft mb-5">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Daftar Pembayaran Sewa Fasilitas
            </h3>
            <p className="text-[11px] text-muted font-bold mt-0.5">
              Kelola konfirmasi setoran dari penghuni apartemen terkait penyewaan area publik
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID Reservasi</th>
                <th>Nama Fasilitas</th>
                <th>Unit</th>
                <th>Nama Penghuni</th>
                <th>Tanggal Sewa</th>
                <th>Jam Sewa</th>
                <th>Nominal Sewa</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold text-ink">{row.id}</td>
                  <td className="text-ink font-semibold">{row.facility}</td>
                  <td className="font-bold text-ink">{row.unit}</td>
                  <td className="text-muted">{row.name}</td>
                  <td className="text-muted">{row.date}</td>
                  <td className="text-muted">{row.time}</td>
                  <td className="font-mono text-ink font-bold">{formatRupiah(row.price)}</td>
                  <td>
                    {row.status === 'Lunas' ? (
                      <span className="badge-base badge-mint">
                        Lunas
                      </span>
                    ) : (
                      <span className="badge-base badge-yellow">
                        Menunggu
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {row.status === 'Lunas' ? (
                      <span className="text-[#187050] text-[10px] font-bold uppercase tracking-wider">Terkonfirmasi</span>
                    ) : (
                      <button
                        onClick={() => handleOpenConfirm(row)}
                        disabled={loadingId === row.id}
                        className={`btn-primary text-[10px] py-1.5 px-3 ml-auto ${
                          loadingId === row.id 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {loadingId === row.id ? (
                          <>
                            <Loader2 size={10} className="animate-spin" />
                            <span>Proses...</span>
                          </>
                        ) : (
                          <span>Konfirmasi Lunas</span>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted font-bold">
                    Tidak ada reservasi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UI Safety Dialog Confirmation Modal */}
      {confirmTarget && (
        <div className="modal-overlay">
          <div className="fixed inset-0 bg-active/40 backdrop-blur-sm" onClick={handleCloseConfirm}></div>
          <div className="modal-box max-w-sm p-6 relative z-10 animate-scale-in text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-pastel-lavender-bg text-ink border border-soft flex items-center justify-center mx-auto shadow-softer">
              <HelpCircle size={24} />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">Konfirmasi Lunas Fasilitas</h4>
              <p className="text-xs text-muted font-medium">
                Apakah Anda yakin telah menerima setoran tunai atau mutasi masuk untuk reservasi <strong className="text-ink font-bold">{confirmTarget.id}</strong> ({confirmTarget.facility}) sebesar <strong className="text-ink font-bold">{formatRupiah(confirmTarget.price)}</strong> dari penghuni <strong className="text-ink font-bold">{confirmTarget.name}</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExecuteLunas}
                className="flex-1 btn-primary py-2.5 text-xs justify-center"
              >
                Ya, Konfirmasi Lunas
              </button>
              <button
                onClick={handleCloseConfirm}
                className="flex-1 btn-ghost text-xs justify-center border-none"
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
