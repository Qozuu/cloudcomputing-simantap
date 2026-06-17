import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  UserPlus,
  CheckCircle2,
  LogOut,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LogTamu() {
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [namaTamu, setNamaTamu] = useState('');
  const [tujuanUnit, setTujuanUnit] = useState('');
  const [keperluan, setKeperluan] = useState('Tamu pribadi');
  const [noKendaraan, setNoKendaraan] = useState('');

  // Table data, search, & units lookup
  const [tamuList, setTamuList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState([]);

  // Fetch visitors and subscribe to real-time updates
  useEffect(() => {
    async function init() {
      try {
        // 1. Fetch visitors dengan relasi unit_tujuan
        const { data: visitors, error: fetchError } = await supabase
          .from('visitor')
          .select('*, unit_tujuan:unit(nomor_unit)')
          .order('waktu_masuk', { ascending: false });

        if (fetchError) throw fetchError;

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

        // 2. Fetch data unit untuk keperluan validasi input modal
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

    // Subscribe to visitor realtime updates
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

  const handleCreateTamu = async (e) => {
    e.preventDefault();
    if (!namaTamu.trim() || !tujuanUnit.trim()) return;

    const cleanUnitInput = tujuanUnit.split('—')[0].trim().toLowerCase();
    const matchedUnit = units.find(u => 
      u.nomor_unit.toLowerCase() === cleanUnitInput
    );
    const unit_tujuan_id = matchedUnit ? matchedUnit.id : null;

    if (!unit_tujuan_id) {
      alert(`Unit "${cleanUnitInput.toUpperCase()}" tidak terdaftar di database. Mohon periksa kembali.`);
      return;
    }

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

      setSuccessToast(`Tamu ${inserted.nama_tamu} berhasil didaftarkan!`);
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

  // Logika Filter Pencarian
  const filteredTamu = tamuList.filter(tamu => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tamu.nama.toLowerCase().includes(searchLower) ||
      tamu.unit.toLowerCase().includes(searchLower) ||
      tamu.keperluan.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Controls Row */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Daftarkan Tamu</span>
        </button>

        {/* Input Pencarian */}
        <div className="relative ml-auto w-full max-w-xs flex items-center">
          <span className="absolute left-3 flex items-center pointer-events-none text-muted z-10">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari nama, unit, atau keperluan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern py-2.5 pr-4 text-xs font-semibold w-full"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5">
          Log Tamu
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-12 text-center">No.</th>
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
              {filteredTamu.length > 0 ? (
                filteredTamu.map((tamu, index) => (
                  <tr key={tamu.id}>
                    <td className="text-center text-muted font-semibold text-xs">
                      {index + 1}
                    </td>
                    <td className="font-bold text-ink">{tamu.nama}</td>
                    <td className="font-semibold text-ink">{tamu.unit}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted font-semibold text-xs">
                    Tidak ada log tamu yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Daftarkan Tamu Baru</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTamu} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Tamu</label>
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
                <label className="label-modern">Tujuan Unit</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: C401"
                  value={tujuanUnit}
                  onChange={(e) => setTujuanUnit(e.target.value)}
                  className="input-modern font-semibold"
                />
              </div>

              <div>
                <label className="label-modern">Keperluan</label>
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
                <label className="label-modern">No. Kendaraan (opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: L 1234 AB"
                  value={noKendaraan}
                  onChange={(e) => setNoKendaraan(e.target.value)}
                  className="input-modern font-semibold"
                />
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 btn-primary py-3 rounded-xl text-xs font-bold"
                >
                  <UserPlus size={14} />
                  <span>Daftarkan</span>
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