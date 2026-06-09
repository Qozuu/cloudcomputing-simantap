import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Plus,
  X,
  Printer,
  CheckCircle2,
  Info,
  LogOut
} from 'lucide-react';

export default function LogTamu() {
  const [showToast, setShowToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [namaTamu, setNamaTamu] = useState('');
  const [tujuanUnit, setTujuanUnit] = useState('');
  const [keperluan, setKeperluan] = useState('Tamu pribadi');
  const [noKendaraan, setNoKendaraan] = useState('');

  // Initial table data
  const [tamuList, setTamuList] = useState([
    {
      id: 1,
      nama: 'Budi Susanto',
      unit: '12A - Hendra G.',
      masuk: '09:30',
      keluar: '-',
      keperluan: 'Tamu pribadi',
      status: 'Di Dalam'
    },
    {
      id: 2,
      nama: 'Delivery JNE',
      unit: '05B - Maya S.',
      masuk: '09:15',
      keluar: '09:20',
      keperluan: 'Pengiriman',
      status: 'Keluar'
    }
  ]);

  // Page mount auto-dismissing toast (4 seconds)
  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleScanClick = () => {
    setShowToast(true);
    // Refresh dismissal
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleCreateTamu = (e) => {
    e.preventDefault();
    if (!namaTamu.trim() || !tujuanUnit.trim()) return;

    const today = new Date();
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newTamu = {
      id: Date.now(),
      nama: namaTamu,
      unit: tujuanUnit,
      masuk: timeStr,
      keluar: '-',
      keperluan: keperluan,
      status: 'Di Dalam'
    };

    setTamuList(prev => [newTamu, ...prev]);
    setModalOpen(false);

    // Reset Form
    setNamaTamu('');
    setTujuanUnit('');
    setKeperluan('Tamu pribadi');
    setNoKendaraan('');

    // Success notification
    setSuccessToast(`Tamu ${newTamu.nama} berhasil didaftarkan! QR Code tercetak.`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Check out a guest
  const handleCheckOut = (id) => {
    const today = new Date();
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setTamuList(prev =>
      prev.map(tamu =>
        tamu.id === id ? { ...tamu, keluar: timeStr, status: 'Keluar' } : tamu
      )
    );

    setSuccessToast('Tamu berhasil di-check out.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Controls Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Daftarkan Tamu</span>
        </button>

        <button
          onClick={handleScanClick}
          className="btn-ghost py-2.5 px-4 text-xs font-bold"
        >
          <QrCode size={14} className="stroke-[2.5]" />
          <span>Scan QR</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5">
          Log Tamu — QR Code
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-16 text-center">QR</th>
                <th>Nama Tamu</th>
                <th>Tujuan Unit</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tamuList.map((tamu) => (
                <tr key={tamu.id}>
                  <td className="flex justify-center">
                    <div className="w-9 h-9 border border-soft rounded-xl flex items-center justify-center bg-[#FAF6F0] text-muted shadow-sm">
                      <QrCode size={15} className="stroke-[1.5]" />
                    </div>
                  </td>
                  <td className="font-bold text-ink">{tamu.nama}</td>
                  <td>{tamu.unit}</td>
                  <td className="font-bold text-ink">{tamu.masuk}</td>
                  <td className="text-muted">{tamu.keluar}</td>
                  <td className="text-muted">{tamu.keperluan}</td>
                  <td>
                    <span className={`badge-base ${
                      tamu.status === 'Di Dalam'
                        ? 'badge-mint'
                        : 'badge-gray'
                    }`}>
                      {tamu.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {tamu.status === 'Di Dalam' ? (
                      <button
                        onClick={() => handleCheckOut(tamu.id)}
                        className="inline-flex items-center gap-1 text-[#E06E5D] hover:underline font-bold text-xs"
                      >
                        <LogOut size={12} />
                        <span>Keluar</span>
                      </button>
                    ) : (
                      <span className="text-muted font-semibold text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Daftarkan Tamu Baru</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateTamu} className="modal-body space-y-4">
              <div>
                <label className="label-modern">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap tamu"
                  value={namaTamu}
                  onChange={(e) => setNamaTamu(e.target.value)}
                  className="input-modern font-semibold"
                />
              </div>

              <div>
                <label className="label-modern">
                  Tujuan Unit
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 12A — Hendra G."
                  value={tujuanUnit}
                  onChange={(e) => setTujuanUnit(e.target.value)}
                  className="input-modern font-semibold"
                />
              </div>

              <div>
                <label className="label-modern">
                  Keperluan
                </label>
                <select
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Tamu pribadi">Tamu pribadi</option>
                  <option value="Pengiriman">Pengiriman</option>
                  <option value="Kunjungan keluarga">Kunjungan keluarga</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="label-modern">
                  No. Kendaraan (opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: L 1234 AB"
                  value={noKendaraan}
                  onChange={(e) => setNoKendaraan(e.target.value)}
                  className="input-modern font-semibold"
                />
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 btn-primary py-3 rounded-xl text-xs font-bold"
                >
                  <Printer size={14} />
                  <span>Daftarkan & Cetak QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full btn-ghost py-2.5 rounded-xl text-xs font-bold justify-center"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Dismissing Info Toast */}
      {showToast && (
        <div className="toast-modern">
          <div className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center flex-shrink-0">
            <Info size={14} />
          </div>
          <div>
            <p className="text-xs font-bold">Fitur scan QR menggunakan kamera perangkat.</p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
