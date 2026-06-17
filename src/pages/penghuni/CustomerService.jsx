import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Building,
  Wrench,
  CreditCard,
  X,
  Sparkles,
  Bot,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// 📞 HOTLINE TUNGGAL PENGELOLA (Satu nomor untuk semua divisi)
const HOTLINE_WA_PUSAT = '6288975285486';

const DEPT_CONFIG = {
  pemeliharaan: {
    label:       'Pemeliharaan & Kerusakan',
    description: 'Laporan kerusakan unit, perbaikan, teknisi',
    adminLabel:  'Admin Pemeliharaan',
    categories:  ['Kerusakan Unit', 'Perbaikan', 'AC & Pendingin', 'Plumbing', 'Lainnya'],
    welcome:     'Halo! Selamat datang di CS SiManTap. Pilih kategori dan sampaikan pertanyaan mengenai kerusakan atau perbaikan unit Anda.',
    waSubtitle:  'Gunakan WhatsApp untuk kirim foto kerusakan ke Hotline',
  },
  keuangan: {
    label:       'Keuangan & Tagihan',
    description: 'Tagihan IPL, konfirmasi pembayaran, tunggakan',
    adminLabel:  'Admin Keuangan',
    categories:  ['Tagihan IPL', 'Konfirmasi Pembayaran', 'Tunggakan', 'Tagihan Fasilitas', 'Lainnya'],
    welcome:     'Halo! Selamat datang di CS Keuangan SiManTap. Kami siap membantu pertanyaan seputar tagihan and pembayaran apartemen Anda.',
    waSubtitle:  'Gunakan WhatsApp untuk kirim foto bukti pembayaran ke Hotline',
  },
  fasilitas: {
    label:       'Reservasi & Fasilitas',
    description: 'Booking fasilitas, jadwal, pembatalan reservasi',
    adminLabel:  'Admin Fasilitas',
    categories:  ['Reservasi Fasilitas', 'Jadwal & Ketersediaan', 'Pembatalan Reservasi', 'Info Fasilitas', 'Lainnya'],
    welcome:     'Halo! Selamat datang di CS Fasilitas SiManTap. Kami siap membantu pertanyaan seputar reservasi dan fasilitas apartemen.',
    waSubtitle:  'Gunakan WhatsApp untuk kirim foto atau file bukti ke Hotline',
  },
};

export default function KontakPengelola() {
  const [showAI, setShowAI] = useState(true);
  const chatEndRef = useRef(null);

  // Departemen Aktif
  const [selectedDept, setSelectedDept] = useState('pemeliharaan');
  const dept = DEPT_CONFIG[selectedDept];
  
  // Panel Kiri - State Live Chat Utama
  const [csCategory, setCsCategory] = useState(DEPT_CONFIG.pemeliharaan.categories[0]);
  const [csInput, setCsInput] = useState('');
  const [csMessages, setCsMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Panel Kanan - State Widget AI
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Halo! Saya SiManTap AI, asisten virtual Grand Surabaya. Saya bisa menjawab otomatis seputar info fasilitas umum, panduan tagihan, atau prosedur administrasi.'
    }
  ]);

  // Fetch current user on mount
  useEffect(() => {
    async function initUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Failed to get user:', err.message);
      }
    }
    initUser();
  }, []);

  const loadMessages = async (convId, adminName) => {
    try {
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted = msgs.map(m => {
        const isMe = m.sender_id === currentUser?.id;
        const avatar = selectedDept === 'pemeliharaan' ? 'LT' : (selectedDept === 'keuangan' ? 'AK' : 'AF');
        return {
          id: m.id,
          sender: isMe ? 'user' : 'admin',
          name: isMe ? 'Hendra' : adminName,
          avatar: avatar,
          text: m.body,
          time: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
      });

      if (formatted.length === 0) {
        setCsMessages([
          {
            id: 'welcome',
            sender: 'admin',
            name: dept.adminLabel,
            avatar: selectedDept === 'pemeliharaan' ? 'LT' : (selectedDept === 'keuangan' ? 'AK' : 'AF'),
            text: dept.welcome,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setCsMessages(formatted);
      }
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    }
  };

  // Setup conversation when department or user changes
  useEffect(() => {
    if (!currentUser) return;
    
    async function setupConversation() {
      try {
        setLoading(true);
        
        // 🚀 KOREKSI UTAMA: Sesuaikan Mapping Role dengan CHECK Constraint tabel public.users Anda!
        const roleMap = {
          pemeliharaan: 'admin_pemeliharaan',
          keuangan: 'admin_keuangan',
          fasilitas: 'admin_fasilitas'
        };
        const targetRole = roleMap[selectedDept];
        
        // Cari admin yang sesuai dengan role database terbaru
        let { data: adminUser } = await supabase
          .from('users')
          .select('id, nama')
          .eq('role', targetRole)
          .limit(1)
          .maybeSingle();

        // 🚀 BACKUP DEMO SAFETY: Jika akun admin divisi belum dibuat di database Anda,
        // berikan user ID dummy agar room chat tetap terbuat dan tombol kirim terbuka!
        if (!adminUser) {
          adminUser = {
            id: currentUser.id, // Fallback aman mengarah ke user sendiri/id dummy
            nama: dept.adminLabel
          };
        }

        if (adminUser) {
          // Cari ID Percakapan yang sudah ada antara Anda dan Admin tersebut
          const { data: myParts } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUser.id);

          const myConvIds = myParts?.map(p => p.conversation_id) || [];
          
          let activeConvId = null;
          if (myConvIds.length > 0 && adminUser.id !== currentUser.id) {
            const { data: adminParts } = await supabase
              .from('conversation_participants')
              .select('conversation_id')
              .in('conversation_id', myConvIds)
              .eq('user_id', adminUser.id)
              .limit(1);

            if (adminParts && adminParts.length > 0) {
              activeConvId = adminParts[0].conversation_id;
            }
          }

          // Jika room percakapan belum pernah dibuat di database, lakukan insert room baru
          if (!activeConvId) {
            if (myConvIds.length > 0) {
              activeConvId = myConvIds[0];
            } else {
              const { data: newConv, error: cErr } = await supabase
                .from('conversations')
                .insert({})
                .select('id')
                .single();

              if (cErr) throw cErr;
              activeConvId = newConv.id;

              // Daftarkan participant ke tabel conversation_participants
              const participantsData = [{ conversation_id: activeConvId, user_id: currentUser.id }];
              if (adminUser.id !== currentUser.id) {
                participantsData.push({ conversation_id: activeConvId, user_id: adminUser.id });
              }

              await supabase.from('conversation_participants').insert(participantsData);
            }
          }

          setConversationId(activeConvId);
          await loadMessages(activeConvId, adminUser.nama);
        }
      } catch (err) {
        console.error('Setup conversation error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    setupConversation();
  }, [currentUser, selectedDept]);

  // Realtime subscribe
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const channel = supabase.channel(`messages-rt-${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const isMe = payload.new.sender_id === currentUser.id;
          
          // Ambil nama pengirim dari tabel users Anda
          const { data: senderUser } = await supabase
            .from('users')
            .select('nama')
            .eq('id', payload.new.sender_id)
            .single();

          const avatar = selectedDept === 'pemeliharaan' ? 'LT' : (selectedDept === 'keuangan' ? 'AK' : 'AF');
          const formattedMsg = {
            id: payload.new.id,
            sender: isMe ? 'user' : 'admin',
            name: isMe ? 'Hendra' : (senderUser?.nama || 'Admin'),
            avatar: avatar,
            text: payload.new.body,
            time: new Date(payload.new.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          };

          setCsMessages(prev => {
            if (prev.some(m => m.id === formattedMsg.id)) return prev;
            const filtered = prev.filter(m => m.id !== 'welcome');
            return [...filtered, formattedMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUser, selectedDept]);

  // Otomatis scroll ke pesan paling bawah jika ada chat baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [csMessages]);

  // Efek Reset Kategori Utama jika Departemen Berubah
  useEffect(() => {
    setCsCategory(DEPT_CONFIG[selectedDept].categories[0]);
  }, [selectedDept]);

  const dapatkanTeksSpanduk = () => {
    if (csCategory === 'Lainnya') {
      return 'Untuk keluhan umum atau di luar opsi, disarankan langsung chat via WhatsApp Hotline Pusat.';
    }
    return dept.waSubtitle;
  };

  const getWhatsAppLink = (kategori) => {
    const templateTeks = `Halo Pengelola SiManTap, saya memerlukan bantuan mengenai keluhan/kebutuhan divisi *${dept.label}* dengan kategori: *${kategori}*.`;
    return `whatsapp://send?phone=${HOTLINE_WA_PUSAT}&text=${encodeURIComponent(templateTeks)}`;
  };

  const onDeptChange = (deptKey) => {
    setSelectedDept(deptKey);
  };

  // Handle Kirim Chat Utama
  const handleCsSend = async (e) => {
    e.preventDefault();
    if (!csInput.trim() || !conversationId || !currentUser) return;

    const text = csInput;
    setCsInput('');

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        body: text
      });
    } catch (err) {
      console.error('Failed to send message:', err.message);
    }
  };

  // Handle Kirim Chat AI
  const handleAiSend = (textToSend) => {
    const text = textToSend || aiInput;
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: text };
    setAiMessages(prev => [...prev, newMsg]);
    if (!textToSend) setAiInput('');

    setTimeout(() => {
      let aiResponseText = 'Maaf, saya belum memahami pertanyaan Anda. Silakan gunakan fitur Live Chat utama untuk berbicara dengan admin pengelola kami.';
      const query = text.toLowerCase();

      if (query.includes('fasilitas') || query.includes('kolam') || query.includes('gym')) {
        aiResponseText = 'Fasilitas Grand Surabaya: Kolam Renang (Lantai G Tower A, 06.00-21.00, Gratis) & Fitness Center (Lantai 2, 06.00-22.00, Gratis).';
      } else if (query.includes('kerusakan') || query.includes('bocor') || query.includes('rusak')) {
        aiResponseText = 'Untuk klaim perbaikan fisik unit, disarankan mengisi dokumentasi resmi pada menu [Laporan Kerusakan] di sidebar agar jadwal teknisi langsung terbit.';
      } else if (query.includes('tagihan') || query.includes('pembayaran') || query.includes('ipl')) {
        aiResponseText = 'Rincian IPL dapat diakses via menu [E-Billing]. Pembayaran resmi menggunakan Virtual Account atau QRIS yang tertera pada invoice Anda.';
      }

      setAiMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponseText }]);
    }, 700);
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat Chat...</div>;
  }

  return (
    <div className="space-y-6 text-zinc-800">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[560px]">
        
        {/* PANEL KIRI - Live Chat Pengelola Terpusat */}
        <div className="flex-1 bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header Konten */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 leading-none">
                  Kontak Pengelola — {dept.adminLabel}
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Layanan Aplikasi Aktif (Jam Operasional 08:00 - 20:00)
                  </span>
                </div>
              </div>
            </div>

            {/* Department Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(DEPT_CONFIG).map(([key, value]) => {
                const isSelected = selectedDept === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onDeptChange(key)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                        : 'border-zinc-200 bg-zinc-50/50 text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{value.label}</p>
                    <p className={`text-[10px] mt-1 leading-normal ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{value.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Banner */}
            <div className="bg-[#E8FAF3] border border-[#b5ead7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-[#187050] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#187050]">
                    {csCategory === 'Lainnya' ? 'Butuh Penanganan Cepat?' : 'Butuh Kirim Bukti Fisik / Foto?'}
                  </p>
                  <p className="text-[10px] text-[#187050] font-medium mt-0.5">
                    {dapatkanTeksSpanduk()}
                  </p>
                </div>
              </div>
              <a
                href={getWhatsAppLink(csCategory)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#187050] hover:bg-[#115038] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition text-center shadow-sm flex items-center justify-center gap-1 flex-shrink-0"
              >
                <Phone size={10} />
                <span>WA — Hotline Pusat</span>
              </a>
            </div>

            {/* Dropdown Kategori Bahasan */}
            <div className="w-full sm:w-64">
              <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Kategori Bahasan
              </label>
              <select
                value={csCategory}
                onChange={(e) => setCsCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-semibold cursor-pointer"
              >
                {dept.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Ruang Percakapan Chat */}
            <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-4 h-[260px] overflow-y-auto space-y-4">
              {csMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'admin' && (
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-sm" title={msg.name}>
                      {msg.avatar}
                    </div>
                  )}
                  <div className="max-w-[70%] space-y-1">
                    <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-zinc-950 text-white rounded-br-none'
                        : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`block text-[9px] font-bold text-zinc-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.sender === 'admin' ? `${msg.name} · ` : ''}{msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
          </div>

          {/* Form Pengiriman Chat */}
          <form onSubmit={handleCsSend} className="mt-4 pt-4 border-t border-zinc-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={csInput}
                onChange={(e) => setCsInput(e.target.value)}
                placeholder={`Tulis pesan Anda ke ${csCategory}...`}
                className="block w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-xs bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-medium"
              />
              <button
                type="submit"
                className="bg-zinc-950 hover:bg-zinc-900 text-white p-2.5 rounded-xl transition flex items-center justify-center flex-shrink-0 shadow-sm animate-fade-in"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* PANEL KANAN - AI Companion Widget */}
        {showAI ? (
          <div className="w-full lg:w-72 bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm flex flex-col justify-between self-start">
            <div>
              {/* AI Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-none">SiManTap AI</h4>
                    <div className="flex items-center gap-1 mt-1.5 leading-none">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9px] text-emerald-700 font-bold">Asisten Virtual</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowAI(false)} className="text-zinc-400 hover:text-zinc-900 transition">
                  <X size={14} />
                </button>
              </div>

              {/* Hotline Emergency */}
              <div className="py-2.5 text-[9px] text-zinc-400 font-semibold border-b border-zinc-100 flex items-center justify-between">
                <span>Hotline Resmi WA Pusat:</span>
                <a href={`https://wa.me/${HOTLINE_WA_PUSAT}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                  <Phone size={9} />
                  <span>0889-7528-5486</span>
                </a>
              </div>

              {/* Log Chat AI */}
              <div className="py-3 space-y-3 max-h-[190px] overflow-y-auto">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs font-medium leading-relaxed border ${
                      msg.sender === 'user'
                        ? 'bg-zinc-950 text-white border-zinc-950 ml-6 rounded-tr-none'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-100 mr-6 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Tombol Akses Cepat AI */}
              <div className="space-y-1.5 border-t border-zinc-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleAiSend('Info Fasilitas')}
                  className="w-full flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-600 font-semibold transition text-left shadow-sm"
                >
                  <Building size={11} className="text-zinc-400" />
                  <span>Info Fasilitas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiSend('Prosedur Kerusakan')}
                  className="w-full flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-600 font-semibold transition text-left shadow-sm"
                >
                  <Wrench size={11} className="text-zinc-400" />
                  <span>Prosedur Kerusakan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiSend('Panduan IPL & Pembayaran')}
                  className="w-full flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-600 font-semibold transition text-left shadow-sm"
                >
                  <CreditCard size={11} className="text-zinc-400" />
                  <span>Panduan IPL & Pembayaran</span>
                </button>
              </div>
            </div>

            {/* Kolom Input Teks AI */}
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-zinc-100">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Tanya AI..."
                className="block w-full px-3 py-1.5 border border-zinc-200 rounded-xl text-[10px] bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 font-medium"
              />
              <button
                type="button"
                onClick={() => handleAiSend()}
                className="bg-zinc-950 hover:bg-zinc-900 text-white p-2 rounded-xl transition flex items-center justify-center flex-shrink-0"
              >
                <Send size={10} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAI(true)}
            className="w-10 h-10 rounded-full bg-zinc-950 hover:bg-zinc-900 text-white flex items-center justify-center shadow-md transition self-end absolute right-0 bottom-16 lg:static animate-bounce"
            title="Tampilkan AI"
          >
            <Sparkles size={14} />
          </button>
        )}
      </div>
    </div>
  );
}