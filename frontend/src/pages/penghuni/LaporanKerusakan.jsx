import React, { useState, useRef } from 'react';
import {
  Wrench,
  Calendar,
  User,
  Clock,
  Camera,
  CheckCircle2,
  FileImage,
  Plus
} from 'lucide-react';

export default function LaporanKerusakan() {
  const fileInputRef = useRef(null);
  const [successToast, setSuccessToast] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  
  const [tickets, setTickets] = useState([
    {
      id: 'TK-0088',
      title: 'AC bocor — air menetes ke lantai',
      category: 'AC / Pendingin',
      date: '19 April 2026',
      teknisi: 'Pak Roni',
      estimasi: '1-2 hari',
      status: 'Proses',
      updateMsg: 'Teknisi sudah mendiagnosa, spare part sedang dipesan.'
    }
  ]);

  const [formData, setFormData] = useState({
    category: 'AC / Pendingin',
    description: ''
  });

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    const ticketId = 'TK-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: ticketId,
      title: formData.description.substring(0, 45) + (formData.description.length > 45 ? '...' : ''),
      category: formData.category,
      date: '23 Mei 2026',
      teknisi: 'Sedang Diplot',
      estimasi: 'Verifikasi Admin',
      status: 'Proses', // Default matching active state
      updateMsg: 'Laporan kerusakan baru diterima. Admin sedang menugaskan teknisi.'
    };

    setTickets(prev => [newTicket, ...prev]);
    setSuccessToast(`Laporan ${ticketId} berhasil terkirim!`);
    setTimeout(() => setSuccessToast(''), 3000);

    // Reset Form
    setFormData({
      category: 'AC / Pendingin',
      description: ''
    });
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      
      {/* Section Laporan Kerusakan Aktif */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <Wrench size={16} />
          <span>Laporan Kerusakan Aktif</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket, idx) => {
            const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
            const cardClass = cardColors[idx % 4];
            
            return (
              <div
                key={ticket.id}
                className={`${cardClass} relative overflow-hidden flex flex-col justify-between gap-4`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">{ticket.id}</span>
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">
                    {ticket.status}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-black text-[#1E1E1E] leading-snug">
                  {ticket.title}
                </h4>

                {/* Meta Rows */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#1E1E1E] border-t border-b border-black/5 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#8A857F]" />
                    <span>Dilaporkan: {ticket.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-[#8A857F]" />
                    <span>Teknisi: {ticket.teknisi}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#8A857F]" />
                    <span>Estimasi: {ticket.estimasi}</span>
                  </span>
                </div>

                {/* Update Row */}
                <p className="text-xs text-[#8A857F] font-medium italic">
                  Update terbaru: {ticket.updateMsg}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Laporkan Kerusakan Baru */}
      <div className="card-section p-6 space-y-5">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider pb-4 border-b border-soft">
          Laporkan Kerusakan Baru
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Kategori Kerusakan */}
          <div>
            <label className="label-modern">
              Kategori Kerusakan
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="input-modern select-modern"
            >
              <option value="AC / Pendingin">AC / Pendingin</option>
              <option value="Listrik">Listrik</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Lift">Lift</option>
              <option value="Umum">Umum</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Deskripsi Kerusakan */}
          <div>
            <label className="label-modern">
              Deskripsi Kerusakan
            </label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan kerusakan secara detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="textarea-modern"
            ></textarea>
          </div>

          {/* Foto Kerusakan */}
          <div>
            <label className="label-modern">
              Foto Kerusakan
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="upload-zone flex flex-col items-center justify-center gap-2 py-8"
            >
              {selectedFileName ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#E8FAF3] text-[#187050] border border-soft flex items-center justify-center">
                    <FileImage size={20} />
                  </div>
                  <span className="text-xs font-bold text-ink">{selectedFileName}</span>
                  <span className="text-[10px] text-muted font-bold uppercase">Klik untuk ganti file</span>
                </>
              ) : (
                <>
                  <Camera size={24} className="text-muted" />
                  <span className="text-xs font-bold text-muted">Tap untuk upload foto kerusakan</span>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full btn-primary justify-center text-xs"
          >
            <Plus size={14} />
            <span>Kirim Laporan</span>
          </button>
        </form>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="avatar avatar-sm avatar-mint flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="stroke-[3]" />
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
