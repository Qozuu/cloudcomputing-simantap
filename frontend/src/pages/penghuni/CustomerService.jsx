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
  Bot
} from 'lucide-react';

export default function CustomerService() {
  const [showAI, setShowAI] = useState(true);
  const chatEndRef = useRef(null);
  
  // Left Panel - CS Live Chat States
  const [csCategory, setCsCategory] = useState('Pemeliharaan / Kerusakan');
  const [csInput, setCsInput] = useState('');
  const [csMessages, setCsMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      name: 'Admin CS',
      avatar: 'A',
      text: 'Selamat datang di Customer Service SiManTap! Pilih kategori dan sampaikan pertanyaan Anda...',
      time: '09:00'
    },
    {
      id: 2,
      sender: 'user',
      name: 'Hendra',
      text: 'Halo admin, AC saya masih bocor sudah 2 hari ya, bisa dicek statusnya?',
      time: '09:05'
    },
    {
      id: 3,
      sender: 'admin',
      name: 'Admin CS',
      avatar: 'A',
      text: 'Hai Pak Hendra! Tiket TK-0088 sudah diproses oleh Pak Roni. Spare part sudah dipesan dan diperkirakan selesai dalam 1-2 hari ke depan.',
      time: '09:06'
    }
  ]);

  // Right Panel - AI Widget States
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Halo! Saya SiManTap AI, asisten virtual apartemen Grand Surabaya. Saya bisa menjawab pertanyaan seputar fasilitas, tagihan, kerusakan, dan layanan apartemen. Silakan tanyakan apa saja.'
    }
  ]);

  // Auto scroll ke chat paling bawah saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [csMessages]);

  // ✨ FIX: Menggunakan deep link (whatsapp://) bypass halaman web konfirmasi
  const getWhatsAppLink = () => {
    const nomorAdmin = "6288975285486";
    const templateTeks = `Halo admin SiManTap, saya memerlukan bantuan mengenai ${csCategory}.`;
    return `whatsapp://send?phone=${nomorAdmin}&text=${encodeURIComponent(templateTeks)}`;
  };

  // Handle CS Send
  const handleCsSend = (e) => {
    e.preventDefault();
    if (!csInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      name: 'Hendra',
      text: csInput,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setCsMessages(prev => [...prev, newMsg]);
    const userQuery = csInput;
    setCsInput('');

    // Simulated CS Auto Reply after 1.5 seconds
    setTimeout(() => {
      setCsMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'admin',
          name: 'Admin CS',
          avatar: 'A',
          text: `Terima kasih atas laporan Anda mengenai "${userQuery}". Pesan Anda telah diteruskan ke tim terkait (${csCategory}). Kami akan merespons dalam beberapa menit.`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Handle AI Send / Action Click
  const handleAiSend = (textToSend) => {
    const text = textToSend || aiInput;
    if (!text.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text
    };

    setAiMessages(prev => [...prev, newMsg]);
    if (!textToSend) setAiInput('');

    // Generate smart mock AI response
    setTimeout(() => {
      let aiResponseText = 'Maaf, saya tidak memahami pertanyaan tersebut. Bisa hubungi Customer Service kami via WhatsApp untuk detail lebih lanjut.';
      const query = text.toLowerCase();

      if (query.includes('fasilitas') || query.includes('kolam') || query.includes('gym')) {
        aiResponseText = 'Fasilitas di Grand Surabaya meliputi Kolam Renang (Lantai G Tower A, 06.00-21.00, Gratis), Fitness Center (Lantai 2, 06.00-22.00, Gratis), dan Lapangan Tenis (Rooftop, 07.00-20.00, Berbayar Rp 75rb/sesi). Silakan pesan lewat menu Fasilitas.';
      } else if (query.includes('kerusakan') || query.includes('bocor') || query.includes('rusak')) {
        aiResponseText = 'Untuk melaporkan kerusakan unit (AC, pipa bocor, kelistrikan), silakan isi formulir di menu E-Reporting. Teknisi kami akan ditunjuk dalam 1 jam dan jadwalnya akan tertera langsung di dashboard Anda.';
      } else if (query.includes('tagihan') || query.includes('pembayaran') || query.includes('ipl')) {
        aiResponseText = 'Pembayaran IPL dan parkir dapat dilakukan dengan transfer ke rekening BCA 1234567890 a.n PT Pengelola Apartemen atau scan QRIS. Konfirmasi otomatis akan tampil di menu E-Billing Anda setelah pembayaran diproses.';
      }

      setAiMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText
        }
      ]);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-up relative">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[560px]">
        
        {/* LEFT PANEL - Chat CS */}
        <div className="flex-1 card-section p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-soft pb-4 gap-3">
              <div>
                <h3 className="text-sm font-bold text-ink leading-none">
                  Customer Service — Admin Pemeliharaan
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Online · Biasanya membalas dalam 5-10 menit
                  </span>
                </div>
              </div>

              {/* Tombol Header WA dengan Deep Link */}
              <a
                href={getWhatsAppLink()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#187050] hover:bg-[#187050]/90 text-white rounded-full text-xs font-bold transition duration-150 shadow-soft"
              >
                <Phone size={12} />
                <span>Live Chat WhatsApp</span>
              </a>
            </div>

            {/* WA Promo Banner */}
            <div className="bg-[#E8FAF3] border border-soft rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-[#187050] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    Untuk respons CEPAT & REALTIME — Chat via WhatsApp
                  </p>
                  <p className="text-[10px] text-muted font-medium mt-0.5">
                    Phone: <span className="font-bold">088975285486</span> · Jam layanan 08:00 - 20:00
                  </p>
                </div>
              </div>
              {/* Tombol Banner WA dengan Deep Link */}
              <a
                href={getWhatsAppLink()}
                className="px-3.5 py-1.5 bg-[#187050] hover:bg-[#187050]/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition text-center shadow-soft"
              >
                Baru WA →
              </a>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[9px] font-bold text-muted uppercase tracking-widest mb-1.5">
                Kategori Pertanyaan
              </label>
              <select
                value={csCategory}
                onChange={(e) => setCsCategory(e.target.value)}
                className="input-modern select-modern block w-full sm:w-64"
              >
                <option value="Pemeliharaan / Kerusakan">Pemeliharaan / Kerusakan</option>
                <option value="Billing & Tagihan">Billing & Tagihan</option>
                <option value="Reservasi Fasilitas">Reservasi Fasilitas</option>
                <option value="Keluhan / Lainnya">Keluhan / Lainnya</option>
              </select>
            </div>

            {/* Chat Area */}
            <div className="bg-app-bg border border-soft rounded-2xl p-4 h-[280px] overflow-y-auto space-y-4">
              {csMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'admin' && (
                    <div className="avatar avatar-sm avatar-lavender flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-soft">
                      {msg.avatar}
                    </div>
                  )}
                  <div className="max-w-[70%] space-y-1">
                    <div className={`px-4 py-2.5 rounded-2xl shadow-softer text-xs font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-active text-white rounded-br-none'
                        : 'bg-surface text-ink border border-soft rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`block text-[9px] font-bold text-muted ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.sender === 'admin' ? `${msg.name} · ` : ''}{msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleCsSend} className="mt-4 pt-4 border-t border-soft space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={csInput}
                onChange={(e) => setCsInput(e.target.value)}
                placeholder="Tulis pesan..."
                className="input-modern"
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2.5 rounded-full"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-muted text-center font-bold">
              Chat di aplikasi · Tombol WA banner di atas → langsung ke WhatsApp CS
            </p>
          </form>
        </div>

        {/* RIGHT PANEL - AI Widget */}
        {showAI ? (
          <div className="w-full lg:w-72 card-section p-4 flex flex-col justify-between self-start animate-scale-in">
            
            {/* Header */}
            <div>
              <div className="flex items-start justify-between border-b border-soft pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 avatar avatar-sm avatar-lavender rounded-xl text-ink">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink leading-none">SiManTap AI</h4>
                    <div className="flex items-center gap-1 mt-1 leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[9px] text-emerald-700 font-bold">AI Online — Siap Membantu</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-muted hover:text-ink transition"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Promo link text WA dengan Deep Link */}
              <div className="py-2.5 text-[10px] text-muted font-semibold border-b border-soft flex items-center justify-between">
                <span>Butuh bantuan CS manual?</span>
                <a href={getWhatsAppLink()} className="text-[#187050] hover:underline flex items-center gap-1">
                  <Phone size={10} />
                  <span>088975285486</span>
                </a>
              </div>

              {/* Message scroll container */}
              <div className="py-3 space-y-3 max-h-[220px] overflow-y-auto">
                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs font-medium leading-relaxed border border-soft ${
                      msg.sender === 'user'
                        ? 'bg-pastel-lavender-bg text-ink self-end ml-6 rounded-tr-none'
                        : 'bg-app-bg text-ink mr-6 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5 border-t border-soft pt-3">
                <button
                  type="button"
                  onClick={() => handleAiSend('Info Fasilitas')}
                  className="w-full flex items-center gap-2 bg-surface hover:bg-app-bg border border-soft rounded-xl px-2.5 py-1.5 text-[10px] text-muted font-bold transition text-left"
                >
                  <Building size={12} className="text-ink" />
                  <span>Info Fasilitas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiSend('Laporan Kerusakan')}
                  className="w-full flex items-center gap-2 bg-surface hover:bg-app-bg border border-soft rounded-xl px-2.5 py-1.5 text-[10px] text-muted font-bold transition text-left"
                >
                  <Wrench size={12} className="text-ink" />
                  <span>Laporan Kerusakan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiSend('Tagihan & Pembayaran')}
                  className="w-full flex items-center gap-2 bg-surface hover:bg-app-bg border border-soft rounded-xl px-2.5 py-1.5 text-[10px] text-muted font-bold transition text-left"
                >
                  <CreditCard size={12} className="text-ink" />
                  <span>Tagihan & Pembayaran</span>
                </button>
              </div>
            </div>

            {/* Input Row */}
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-soft">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Tanya AI..."
                className="input-modern py-1.5 text-[10px]"
              />
              <button
                type="button"
                onClick={() => handleAiSend()}
                className="btn-primary p-2 rounded-xl transition flex items-center justify-center flex-shrink-0"
              >
                <Send size={10} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAI(true)}
            className="w-10 h-10 rounded-full bg-active hover:bg-[#2D2D2D] text-white flex items-center justify-center shadow-soft transition self-end cursor-pointer absolute right-0 bottom-16 lg:static animate-bounce"
            title="Tampilkan AI"
          >
            <Sparkles size={16} />
          </button>
        )}
      </div>
    </div>
  );
}