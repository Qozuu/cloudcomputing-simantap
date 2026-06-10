import React, { useState, useRef } from 'react';
import {
  Wrench,
  Calendar,
  User,
  Clock,
  Camera,
  CheckCircle2,
  FileImage,
  Plus,
  Eye,
  X
} from 'lucide-react';

export default function LaporanKerusakan() {
  const fileInputRef = useRef(null);
  const [successToast, setSuccessToast] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  
  // State untuk melacak tiket mana yang sedang dibuka di modal detail
  const [activeModalTicket, setActiveModalTicket] = useState(null);

  const [tickets, setTickets] = useState([
    {
      id: 'TK-0088',
      title: 'AC bocor — air menetes ke lantai sangat deras sampai membanjiri karpet kamar utama dan berpotensi merusak kasur jika dibiarkan',
      category: 'AC / Pendingin',
      date: '19 April 2026',
      teknisi: 'Pak Roni',
      estimasi: '1-2 hari',
      status: 'Proses'
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

    const lastTicketId = tickets.length > 0 
      ? parseInt(tickets[0].id.split('-')[1]) 
      : 87;
    const nextIdNumber = lastTicketId + 1;
    const ticketId = `TK-${String(nextIdNumber).padStart(4, '0')}`;

    const newTicket = {
      id: ticketId,
      title: formData.description,
      category: formData.category,
      date: '03 Juni 2026',
      teknisi: 'Sedang Diplot',
      estimasi: 'Verifikasi Admin',
      status: 'Proses'
    };

    setTickets(prev => [newTicket, ...prev]);
    setSuccessToast(`Laporan ${ticketId} berhasil terkirim!`);
    setTimeout(() => setSuccessToast(''), 3000);

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
                className={`${cardClass} relative overflow-hidden flex flex-col justify-between gap-3`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest">{ticket.id}</span>
                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[rgba(252,214,165,0.6)] text-[#A05820]">
                    {ticket.status}
                  </span>
                </div>

                {/* Title Wrapper dengan batasan Baris Tunggal & Tombol Aksi */}
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-sm font-black text-[#1E1E1E] leading-snug truncate flex-1">
                    {ticket.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveModalTicket(ticket)}
                    className="flex items-center gap-1 text-xs font-black text-[#A05820] hover:underline flex-shrink-0 bg-white/40 px-2 py-1 rounded-md"
                  >
                    <Eye size={12} />
                    <span>Detail</span>
                  </button>
                </div>

                {/* Meta Rows */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#1E1E1E] border-t border-black/5 pt-3 mb-1">
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
          <div>
            <label className="label-modern">Kategori Kerusakan</label>
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

          <div>
            <label className="label-modern">Deskripsi Kerusakan</label>
            <textarea
              rows={4}
              required
              placeholder="Jelaskan kerusakan secara detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="textarea-modern"
            ></textarea>
          </div>

          <div>
            <label className="label-modern">Foto Kerusakan</label>
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

          <button type="submit" className="w-full btn-primary justify-center text-xs">
            <Plus size={14} />
            <span>Kirim Laporan</span>
          </button>
        </form>
      </div>

      {/* 🖥️ MODAL POPUP DETAIL LAPORAN */}
      {activeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-soft animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-soft flex items-center justify-between bg-app-bg">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{activeModalTicket.id}</span>
                <h3 className="text-sm font-extrabold text-ink">Detail Keluhan Penghuni</h3>
              </div>
              <button 
                onClick={() => setActiveModalTicket(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-soft text-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-soft text-ink mb-2">
                  {activeModalTicket.category}
                </span>
                {/* Di sini teks deskripsi panjang dirender secara utuh tanpa terpotong */}
                <p className="text-sm font-bold text-ink leading-relaxed whitespace-pre-wrap">
                  {activeModalTicket.title}
                </p>
              </div>

              {/* Info Detail Grid */}
              <div className="bg-app-bg rounded-xl p-4 grid grid-cols-2 gap-3 border border-soft">
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase">Tanggal Lapor</p>
                  <p className="text-xs font-extrabold text-ink mt-0.5">{activeModalTicket.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase">Status Tiket</p>
                  <p className="text-xs font-extrabold text-active mt-0.5">{activeModalTicket.status}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase">Teknisi</p>
                  <p className="text-xs font-extrabold text-ink mt-0.5">{activeModalTicket.teknisi}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase">Estimasi Kerja</p>
                  <p className="text-xs font-extrabold text-ink mt-0.5">{activeModalTicket.estimasi}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-soft bg-app-bg flex justify-end">
              <button
                onClick={() => setActiveModalTicket(null)}
                className="px-4 py-2 bg-ink text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

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