import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ChatKeuangan() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
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

  const loadConversations = async (adminId) => {
    try {
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

      const { data: otherParticipants, error: opError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, users:users(nama, role)')
        .in('conversation_id', convIds)
        .neq('user_id', adminId);

      if (opError) throw opError;

      const residentIds = otherParticipants?.map(p => p.user_id) || [];

      const { data: penghunis, error: pgError } = await supabase
        .from('penghuni')
        .select('user_id, unit(nomor_unit)')
        .in('user_id', residentIds);

      const { data: messages, error: mError } = await supabase
        .from('messages')
        .select('conversation_id, body, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      const mapped = otherParticipants.map(participant => {
        const userId = participant.user_id;
        const name = participant.users?.nama || 'Anonim';
        const unitData = penghunis?.find(p => p.user_id === userId);
        const unitNum = unitData?.unit?.nomor_unit || '—';
        
        const lastMsgObj = messages?.find(m => m.conversation_id === participant.conversation_id);
        const lastMessage = lastMsgObj?.body || 'Belum ada pesan';
        const time = lastMsgObj?.created_at
          ? new Date(lastMsgObj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—';

        return {
          id: participant.conversation_id,
          userId: userId,
          name: name,
          unit: unitNum !== '—' ? `Unit ${unitNum}` : '—',
          lastMessage: lastMessage,
          time: time,
          unread: false,
          messages: []
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

  useEffect(() => {
    if (!activeId || !currentUser) return;

    const channel = supabase.channel(`messages-rt-${activeId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `conversation_id=eq.${activeId}` },
        async (payload) => {
          const isAdmin = payload.new.sender_id === currentUser.id;
          const formattedMsg = {
            sender: isAdmin ? 'admin' : 'resident',
            text: payload.new.body,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeId) {
                const exists = c.messages.some(m => m.text === formattedMsg.text && m.time === formattedMsg.time);
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

  const handleSelectChat = async (id) => {
    setActiveId(id);
    try {
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*, sender:users(nama, role)')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted = msgs.map(m => {
        const isAdmin = m.sender?.role?.startsWith('div_') || m.sender_id === currentUser?.id;
        return {
          sender: isAdmin ? 'admin' : 'resident',
          text: m.body,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, messages: formatted, unread: false } : c)
      );
    } catch (err) {
      console.error('Failed to load messages:', err.message);
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

  const handleCreateValidationSubmit = async (e) => {
    e.preventDefault();
    if (!activeChat) return;

    try {
      // Find the first unpaid bill (tagihan) for this resident
      const { data: tagihans } = await supabase
        .from('tagihan')
        .select('id')
        .or(`user_id.eq.${activeChat.userId},penghuni_id.eq.${activeChat.userId}`)
        .eq('status', 'belum_bayar')
        .limit(1);

      let targetId = null;
      if (tagihans && tagihans.length > 0) {
        targetId = tagihans[0].id;
      }

      if (targetId) {
        const { error } = await supabase
          .from('tagihan')
          .update({
            status: 'sudah_bayar',
            tgl_bayar: new Date()
          })
          .eq('id', targetId);

        if (error) throw error;
      }

      setModalOpen(false);
      setSuccessToast(`Konfirmasi pembayaran untuk ${activeChat.name} berhasil disimpan!`);
      setTimeout(() => setSuccessToast(''), 3000);
      setBillingPeriod('');
      setAmount('');
      setTransactionId('');
      setPaymentDate('');
      setInternalNotes('');
    } catch (err) {
      console.error('Failed to validate payment:', err.message);
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
                className="w-full text-left p-4 transition duration-150 flex items-start gap-3 hover:bg-app-bg border-l-[3.5px]"
                style={{ 
                  borderColor: isActiveItem ? 'var(--ink)' : 'transparent', 
                  backgroundColor: isActiveItem ? 'var(--app-bg)' : 'var(--surface)' 
                }}
              >
                {/* Avatar Initials */}
                <div className="avatar avatar-md avatar-lavender shadow-sm">
                  {initials}
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
                Chat di aplikasi untuk komunikasi teks internal aplikasi SiManTap
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

      {/* CATAT KONFIRMASI BAYAR MODAL */}
      {modalOpen && activeChat && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Catat Konfirmasi Bayar</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-ink transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Banner */}
            <div className="px-5 py-3 bg-[#EEEDFB] border-b border-soft text-[11px] font-bold text-[#4840B0] flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-[#4840B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-tight">Catat konfirmasi pembayaran berdasarkan chat dari penghuni {activeChat.name} · Unit {activeChat.unit.replace('Unit ', '')}</span>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateValidationSubmit} className="modal-body space-y-4 p-5">
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
                {/* Tipe Tagihan */}
                <div>
                  <label className="label-modern">Tipe Tagihan</label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="IPL Bulanan">IPL Bulanan</option>
                    <option value="Sewa Fasilitas">Sewa Fasilitas</option>
                    <option value="Denda / Lainnya">Denda / Lainnya</option>
                  </select>
                </div>
                
                {/* Periode Tagihan */}
                <div>
                  <label className="label-modern">Periode Tagihan</label>
                  <input
                    type="text"
                    required
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                    placeholder="Contoh: April 2026"
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jumlah Nominal */}
                <div>
                  <label className="label-modern">Nominal Pembayaran</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 250000"
                    className="input-modern font-semibold"
                  />
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="label-modern">Metode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Virtual Account">Virtual Account</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai">Tunai</option>
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

                {/* ID Transaksi / Reference */}
                <div>
                  <label className="label-modern">ID Transaksi / Ref</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Contoh: TRX-12345"
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              {/* Status Konfirmasi */}
              <div>
                <label className="label-modern">Status Verifikasi</label>
                <select
                  value={confirmationStatus}
                  onChange={(e) => setConfirmationStatus(e.target.value)}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Lunas — Pembayaran Terverifikasi">Lunas — Pembayaran Terverifikasi</option>
                  <option value="Proses Pengecekan">Proses Pengecekan</option>
                  <option value="Ditolak — Bukti Tidak Valid">Ditolak — Bukti Tidak Valid</option>
                </select>
              </div>

              {/* Description / Internal Notes */}
              <div>
                <label className="label-modern">Catatan Internal</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Catatan verifikasi pembayaran..."
                  className="textarea-modern font-semibold"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold tracking-wide"
                >
                  <span>✓ Simpan Konfirmasi</span>
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