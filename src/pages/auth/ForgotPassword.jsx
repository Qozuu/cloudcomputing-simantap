import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, MailCheck } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = () => {
    setError('');

    if (!email.trim()) {
      setError('Alamat Email wajib diisi.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    setIsSent(true);
  };

  const handleReset = () => {
    setIsSent(false);
    setEmail('');
    setError('');
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center animate-fade-up">
      
      {/* Back to Login Link */}
      <div 
        onClick={() => navigate('/login')}
        className="text-sm font-semibold text-[#8A857F] hover:text-[#1E1E1E] cursor-pointer mb-6 inline-flex items-center gap-1.5 select-none transition-colors duration-200 w-fit"
      >
        <ChevronLeft size={16} />
        <span>Kembali ke Login</span>
      </div>

      {!isSent ? (
        // State A: Input Email Form
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EEEDFB] text-[#5850C0] flex items-center justify-center mx-auto">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1E1E1E] mt-4 leading-tight text-center tracking-tight">
              Lupa Password?
            </h2>
            <p className="text-xs text-[#8A857F] font-semibold leading-relaxed mt-2 max-w-xs mx-auto text-center">
              Masukkan email terdaftar Anda, kami akan mengirimkan tautan untuk mengatur ulang password.
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 text-xs font-semibold text-[#C05040] bg-[#FEF0EE] border border-[#F9C3BA] rounded-xl animate-fade-up">
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4 text-xs font-bold text-[#1E1E1E]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E1E1E]">Alamat Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
              />
            </div>

            <button 
              onClick={handleSendLink}
              className="btn-primary w-full justify-center py-3.5 mt-6 rounded-2xl"
            >
              <span>Kirim Tautan Reset</span>
            </button>
          </div>
        </div>
      ) : (
        // State B: Email Sent Screen
        <div className="text-center space-y-6 animate-scale-in">
          <div className="w-12 h-12 rounded-2xl bg-[#E8FAF3] text-[#208060] flex items-center justify-center mx-auto">
            <MailCheck size={24} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#1E1E1E] leading-tight text-center tracking-tight">
              Cek Email Anda
            </h2>
            <p className="text-xs text-[#8A857F] font-semibold leading-relaxed max-w-xs mx-auto text-center">
              Tautan reset password telah dikirim ke <strong className="text-[#1E1E1E] font-bold">{email}</strong>. Tautan ini berlaku selama 30 menit.
            </p>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="btn-primary w-full justify-center py-3.5 rounded-2xl"
          >
            <span>Kembali ke Login</span>
          </button>

          <div className="pt-2">
            <span 
              onClick={handleReset}
              className="text-[10px] font-bold uppercase tracking-widest text-[#8A857F] hover:text-[#1E1E1E] cursor-pointer select-none transition-colors duration-200"
            >
              Kirim Ulang Tautan
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
