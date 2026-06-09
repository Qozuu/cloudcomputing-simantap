import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, Users, Check, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Step 1: Data Diri
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Step 2: Data Hunian
  const [unitNo, setUnitNo] = useState('');
  const [tower, setTower] = useState('Tower A');
  const [tanggalMasuk, setTanggalMasuk] = useState('');
  const [ktpNo, setKtpNo] = useState('');

  // Step 3: Upload Dokumen
  const [fileKtp, setFileKtp] = useState(null);
  const [fileKk, setFileKk] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateStep1 = () => {
    const err = {};
    if (!nama.trim()) err.nama = 'Nama Lengkap wajib diisi.';
    if (!telepon.trim()) {
      err.telepon = 'No. Telepon wajib diisi.';
    } else if (!/^\d{10,13}$/.test(telepon.trim())) {
      err.telepon = 'No. Telepon harus berupa angka 10-13 digit.';
    }
    
    if (!email.trim()) {
      err.email = 'Email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      err.email = 'Format email tidak valid.';
    }

    if (!password) {
      err.password = 'Password wajib diisi.';
    } else if (password.length < 6) {
      err.password = 'Password minimal terdiri dari 6 karakter.';
    }

    if (!confirmPassword) {
      err.confirmPassword = 'Konfirmasi Password wajib diisi.';
    } else if (password !== confirmPassword) {
      err.confirmPassword = 'Password dan Konfirmasi Password tidak cocok.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    const err = {};
    if (!unitNo.trim()) err.unitNo = 'Nomor Unit wajib diisi.';
    if (!tanggalMasuk) err.tanggalMasuk = 'Tanggal Masuk hunian wajib dipilih.';
    
    if (!ktpNo.trim()) {
      err.ktpNo = 'Nomor KTP wajib diisi.';
    } else if (!/^\d{16}$/.test(ktpNo.trim())) {
      err.ktpNo = 'Nomor KTP harus terdiri dari 16 digit angka.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setStep(3);
      setErrors({});
    }
  };

  const handleSubmitRegistration = () => {
    if (!fileKtp || !fileKk || !agreeTerms) return;
    setSuccess(true);
  };

  const handleMockKtpSelect = () => {
    setFileKtp({ name: 'ktp_digital_scan.png', size: '1.2 MB' });
  };

  const handleMockKkSelect = () => {
    setFileKk({ name: 'kartu_keluarga_official.pdf', size: '2.4 MB' });
  };

  // Validasi tombol kirim pendaftaran
  const isFormComplete = fileKtp && fileKk && agreeTerms;

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-soft mx-auto flex flex-col justify-center animate-fade-up">
        
        {success ? (
          // Success state screen
          <div className="text-center py-6 space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle size={36} strokeWidth={2.5} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#1E1E1E] leading-none text-center">Pendaftaran Terkirim!</h3>
              <p className="text-xs text-[#8A857F] font-semibold leading-relaxed max-w-xs mx-auto text-center mt-3">
                Tim kami akan memverifikasi dokumen Anda dalam 1x24 jam. Notifikasi verifikasi akan segera dikirimkan ke alamat email terdaftar.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/pilih-role')}
              className="btn-primary w-full justify-center py-3.5 mt-6 rounded-2xl"
            >
              <span>Kembali ke Pilihan Peran</span>
            </button>
          </div>
        ) : (
          <>
            {/* Step Progress Bar Segment */}
            <div className="space-y-2.5 mb-6">
              <div className="flex gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition duration-300 ${
                  step >= 1 ? 'bg-[#111111]' : 'bg-gray-200'
                }`} />
                <div className={`h-1.5 flex-1 rounded-full transition duration-300 ${
                  step >= 2 ? 'bg-[#111111]' : 'bg-gray-200'
                }`} />
                <div className={`h-1.5 flex-1 rounded-full transition duration-300 ${
                  step === 3 ? 'bg-[#111111]' : 'bg-gray-200'
                }`} />
              </div>
              
              <p className="text-xs text-[#8A857F] font-bold uppercase tracking-wider">
                {step === 1 && "Langkah 1 dari 3 — Data Pribadi"}
                {step === 2 && "Langkah 2 dari 3 — Data Hunian"}
                {step === 3 && "Langkah 3 dari 3 — Upload Dokumen"}
              </p>
            </div>

            {/* Form Step Content Box */}
            <div key={step} className="animate-fade-up space-y-5">
              
              {step === 1 && (
                <>
                  {/* Step Header */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1E1E1E]">Data Pribadi</h3>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4 text-xs font-bold text-[#1E1E1E]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Nama Lengkap</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama lengkap sesuai KTP" 
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="input-modern"
                      />
                      {errors.nama && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.nama}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">No. Telepon</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 081234567890" 
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value)}
                        className="input-modern"
                      />
                      {errors.telepon && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.telepon}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Alamat Email</label>
                      <input 
                        type="email" 
                        placeholder="nama@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-modern"
                      />
                      {errors.email && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E]">Password</label>
                        <div className="relative">
                          <input 
                            type={showPass ? 'text' : 'password'} 
                            placeholder="Min. 6 karakter" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-modern pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A857F] hover:text-[#1E1E1E] transition"
                          >
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.password}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E]">Konfirmasi Password</label>
                        <input 
                          type="password" 
                          placeholder="Ulangi password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-modern"
                        />
                        {errors.confirmPassword && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Continue */}
                  <button 
                    onClick={handleNextStep1}
                    className="btn-primary w-full justify-center py-3.5 mt-6 rounded-2xl flex items-center gap-1.5"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Step Header */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1E1E1E]">Data Hunian</h3>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4 text-xs font-bold text-[#1E1E1E]">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E]">No. Unit</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: 12A" 
                          value={unitNo}
                          onChange={(e) => setUnitNo(e.target.value)}
                          className="input-modern"
                        />
                        {errors.unitNo && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.unitNo}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E]">Tower</label>
                        <select 
                          value={tower}
                          onChange={(e) => setTower(e.target.value)}
                          className="input-modern cursor-pointer"
                        >
                          <option value="Tower A">Tower A</option>
                          <option value="Tower B">Tower B</option>
                          <option value="Tower C">Tower C</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Tanggal Masuk Hunian</label>
                      <input 
                        type="date" 
                        value={tanggalMasuk}
                        onChange={(e) => setTanggalMasuk(e.target.value)}
                        className="input-modern"
                      />
                      {errors.tanggalMasuk && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.tanggalMasuk}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Nomor KTP (16 Digit NIK)</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan 16 digit NIK" 
                        value={ktpNo}
                        onChange={(e) => setKtpNo(e.target.value)}
                        className="input-modern"
                      />
                      {errors.ktpNo && <p className="text-[#C05040] text-[10px] font-bold mt-1">{errors.ktpNo}</p>}
                    </div>
                  </div>

                  {/* Buttons Navigation */}
                  <div className="flex items-center gap-3 mt-6">
                    <div 
                      onClick={() => { setStep(1); setErrors({}); }}
                      className="text-sm font-semibold text-[#8A857F] hover:text-[#1E1E1E] cursor-pointer flex-1 py-3 text-center transition flex items-center justify-center gap-1 select-none"
                    >
                      <ArrowLeft size={13} />
                      <span>Kembali</span>
                    </div>
                    <button 
                      onClick={handleNextStep2}
                      className="btn-primary flex-1 justify-center py-3.5 rounded-2xl flex items-center gap-1"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  {/* Step Header */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1E1E1E]">Upload Dokumen</h3>
                  </div>

                  {/* Upload Zones Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-[#1E1E1E]">
                    {/* Zone 1: KTP */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Foto KTP</label>
                      {fileKtp ? (
                        <div className="border border-[#F9C3BA] bg-[#FEF0EE] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1">
                          <CheckCircle size={20} className="text-[#C05040]" />
                          <p className="text-xs font-bold text-[#1E1E1E] truncate max-w-[130px]">{fileKtp.name}</p>
                          <p className="text-[10px] text-[#8A857F]">{fileKtp.size}</p>
                          <div 
                            onClick={() => setFileKtp(null)}
                            className="text-xs text-[#C05040] hover:underline cursor-pointer font-bold tracking-wide uppercase pt-1"
                          >
                            Ganti
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={handleMockKtpSelect} 
                          className="border-2 border-dashed border-[#F9C3BA] rounded-2xl py-8 text-center bg-[#FEF0EE] hover:bg-[#FEF0EE]/80 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
                        >
                          <FileText className="text-[#C05040] w-8 h-8 mb-1.5" />
                          <span className="text-xs font-bold text-[#C05040]">Upload KTP</span>
                          <span className="text-[10px] text-[#8A857F] mt-1 font-medium">Maks 5MB</span>
                        </div>
                      )}
                    </div>

                    {/* Zone 2: KK */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E]">Kartu Keluarga (KK)</label>
                      {fileKk ? (
                        <div className="border border-[#FCD6A5] bg-[#FEF7EC] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1">
                          <CheckCircle size={20} className="text-[#A05820]" />
                          <p className="text-xs font-bold text-[#1E1E1E] truncate max-w-[130px]">{fileKk.name}</p>
                          <p className="text-[10px] text-[#8A857F]">{fileKk.size}</p>
                          <div 
                            onClick={() => setFileKk(null)}
                            className="text-xs text-[#A05820] hover:underline cursor-pointer font-bold tracking-wide uppercase pt-1"
                          >
                            Ganti
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={handleMockKkSelect} 
                          className="border-2 border-dashed border-[#FCD6A5] rounded-2xl py-8 text-center bg-[#FEF7EC] hover:bg-[#FEF7EC]/80 transition cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
                        >
                          <Users className="text-[#A05820] w-8 h-8 mb-1.5" />
                          <span className="text-xs font-bold text-[#A05820]">Upload KK</span>
                          <span className="text-[10px] text-[#8A857F] mt-1 font-medium">Maks 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms Consent Box */}
                  <div className="flex items-start gap-2.5 pt-2 bg-[#FAF6F0] p-3.5 rounded-2xl border border-[rgba(30,30,30,0.05)] text-xs font-semibold">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreeTerms}
                      // FIX UTAMA: Menggunakan e.target.checked untuk mengubah state secara akurat
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-[#111111] border-gray-300 rounded focus:ring-[#111111] mt-0.5 cursor-pointer accent-[#111111]"
                    />
                    <label htmlFor="terms" className="text-[11px] text-[#8A857F] leading-relaxed font-semibold cursor-pointer select-none">
                      Saya menyetujui <span className="text-[#1E1E1E] underline font-bold">syarat & ketentuan</span> yang berlaku di platform <span className="text-[#1E1E1E] font-bold">SiManTap</span>.
                    </label>
                  </div>

                  {/* Button Row */}
                  <div className="flex items-center gap-3 mt-6">
                    <div 
                      onClick={() => { setStep(2); setErrors({}); }}
                      className="text-sm font-semibold text-[#8A857F] hover:text-[#1E1E1E] cursor-pointer flex-1 py-3 text-center transition flex items-center justify-center gap-1 select-none"
                    >
                      <ArrowLeft size={13} />
                      <span>Kembali</span>
                    </div>
                    <button 
                      onClick={handleSubmitRegistration}
                      disabled={!isFormComplete}
                      // DYNAMIC STYLING: Tombol otomatis pekat gelap solid saat aktif, transparan tipis saat disabled
                      className={`flex-1 justify-center py-3.5 rounded-2xl flex items-center gap-1 font-semibold text-sm transition-all duration-200 select-none ${
                        isFormComplete 
                          ? 'bg-[#111111] text-white hover:bg-zinc-800 active:scale-[0.98] cursor-pointer opacity-100 shadow-md' 
                          : 'bg-zinc-400 text-zinc-100 cursor-not-allowed opacity-50 shadow-none'
                      }`}
                    >
                      <span>Kirim Pendaftaran</span>
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Footer Navigation Link */}
            <div className="pt-6 mt-6 border-t border-soft text-center">
              <p className="text-xs text-[#8A857F] font-semibold">
                Sudah memiliki akun?{' '}
                <span 
                  onClick={() => navigate('/pilih-role')}
                  className="text-sm font-semibold text-[#1E1E1E] hover:underline cursor-pointer inline-block ml-1"
                >
                  Masuk
                </span>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}