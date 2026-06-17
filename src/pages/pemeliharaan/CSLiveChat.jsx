import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function CSLiveChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Ticket Modal Form Fields
  const [ticketCategory, setTicketCategory] = useState('AC');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketTechnician, setTicketTechnician] = useState('Pak Heri');

  // Ref untuk auto scroll-down ke chat paling baru
  const chatEndRef = useRef(null);
  const activeChat = conversations.find(c => c.id === activeId);

  // Auto-scroll ke bawah setiap ada pesan baru atau ganti chat room
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, activeId]);

  const loadConversations = async (adminId) => {
    try {
      // 1. Dapatkan daftar kamar percakapan milik admin ini
      const { data: participants, error: pError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', adminId);

      if (pError) throw pError;
      const convIds = participants?.map(p => p.conversation_id) || [];

      if (convIds.length === 0) {
        setConversations([]);
        return;
      }

      // 2. Dapatkan data lawan bicara (Penghuni) di kamar tersebut
      const { data: otherParticipants, error: opError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, users:users(nama, role)')
        .in('conversation_id', convIds)
        .neq('user_id', adminId);

      if (opError) throw opError;

      const residentIds = otherParticipants?.map(p => p.user_id) || [];

      // 3. Tarik data unit tempat tinggal penghuni
      const { data: penghunis, error: pgError } = await supabase
        .from('penghuni')
        .select('user_id, unit(nomor_unit)')
        .in('user_id', residentIds);

      // 4. Ambil seluruh riwayat pesan untuk diletakkan di list awal
      const { data: messages, error: mError } = await supabase
        .from('messages')
        .select('id, conversation_id, body, sender_id, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: true }); // Diubah ke ascending untuk struktur bubble chat

      if (mError) throw mError;

      const mapped = otherParticipants.map(participant => {
        const userId = participant.user_id;
        const name = participant.users?.nama || 'Anonim';
        const unitData = penghunis?.find(p => p.user_id === userId);
        const unitNum = unitData?.unit?.nomor_unit || '—';
        
        // Filter pesan khusus kamar ini saja
        const roomMessages = messages?.filter(m => m.conversation_id === participant.conversation_id) || [];
        const lastMsgObj = roomMessages[roomMessages.length - 1];
        
        const lastMessage = lastMsgObj?.body || 'Belum ada pesan';
        const time = lastMsgObj?.created_at
          ? new Date(lastMsgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—';

        // Format riwayat pesan ke bentuk yang dimengerti UI bubble chat
        const formattedMessages = roomMessages.map(m => {
          const isAdmin = m.sender_id === adminId;
          return {
            id: m.id,
            sender: isAdmin ? 'admin' : 'resident',
            text: m.body,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });

        return {
          id: participant.conversation_id,
          userId: userId,
          name: name,
          unit: unitNum !== '—' ? `Unit ${unitNum}` : '—',
          lastMessage: lastMessage,
          time: time,
          unread: false,
          messages: formattedMessages // 🔥 FIX: Riwayat pesan tidak lagi kosong melompong
        };
      });

      setConversations(mapped);
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          await loadConversations(user.id);
        }
      } catch (err) {
        console.error('Failed to init chat:', err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // REALTIME STREAMING LISTENER
  useEffect(() => {
    if (!activeId || !currentUser) return;

    const channel = supabase.channel(`messages-rt-${activeId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        async (payload) => {
          const isAdmin = payload.new.sender_id === currentUser.id;
          const formattedMsg = {
            id: payload.new.id,
            sender: isAdmin ? 'admin' : 'resident',
            text: payload.new.body,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeId) {
                // 🔥 FIX: Pengecekan duplikasi menggunakan id pesan database yang pasti unik
                const exists = c.messages.some(m => m.id === formattedMsg.id);
                if (exists) return c;
                return {
                  ...c,
                  lastMessage: formattedMsg.text,
                  time: formattedMsg.time,
                  messages: [...c.messages, formattedMsg]
                };
              }
              return c;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, currentUser]);

  const handleSelectChat = (id) => {
    setActiveId(id);
    
    // Auto populate form pembuatan tiket saat kamar di-klik
    const selected = conversations.find(c => c.id === id);
    if (selected) {
      setTicketTitle(`${selected.lastMessage} di ${selected.unit}`);
      setTicketDesc(`Laporan chat dari penghuni ${selected.name} (${selected.unit}): "${selected.lastMessage}"`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeId || !currentUser) return;

    const text = replyText;
    setReplyText('');

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeId,
        sender_id: currentUser.id,
        body: text
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send message:', err.message);
    }
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!activeChat) return;

    try {
      const { data: tech } = await supabase
        .from('users')
        .select('id')
        .eq('nama', ticketTechnician)
        .maybeSingle();

      const { error } = await supabase.from('laporan').insert({
        judul: ticketTitle,
        deskripsi: ticketDesc,
        kategori: ticketCategory,
        prioritas: ticketPriority,
        pelapor_id: activeChat.userId,
        status: 'proses',
        ditugaskan_ke: tech?.id || null
      });

      if (error) throw error;

      setModalOpen(false);
      setSuccessToast(`Tiket untuk ${activeChat.name} berhasil dibuat!`);
      setTimeout(() => setSuccessToast(''), 3000);
      setTicketTitle('');
      setTicketDesc('');
    } catch (err) {
      console.error('Failed to create ticket:', err.message);
    }
  };

  const unreadCount = conversations.filter(c => c.unread).length;

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

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
            const initials = chat.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
                <div className="avatar avatar-md avatar-lavender shadow-sm">
                  {initials}
                </div>
                
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
                    {activeChat.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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

              <div className="flex items-center gap-2">
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
                  <div key={msg.id || index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
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
              {/* Tempat berlabuh scroll anchor */}
              <div ref={chatEndRef} />
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
                <button type="submit" className="btn-primary btn-sm flex items-center gap-1">
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
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Buat Tiket Kerusakan</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-3 bg-[#EEEDFB] border-b border-soft text-xs font-bold text-ink flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4840B0] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Laporan chat dari penghuni {activeChat.name} ({activeChat.unit})</span>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Penghuni</label>
                  <input type="text" value={activeChat.name} readOnly className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold" />
                </div>
                <div>
                  <label className="label-modern">No. Unit</label>
                  <input type="text" value={activeChat.unit} readOnly className="input-modern bg-gray-50 border border-soft text-muted cursor-not-allowed font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Kategori Kerusakan</label>
                  <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)} className="select-modern input-modern font-semibold">
                    <option value="AC">AC & Pendingin</option>
                    <option value="Plumbing">Kran & Plumbing</option>
                    <option value="Listrik">Listrik & Saklar</option>
                    <option value="Lift">Lift & Mekanikal</option>
                    <option value="Lainnya">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Prioritas</label>
                  <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)} className="select-modern input-modern font-semibold">
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-modern">Judul Tiket</label>
                <input type="text" required value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} placeholder="Misal: AC Bocor Menetes" className="input-modern font-semibold" />
              </div>

              <div>
                <label className="label-modern">Deskripsi Masalah</label>
                <textarea rows={3} required value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder="Deskripsikan kerusakan..." className="textarea-modern font-semibold"></textarea>
              </div>

              <div>
                <label className="label-modern">Assign Teknisi</label>
                <select value={ticketTechnician} onChange={(e) => setTicketTechnician(e.target.value)} className="select-modern input-modern font-semibold">
                  <option value="Pak Heri">Pak Heri (Plumbing/AC)</option>
                  <option value="Pak Roni">Pak Roni (Listrik)</option>
                  <option value="Pak Agus">Pak Agus (Mekanikal)</option>
                  <option value="Pak Ridwan">Pak Ridwan (Umum)</option>
                  <option value="Pak Riko">Pak Riko (Umum)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button type="submit" className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide">
                  <span>✓ Buat Tiket Sekarang</span>
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold">
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