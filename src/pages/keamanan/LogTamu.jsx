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
import { supabase } from '../../lib/supabase';

export default function LogTamu() {
  const [showToast, setShowToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [namaTamu, setNamaTamu] = useState('');
  const [tujuanUnit, setTujuanUnit] = useState('');
  const [keperluan, setKeperluan] = useState('Tamu pribadi');
  const [noKendaraan, setNoKendaraan] = useState('');

  // Table data & units lookup
  const [tamuList, setTamuList] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch visitors and subscribe to real-time updates
  useEffect(() => {
    async function init() {
      try {
        const { data: visitors } = await supabase
          .from('visitor')
          .select('*, unit_tujuan:unit(nomor_unit)')
          .order('waktu_masuk', { ascending: false });

        if (visitors) {
          const tamuFormatted = visitors.map(v => {
            const masukDate = new Date(v.waktu_masuk);
            const masukStr = masukDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const keluarStr = v.waktu_keluar 
              ? new Date(v.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              : '-';
            return {
              id: v.id,
              nama: v.nama_tamu,
              unit: v.unit_tujuan?.nomor_unit || '—',
              masuk: masukStr,
              keluar: keluarStr,
              keperluan: v.keperluan || '—',
              status: v.waktu_keluar ? 'Keluar' : 'Di Dalam'
            };
          });
          setTamuList(tamuFormatted);
        }

        const { data: unitData } = await supabase
          .from('unit')
          .select('id, nomor_unit');
        if (unitData) {
          setUnits(unitData);
        }
      } catch (err) {
        console.error('Error fetching visitors:', err);
      }
    }

    init();

    // Subscribe to visitor postgres changes
    const channel = supabase.channel('visitor-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor' }, async (payload) => {
        const { data: newVisitor } = await supabase
          .from('visitor')
          .select('*, unit_tujuan:unit(nomor_unit)')
          .eq('id', payload.new.id)
          .single();

        if (newVisitor) {
          const masukDate = new Date(newVisitor.waktu_masuk);
          const masukStr = masukDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const formatted = {
            id: newVisitor.id,
            nama: newVisitor.nama_tamu,
            unit: newVisitor.unit_tujuan?.nomor_unit || '—',
            masuk: masukStr,
            keluar: '-',
            keperluan: newVisitor.keperluan || '—',
            status: 'Di Dalam'
          };
          setTamuList(prev => [formatted, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'visitor' }, payload => {
        setTamuList(prev =>
          prev.map(tamu => {
            if (tamu.id === payload.new.id) {
              const keluarStr = payload.new.waktu_keluar 
                ? new Date(payload.new.waktu_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : '-';
              return {
                ...tamu,
                keluar: keluarStr,
                status: payload.new.waktu_keluar ? 'Keluar' : 'Di Dalam'
              };
            }
            return tamu;
          })
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleScanClick = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleCreateTamu = async (e) => {
    e.preventDefault();
    if (!namaTamu.trim() || !tujuanUnit.trim()) return;

    const cleanUnitInput = tujuanUnit.trim().toLowerCase();
    const matchedUnit = units.find(u => 
      cleanUnitInput.includes(u.nomor_unit.toLowerCase()) || 
      u.nomor_unit.toLowerCase().includes(cleanUnitInput)
    );
    const unit_tujuan_id = matchedUnit ? matchedUnit.id : null;

    try {
      const { data: inserted, error } = await supabase
        .from('visitor')
        .insert({
          nama_tamu: namaTamu,
          unit_tujuan_id,
          keperluan: keperluan,
          no_ktp: null
        })
        .select()
        .single();

      if (error) throw error;

      setModalOpen(false);
      setNamaTamu('');
      setTujuanUnit('');
      setKeperluan('Tamu pribadi');
      setNoKendaraan('');

      setSuccessToast(`Tamu ${inserted.nama_tamu} berhasil didaftarkan! QR Code tercetak.`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Failed to register visitor:', err.message);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const { error } = await supabase
        .from('visitor')
        .update({ waktu_keluar: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setSuccessToast('Tamu berhasil di-check out.');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Failed to checkout visitor:', err.message);
    }
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
