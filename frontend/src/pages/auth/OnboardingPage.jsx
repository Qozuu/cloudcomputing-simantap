import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, BarChart2, ArrowRight } from 'lucide-react';
// IMPORT FILE ASLI PNG
import LogoSiManTap from '../../assets/logo.png';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      tag: "Platform Terpadu",
      title: "Kelola Apartemen\nLebih Cerdas",
      desc: "Platform manajemen apartemen berbasis cloud yang menghubungkan seluruh divisi operasional dalam satu sistem terintegrasi."
    },
    {
      tag: "Dashboard Real-time",
      title: "Pantau Semua\nDalam Satu Layar",
      desc: "Dashboard terintegrasi untuk memantau tagihan, tiket kerusakan, absensi karyawan, dan fasilitas apartemen secara real-time."
    },
    {
      tag: "7 Role Pengguna",
      title: "Dirancang untuk\nSetiap Divisi",
      desc: "Dari Super Admin hingga Penghuni, setiap divisi memiliki akses dan tampilan dashboard yang disesuaikan dengan peran mereka.",
      roles: ["Super Admin", "Keuangan", "Pemeliharaan", "Kebersihan", "Keamanan", "Fasilitas", "Penghuni"]
    },
    {
      tag: "Siap Mulai",
      title: "Mulai Kelola\nApartemen Sekarang",
      desc: "Masuk dengan akun yang telah didaftarkan oleh administrator, atau daftarkan diri Anda sebagai penghuni baru."
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentSlide(3);
  };

  return (
    <div className="h-screen w-full bg-[#FAF6F0] font-sans flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* LEFT PRESENTATION SIDE - Visible on md screens and up */}
      <aside className={`hidden md:flex md:w-1/2 h-full flex-col justify-between p-12 transition-colors duration-500 ${
        currentSlide === 0 ? 'bg-[#FEF0EE]' :
        currentSlide === 1 ? 'bg-[#FEF7EC]' :
        currentSlide === 2 ? 'bg-[#EEEDFB]' :
        'bg-[#E8FAF3]'
      }`}>
        {/* LOGO VERSI DESKTOP - GAP DIKECILKAN & NEGATIVE MARGIN AGAR TULISAN KE KIRI */}
        <div className="flex items-center gap-1.5">
          <img 
            src={LogoSiManTap} 
            alt="Logo SiManTap" 
            className="w-12 h-12 aspect-square object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)] select-none shrink-0" 
          />
          <span className="text-xl font-black text-[#1E1E1E] uppercase tracking-wider -ml-0.5">
            SiManTap
          </span>
        </div>

        {/* Bold typography layout */}
        <div className="my-auto">
          <h1 className="text-4xl lg:text-5xl font-black text-[#1E1E1E] tracking-tight leading-tight">
            SiManTap<br />Smart Apartment<br />Management
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-[#8A857F] mt-3">
            Grand Surabaya Apartment Ecosystem
          </p>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-[#8A857F] font-bold tracking-wide uppercase">
          © {new Date().getFullYear()} SiManTap. All rights reserved.
        </div>
      </aside>

      {/* RIGHT INTERACTIVE SLIDER SIDE */}
      <main className="w-full md:w-1/2 h-full flex items-center justify-center p-6 sm:p-8 bg-white md:rounded-l-[3rem] shadow-soft relative">
        
        {/* TOMBOL LEWATI (SKIP) */}
        {currentSlide < 3 && (
          <button
            onClick={handleSkip}
            className="absolute top-6 right-8 text-xs font-bold uppercase tracking-wider text-[#8A857F] hover:text-[#1E1E1E] bg-[#FAF6F0] hover:bg-[#111111]/5 py-2 px-3.5 rounded-xl transition-all duration-200 active:scale-95"
          >
            Lewati
          </button>
        )}

        <div className="max-w-sm w-full mx-auto flex flex-col items-center justify-center">
          
          {/* LOGO VERSI MOBILE - MERAPAT KE KIRI */}
          <div className="flex md:hidden items-center gap-1.5 mb-6">
            <img 
              src={LogoSiManTap} 
              alt="Logo SiManTap" 
              className="w-10 h-10 aspect-square object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)] select-none shrink-0" 
            />
            <span className="text-lg font-black text-[#1E1E1E] uppercase tracking-wider -ml-0.5">
              SiManTap
            </span>
          </div>

          {/* Feature Icon Container */}
          <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transition-colors duration-300 ${
            currentSlide === 0 ? 'bg-[#FEF0EE]' :
            currentSlide === 1 ? 'bg-[#FEF7EC]' :
            currentSlide === 2 ? 'bg-[#EEEDFB]' :
            'bg-[#E8FAF3]'
          }`}>
            {currentSlide === 0 && <Shield className="w-8 h-8 text-[#C05040]" />}
            {currentSlide === 1 && <CreditCard className="w-8 h-8 text-[#A05820]" />}
            {currentSlide === 2 && <BarChart2 className="w-8 h-8 text-[#5850C0]" />}
            {currentSlide === 3 && <ArrowRight className="w-8 h-8 text-[#208060]" />}
          </div>

          {/* Slide Content */}
          <div key={currentSlide} className="w-full text-center space-y-4 animate-fade-up">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase inline-block ${
              currentSlide === 0 ? 'bg-[#FEF0EE] text-[#C05040]' :
              currentSlide === 1 ? 'bg-[#FEF7EC] text-[#A05820]' :
              currentSlide === 2 ? 'bg-[#EEEDFB] text-[#5850C0]' :
              'bg-[#E8FAF3] text-[#208060]'
            }`}>
              {slide.tag}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1E1E] leading-tight whitespace-pre-line tracking-tight">
              {slide.title}
            </h2>

            <p className="text-sm text-[#8A857F] font-semibold leading-relaxed">
              {slide.desc}
            </p>

            {slide.roles && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {slide.roles.map((roleName, rIdx) => (
                  <span 
                    key={rIdx} 
                    className="bg-[#FAF6F0] text-[#1E1E1E] text-[10px] font-bold px-2 py-1 rounded-lg border border-[rgba(30,30,30,0.05)]"
                  >
                    {roleName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Slider Navigation Indicators */}
          <div className="flex gap-2 mt-8 mb-4 justify-center">
            {[0, 1, 2, 3].map(dotIdx => (
              <div
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                className={`cursor-pointer transition-all duration-300 ${
                  currentSlide === dotIdx 
                    ? 'w-6 h-2 bg-[#111111] rounded-full' 
                    : 'w-2 h-2 bg-gray-200 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Actions Button */}
          <div className="w-full">
            {currentSlide < 3 ? (
              <button
                onClick={handleNext}
                className="bg-[#111111] text-white w-full flex items-center justify-center gap-2 py-3.5 mt-6 rounded-2xl font-bold text-sm hover:bg-[#333] transition-all"
              >
                <span>Selanjutnya</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex flex-col w-full gap-3 mt-6">
                <button
                  onClick={() => navigate('/pilih-role')}
                  className="bg-[#111111] text-white w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm hover:bg-[#222222] transition-all duration-200 active:scale-[0.98] shadow-md"
                >
                  <span>Masuk ke Akun</span>
                  <ArrowRight size={16} />
                </button>
                
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-transparent text-[#1E1E1E] font-bold py-3.5 rounded-2xl border-2 border-[#111111]/10 hover:border-[#111111] hover:bg-[#111111]/5 text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
                >
                  Daftar sebagai Penghuni
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}