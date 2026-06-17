import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  CheckCircle2,
  Send,
  History
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BroadcastPesan() {
  const [successToast, setSuccessToast] = useState('');
  
  // Form states
  const [target, setTarget] = useState('Semua Penghuni');
  const [prioritas, setPrioritas] = useState('darurat');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');

  // User and broadcasts state
  const [broadcasts, setBroadcasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const loadBroadcasts = async () => {
    try {
      const { data: infos, error } = await supabase
        .from('broadcast_pesan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (infos) {
        const formatted = infos.map(bc => {
          const bcDate = new Date(bc.created_at);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const tanggalStr = `${bcDate.getDate()} ${months[bcDate.getMonth()]} ${bcDate.getFullYear()}`;
          const waktuStr = `${bcDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')} WIB`;
          return {
            id: bc.id,
            tanggal: tanggalStr,
            waktu: waktuStr,
            judul: bc.judul,
            target: bc.target || 'Semua',
            prioritas: bc.prioritas || 'darurat',
            terkirim: `${bc.jumlah_penerima ?? 0} penerima`
          };
        });
        setBroadcasts(formatted);
      }
    } catch (err) {
      console.error('Error loading broadcasts:', err);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const getRecipientCount = (tgt) => {
    switch (tgt) {
      case 'Semua Penghuni':
      case 'Semua':
        return 412;
      case 'Tower A':
        return 150;
      case 'Tower B':
        return 142;
      case 'Tower C':
        return 120;
      default:
        return 412;
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      alert("Judul dan isi pesan tidak boleh kosong!");
      return;
    }

    console.log("Memulai proses kirim broadcast ke Supabase...");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Sesi kamu telah berakhir atau kamu belum login. Silakan login ulang!");
        return;
      }

      const totalPenerima = getRecipientCount(target);

      // 1. INPUT KE TABEL BROADCAST_PESAN (Tetap aman pakai nilai asli)
      const { error: broadcastError } = await supabase
        .from('broadcast_pesan')
        .insert([
          {
            judul: judul.trim(),
            isi: isi.trim(),
            target: target,
            prioritas: prioritas, 
            jumlah_penerima: totalPenerima,
            created_by: user.id 
          }
        ]);

      if (broadcastError) throw broadcastError;

      console.log("Menyuntikkan data ke tabel notifications tanpa kolom priority...");

      // Tentukan kategori penanda untuk tampilan lonceng di frontend
      let kategoriNotif = 'info';
      if (prioritas === 'darurat') kategoriNotif = 'darurat';
      if (prioritas === 'peringatan') kategoriNotif = 'peraturan';

      // 2. INPUT KE TABEL NOTIFICATIONS PENGHUNI
      // Kolom 'priority' sengaja dihilangkan agar terhindar dari bad check constraint database!
      const { error: notifError } = await supabase
        .from('notifications') 
        .insert([
          {
            title: judul.trim(),
            message: isi.trim(),
            category: kategoriNotif, 
            target_tower: target,  // 'Semua Penghuni', 'Tower A', dsb.
            created_by: user.id,   
            is_active: true
          }
        ]);

      if (notifError) {
        console.error("Gagal mengirim ke lonceng:", notifError.message);
        alert("Peringatan Database: " + notifError.message);
        return; 
      }

      // Setelah insert broadcast_pesan berhasil...

      // 3. INSERT KE TABEL INFORMASI agar muncul di Pengumuman Terbaru penghuni
      const { error: informasiError } = await supabase
        .from('informasi')
        .insert([{
          dibuat_oleh: user.id,
          judul: judul.trim(),
          isi: isi.trim(),
          target_role: 'all',   // bisa disesuaikan dengan target
          is_published: true,   // langsung tayang
        }]);

      if (informasiError) {
        console.error('Gagal insert ke informasi:', informasiError.message);
        // tidak throw, biar broadcast tetap sukses
      }

      setSuccessToast(`Broadcast dan Notifikasi berhasil dikirim!`);
      setJudul('');
      setIsi('');

      await loadBroadcasts();
      setTimeout(() => setSuccessToast(''), 3000);

    } catch (err) {
      console.error('Terjadi kesalahan:', err);
      alert("Gagal: " + err.message);
    }
  };
  
  const getPrioritasBadge = (pri) => {
    switch (pri?.toLowerCase()) {
      case 'darurat':
        return 'badge-pink';
      case 'info':
        return 'badge-lavender';
      case 'peringatan':
        return 'badge-yellow';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Kirim Broadcast Card */}
      <div className="card-section p-6 space-y-5">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider pb-4 border-b border-soft flex items-center gap-1.5">
          <Megaphone className="text-[#E06E5D]" size={16} />
          <span>Kirim Broadcast Darurat</span>
        </h3>

        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Target */}
            <div className="flex-1">
              <label className="label-modern">Target Penerima</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="select-modern input-modern font-semibold"
              >
                <option value="Semua Penghuni">Semua Penghuni</option>
                <option value="Tower A">Tower A</option>
                <option value="Tower B">Tower B</option>
                <option value="Tower C">Tower C</option>
              </select>
            </div>

            {/* Prioritas */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Prioritas
              </label>
              <select
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-all"
              >
                <option value="darurat">🔴 darurat</option>
                <option value="info">🔵 info</option>
                <option value="peringatan">🟡 peringatan</option>
              </select>
            </div>
          </div>

          {/* Judul */}
          <div>
            <label className="label-modern">Judul Pesan</label>
            <input
              type="text"
              required
              placeholder="Judul pesan darurat..."
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input-modern font-semibold"
            />
          </div>

          {/* Isi Pesan */}
          <div>
            <label className="label-modern">Isi Pesan</label>
            <textarea
              rows={5}
              required
              placeholder="Tulis isi pesan darurat..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="textarea-modern"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 btn-primary py-3 rounded-xl text-xs font-bold"
          >
            <Send size={14} />
            <span>Kirim Broadcast Sekarang</span>
          </button>
        </form>
      </div>

      {/* Riwayat Broadcast Card */}
      <div className="card-section p-6 overflow-hidden">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-5 flex items-center gap-1.5">
          <History size={16} className="text-muted" />
          <span>Riwayat Broadcast</span>
        </h3>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Judul</th>
                <th>Target</th>
                <th>Prioritas</th>
                <th>Terkirim</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.length > 0 ? (
                broadcasts.map((bc) => (
                  <tr key={bc.id}>
                    <td className="font-bold text-ink">{bc.tanggal}</td>
                    <td className="text-muted font-medium">{bc.waktu}</td>
                    <td className="text-ink font-bold">{bc.judul}</td>
                    <td className="text-muted">{bc.target}</td>
                    <td>
                      <span className={`badge-base ${getPrioritasBadge(bc.prioritas)}`}>
                        {bc.prioritas}
                      </span>
                    </td>
                    <td className="text-muted">{bc.terkirim}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs font-semibold text-gray-400">
                    Belum ada riwayat broadcast pesan yang dikirim.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
