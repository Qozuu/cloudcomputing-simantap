import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  Send,
  History
} from 'lucide-react';

export default function BroadcastPesan() {
  const [successToast, setSuccessToast] = useState('');
  
  // Form states
  const [target, setTarget] = useState('Semua Penghuni');
  const [prioritas, setPrioritas] = useState('Darurat');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');

  // Riwayat list state
  const [broadcasts, setBroadcasts] = useState([
    {
      id: 1,
      waktu: '21 Apr 09:00',
      judul: 'Pemadaman Listrik Tower B',
      target: 'Tower B',
      prioritas: 'Darurat',
      terkirim: '412 penerima'
    },
    {
      id: 2,
      waktu: '18 Apr 14:30',
      judul: 'Kolam Renang Ditutup Sementara',
      target: 'Semua',
      prioritas: 'Info',
      terkirim: '412 penerima'
    }
  ]);

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

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) return;

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const timeStr = `${today.getDate()} ${months[today.getMonth()]} ${today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const targetLabel = target === 'Semua Penghuni' ? 'Semua' : target;
    const recipientCount = getRecipientCount(target);

    const newBroadcast = {
      id: Date.now(),
      waktu: timeStr,
      judul: judul,
      target: targetLabel,
      prioritas: prioritas,
      terkirim: `${recipientCount} penerima`
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);

    // Success toast
    setSuccessToast(`Broadcast berhasil dikirim ke ${recipientCount} penerima`);
    setTimeout(() => setSuccessToast(''), 3000);

    // Reset Form fields
    setJudul('');
    setIsi('');
  };

  const getPrioritasBadge = (pri) => {
    switch (pri) {
      case 'Darurat':
        return 'badge-pink';
      case 'Info':
        return 'badge-lavender';
      case 'Peringatan':
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
          <span>Kirim Broadcast Pesan Darurat</span>
        </h3>

        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Target */}
            <div className="flex-1">
              <label className="label-modern">
                Target Penerima
              </label>
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
              <label className="label-modern">
                Prioritas
              </label>
              <select
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value)}
                className="select-modern input-modern font-semibold"
              >
                <option value="Darurat">🔴 Darurat</option>
                <option value="Info">🔵 Info</option>
                <option value="Peringatan">🟡 Peringatan</option>
              </select>
            </div>
          </div>

          {/* Judul */}
          <div>
            <label className="label-modern">
              Judul Pesan
            </label>
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
            <label className="label-modern">
              Isi Pesan
            </label>
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
                <th>Waktu</th>
                <th>Judul</th>
                <th>Target</th>
                <th>Prioritas</th>
                <th>Terkirim</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((bc) => (
                <tr key={bc.id}>
                  <td className="font-bold text-ink">{bc.waktu}</td>
                  <td className="text-ink font-bold">{bc.judul}</td>
                  <td className="text-muted">{bc.target}</td>
                  <td>
                    <span className={`badge-base ${getPrioritasBadge(bc.prioritas)}`}>
                      {bc.prioritas}
                    </span>
                  </td>
                  <td className="text-muted">{bc.terkirim}</td>
                </tr>
              ))}
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
