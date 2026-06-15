import React, { useState } from 'react';

export default function CSLiveChat() {
  const [conversations, setConversations] = useState([
    {
      id: 'HG',
      name: 'Hendra G.',
      unit: 'Unit 12A',
      lastMessage: 'AC saya masih bocor pak...',
      time: '09:45',
      unread: true,
      messages: [
        { sender: 'resident', text: 'Selamat pagi pak Doni, teknisi AC kemarin sudah datang?', time: '09:40' },
        { sender: 'admin', text: 'Pagi Pak Hendra. Iya sudah dijadwalkan, kemarin ada kendala apa?', time: '09:42' },
        { sender: 'resident', text: 'AC saya masih bocor pak, airnya menetes deras di ruang tamu.', time: '09:45' }
      ]
    },
    {
      id: 'MS',
      name: 'Maya S.',
      unit: 'Unit 05B',
      lastMessage: 'Kapan teknisi datang...',
      time: '09:20',
      unread: true,
      messages: [
        { sender: 'resident', text: 'Pak, saklar lampu di kamar mandi saya padam semuanya.', time: '09:18' },
        { sender: 'resident', text: 'Kapan teknisi datang untuk memperbaikinya ya?', time: '09:20' }
      ]
    },
    {
      id: 'RH',
      name: 'Rudi H.',
      unit: 'Unit 18C',
      lastMessage: 'Terima kasih sudah diperbaiki',
      time: '08:55',
      unread: false,
      messages: [
        { sender: 'resident', text: 'Pak Doni, kebocoran pipa di kamar mandi saya sudah diatasi oleh Pak Heri.', time: '08:50' },
        { sender: 'resident', text: 'Terima kasih sudah diperbaiki', time: '08:55' }
      ]
    },
    {
      id: 'DL',
      name: 'Dewi L.',
      unit: 'Unit 07A',
      lastMessage: 'Ada yang bocor di kamar mandi',
      time: '08:20',
      unread: true,
      messages: [
        { sender: 'resident', text: 'Halo admin pemeliharaan, ada kebocoran air merembes di langit-langit kamar mandi unit saya.', time: '08:20' }
      ]
    },
    {
      id: 'FN',
      name: 'Fajar N.',
      unit: 'Unit 22B',
      lastMessage: 'Baik pak, ditunggu ya',
      time: 'Kemarin',
      unread: false,
      messages: [
        { sender: 'admin', text: 'Pak Fajar, perbaikan engsel pintu lift sudah selesai dijadwalkan besok.', time: 'Kemarin' },
        { sender: 'resident', text: 'Baik pak, ditunggu ya', time: 'Kemarin' }
      ]
    }
  ]);

  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  // Ticket Modal Form Fields
  const [ticketCategory, setTicketCategory] = useState('AC');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketTechnician, setTicketTechnician] = useState('Pak Heri');

  const activeChat = conversations.find(c => c.id === activeId);

  // Mark chat as read when clicked
  const handleSelectChat = (id) => {
    setActiveId(id);
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, unread: false } : c)
    );
    // Auto populate ticket form title
    const selected = conversations.find(c => c.id === id);
    if (selected) {
      setTicketTitle(`${selected.lastMessage} di ${selected.unit}`);
      setTicketDesc(`Dibuat berdasarkan laporan chat dari penghuni ${selected.name} (${selected.unit}): "${selected.lastMessage}"`);
    }
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

  // Create Ticket Submit
  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!activeChat) return;

    setModalOpen(false);
    setSuccessToast(`Tiket untuk ${activeChat.name} berhasil dibuat!`);
    
    // Clear toast after 3 seconds
    setTimeout(() => {
      setSuccessToast('');
    }, 3000);

    // Reset ticket fields
    setTicketTitle('');
    setTicketDesc('');
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
                className={`w-full text-left p-4 transition duration-150 flex items-start gap-3 hover:bg-app-bg border-l-[3.5px] ${
                  isActiveItem 
                    ? 'bg-app-bg border-ink' 
                    : 'border-transparent bg-surface'
                }`}
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
                    <span>Online</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Create ticket button */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Buat Tiket</span>
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
                Customer Service aktif · Membalas keluhan penghuni secara real-time
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
            <h4 className="text-sm font-bold text-ink">CS Pemeliharaan</h4>
            <p className="text-xs text-muted mt-1.5 max-w-xs leading-relaxed">
              Pilih percakapan dari daftar kiri untuk melihat riwayat pesan dan merespons keluhan penghuni.
            </p>
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {modalOpen && activeChat && (
        <div className="modal-overlay">
          <div className="modal-box">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Buat Tiket Kerusakan</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Banner - FIXED ICON SIZE */}
            <div className="px-5 py-3 bg-[#EEEDFB] border-b border-soft text-xs font-bold text-ink flex items-center gap-2">
              {/* Diubah dari w-4.5 h-4.5 menjadi w-5 h-5 agar ukurannya stabil dan tidak merusak layout */}
              <svg className="w-5 h-5 text-[#4840B0] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Laporan chat dari penghuni {activeChat.name} ({activeChat.unit})</span>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTicketSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Resident Name */}
                <div>
                  <label className="label-modern">Penghuni</label>
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
                    value={activeChat.unit}
                    readOnly
                    className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="label-modern">Kategori Kerusakan</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="AC">AC & Pendingin</option>
                    <option value="Plumbing">Kran & Plumbing</option>
                    <option value="Listrik">Listrik & Saklar</option>
                    <option value="Lift">Lift & Mekanikal</option>
                    <option value="Lainnya">Lain-lain</option>
                  </select>
                </div>
                
                {/* Priority */}
                <div>
                  <label className="label-modern">Prioritas</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="label-modern">Judul Tiket</label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Misal: AC Bocor Menetes"
                  className="input-modern font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="label-modern">Deskripsi Masalah</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Deskripsikan kerusakan dan kebutuhan perbaikan..."
                  className="textarea-modern font-semibold"
                ></textarea>
              </div>

              {/* Assign Technician */}
              <div>
                <label className="label-modern">Assign Teknisi</label>
                <select
                  value={ticketTechnician}
                  onChange={(e) => setTicketTechnician(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Pak Heri">Pak Heri (Plumbing/AC)</option>
                  <option value="Pak Roni">Pak Roni (Listrik)</option>
                  <option value="Pak Agus">Pak Agus (Mekanikal)</option>
                  <option value="Pak Ridwan">Pak Ridwan (Umum)</option>
                  <option value="Pak Riko">Pak Riko (Umum)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <span>✓ Buat Tiket Sekarang</span>
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