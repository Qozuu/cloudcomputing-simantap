import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function ChatKeuangan() {
  const [conversations, setConversations] = useState([
    {
      id: 'HG',
      name: 'Hendra G.',
      unit: 'Unit 12A',
      lastMessage: 'Tagihan April belum terupdate',
      time: '09:45',
      unread: true,
      messages: [
        { sender: 'resident', text: 'Selamat pagi admin, saya mau tanya kenapa tagihan IPL April saya belum terupdate ya?', time: '09:40' },
        { sender: 'admin', text: 'Pagi Pak Hendra. Kami cek dulu ya.', time: '09:42' },
        { sender: 'resident', text: 'Tagihan April belum terupdate', time: '09:45' }
      ]
    },
    {
      id: 'MS',
      name: 'Maya S.',
      unit: 'Unit 05B',
      lastMessage: 'Sudah transfer tapi belum lunas',
      time: '09:20',
      unread: true,
      messages: [
        { sender: 'admin', text: 'Halo! Selamat datang di CS Keuangan SiManTap. Kami siap membantu pertanyaan seputar tagihan dan pembayaran apartemen Anda.', time: '09:00' },
        { sender: 'resident', text: 'Pak, saya sudah transfer tagihan IPL April 3 hari yang lalu tapi statusnya masih belum bayar.', time: '09:22' },
        { sender: 'admin', text: 'Halo Bu Maya, kami cek dulu datanya ya. Boleh kirim bukti transfernya via WhatsApp di tombol atas agar kami bisa verifikasi lebih cepat?', time: '09:24' },
        { sender: 'resident', text: 'Sudah transfer tapi belum lunas', time: '09:25' }
      ]
    },
    {
      id: 'RH',
      name: 'Rudi H.',
      unit: 'Unit 18C',
      lastMessage: 'Ada biaya tambahan di tagihan',
      time: '08:55',
      unread: false,
      messages: [
        { sender: 'resident', text: 'Pagi, kenapa bulan ini ada biaya tambahan di rincian tagihan IPL saya ya?', time: '08:50' },
        { sender: 'resident', text: 'Ada biaya tambahan di tagihan', time: '08:55' }
      ]
    },
    {
      id: 'DL',
      name: 'Dewi L.',
      unit: 'Unit 07A',
      lastMessage: 'Terima kasih sudah dikonfirmasi',
      time: '08:00',
      unread: false,
      messages: [
        { sender: 'resident', text: 'Halo, saya sudah upload bukti pembayaran kemarin.', time: '07:50' },
        { sender: 'admin', text: 'Baik Bu Dewi, pembayarannya sudah kami verifikasi dan statusnya sekarang Lunas.', time: '07:55' },
        { sender: 'resident', text: 'Terima kasih sudah dikonfirmasi', time: '08:00' }
      ]
    }
  ]);

  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  // Validation Modal Form Fields
  const [billingType, setBillingType] = useState('IPL Bulanan');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [paymentDate, setPaymentDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState('Lunas — Pembayaran Terverifikasi');
  const [internalNotes, setInternalNotes] = useState('');

  const activeChat = conversations.find(c => c.id === activeId);

  // Mark chat as read when clicked
  const handleSelectChat = (id) => {
    setActiveId(id);
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, unread: false } : c)
    );
  };

  // Send message function
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            lastMessage: replyText,
            time: timeStr,
            messages: [
              ...c.messages,
              { sender: 'admin', text: replyText, time: timeStr }
            ]
          };
        }
        return c;
      })
    );

    setReplyText('');
  };

  // Create Validation Submit
  const handleCreateValidationSubmit = (e) => {
    e.preventDefault();
    if (!activeChat) return;

    setModalOpen(false);
    setSuccessToast(`Konfirmasi pembayaran untuk ${activeChat.name} berhasil disimpan!`);
    
    // Clear toast after 3 seconds
    setTimeout(() => {
      setSuccessToast('');
    }, 3000);

    // Reset fields
    setBillingPeriod('');
    setAmount('');
    setTransactionId('');
    setPaymentDate('');
    setInternalNotes('');
  };

  // Count unread conversations
  const unreadCount = conversations.filter(c => c.unread).length;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row border border-soft rounded-3xl bg-surface shadow-soft overflow-hidden animate-fade-up relative">
      
      {/* LEFT PANEL - Chat List */}
      <div className="w-full md:w-80 border-r border-soft flex flex-col flex-shrink-0 bg-surface">
        <div className="p-4 border-b border-soft flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Daftar Chat Masuk</h3>
          {unreadCount > 0 && (
            <span className="badge-base badge-pink">
              {unreadCount} baru
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.map((chat) => {
            const isActiveItem = chat.id === activeId;
            return (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className="w-full text-left p-4 transition duration-150 flex items-start gap-3 hover:bg-app-bg border-l-[3.5px]"
                style={{ borderColor: isActiveItem ? 'var(--ink)' : 'transparent', backgroundColor: isActiveItem ? 'var(--app-bg)' : 'var(--surface)' }}
              >
                {/* Avatar Initials */}
                <div className="avatar avatar-md avatar-lavender shadow-sm">
                  {chat.id}
                </div>
                
                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink truncate">
                      {chat.name} <span className="text-[10px] text-muted font-medium ml-1">({chat.unit})</span>
                    </p>
                    <span className="text-[9px] font-medium text-muted">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.unread ? 'font-bold text-ink' : 'text-muted'}`}>
                    {chat.lastMessage}
                  </p>
                </div>

                {/* Unread Dot */}
                {chat.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#B85040] mt-1.5 flex-shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL - Chat Area */}
      <div className="flex-1 flex flex-col bg-app-bg">
        {activeChat ? (
          <>
            {/* Top Info Bar */}
            <div className="p-4 border-b border-soft bg-surface flex items-center justify-between shadow-none z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="avatar avatar-md avatar-lavender shadow-sm">
                    {activeChat.id}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink leading-none">
                    {activeChat.name} ({activeChat.unit})
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                    <span>Online · Balas dalam 5-10 menit</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>Catat Konfirmasi Bayar</span>
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeChat.messages.map((msg, index) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-none ${
                      isAdmin 
                        ? 'bg-ink text-white rounded-tr-none' 
                        : 'bg-surface text-ink border border-soft rounded-tl-none'
                    }`}>
                      <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                      <span className={`text-[9px] block text-right mt-1.5 ${
                        isAdmin ? 'text-gray-300' : 'text-muted'
                      }`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Reply Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-soft bg-surface">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tulis balasan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="input-modern flex-1"
                />
                <button
                  type="submit"
                  className="btn-primary btn-sm flex items-center gap-1"
                >
                  <span>Kirim</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-muted font-semibold text-center mt-2.5">
                Chat di aplikasi untuk komunikasi teks · Gunakan WhatsApp untuk kirim foto bukti pembayaran
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-soft/20 flex items-center justify-center text-muted mb-3.5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-ink">CS Live Chat — Keuangan</h4>
            <p className="text-xs text-muted mt-1.5 max-w-xs leading-relaxed">
              Pilih percakapan dari daftar kiri untuk melihat riwayat pesan dan merespons keluhan penghuni.
            </p>
          </div>
        )}
      </div>

      {/* CATAT KONFIRMASI PEMBAYARAN MODAL */}
      {modalOpen && activeChat && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Catat Konfirmasi Pembayaran</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Banner - PERBAIKAN: Ditambahkan ukuran inline style pada SVG agar tidak jadi raksasa */}
            <div className="px-5 py-3 bg-[#EEEDFB] border-b border-soft text-xs font-bold text-ink flex items-center gap-2">
              <svg 
                style={{ width: '18px', height: '18px' }} 
                className="text-[#4840B0] flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Konfirmasi dibuat berdasarkan chat dari penghuni {activeChat.name} · Unit {activeChat.unit.replace('Unit ', '')}</span>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateValidationSubmit} className="modal-body space-y-4 p-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Resident Name */}
                <div>
                  <label className="label-modern">Nama Penghuni</label>
                  <input
                    type="text"
                    value={activeChat.name}
                    readOnly
                    className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold"
                  />
                </div>
                {/* Unit */}
                <div>
                  <label className="label-modern">No. Unit</label>
                  <input
                    type="text"
                    value={activeChat.unit.replace('Unit ', '')}
                    readOnly
                    className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jenis Tagihan */}
                <div>
                  <label className="label-modern">Jenis Tagihan</label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="IPL Bulanan">IPL Bulanan</option>
                    <option value="Listrik">Listrik</option>
                    <option value="Air">Air</option>
                    <option value="Tagihan Fasilitas">Tagihan Fasilitas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                {/* Periode Tagihan */}
                <div>
                  <label className="label-modern">Periode Tagihan</label>
                  <input
                    type="month"
                    required
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jumlah Tagihan */}
                <div>
                  <label className="label-modern">Jumlah Tagihan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 920000"
                    className="input-modern font-semibold"
                  />
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="label-modern">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="Tunai">Tunai</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tanggal Bayar */}
                <div>
                  <label className="label-modern">Tanggal Bayar</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="input-modern font-semibold"
                  />
                </div>

                {/* Status Konfirmasi */}
                <div>
                  <label className="label-modern">Status Konfirmasi</label>
                  <select
                    value={confirmationStatus}
                    onChange={(e) => setConfirmationStatus(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Lunas — Pembayaran Terverifikasi">Lunas — Pembayaran Terverifikasi</option>
                    <option value="Perlu Verifikasi Lebih Lanjut">Perlu Verifikasi Lebih Lanjut</option>
                    <option value="Ditolak — Bukti Tidak Valid">Ditolak — Bukti Tidak Valid</option>
                    <option value="Ditolak — Jumlah Tidak Sesuai">Ditolak — Jumlah Tidak Sesuai</option>
                  </select>
                </div>
              </div>

              {/* ID Transaksi / Referensi */}
              <div>
                <label className="label-modern">ID Transaksi / Referensi</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Contoh: TXN-202604-0012"
                  className="input-modern font-semibold"
                />
              </div>

              {/* Catatan Internal */}
              <div>
                <label className="label-modern">Catatan Internal</label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Catatan untuk tim keuangan..."
                  className="textarea-modern font-semibold"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <CheckCircle size={14} className="mr-1" />
                  <span>Simpan Konfirmasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}