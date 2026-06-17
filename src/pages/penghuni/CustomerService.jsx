import React from 'react';
import { 
  MessageSquare, 
  Wrench, 
  Wallet, 
  CalendarDays, 
  ArrowUpRight 
} from 'lucide-react';

export default function KontakPengelola() {
  // Nomor WA resmi pengelola
  const NO_WHATSAPP = '6288975285486'; 

  // Fungsi helper dengan tautan API resmi agar teks otomatis langsung terisi di kolom chat
  const handleRedirectWA = (kategori) => {
    let text = `Halo Admin SiManTap, saya penghuni unit ________. Ingin bertanya mengenai hal tersebut.`;
    
    if (kategori === 'Perbaikan & Kerusakan Teknisi') {
      text = `Halo Admin Perbaikan SiManTap, saya ingin berkonsultasi mengenai adanya kerusakan fisik di unit saya.`;
    } else if (kategori === 'Keuangan & Tagihan IPL') {
      text = `Halo Admin Keuangan SiManTap, saya ingin menanyakan perihal rincian billing tagihan / konfirmasi pembayaran IPL.`;
    } else if (kategori === 'Reservasi Fasilitas') {
      text = `Halo Admin Fasilitas SiManTap, saya ingin mengonfirmasi jadwal atau bertanya seputar reservasi fasilitas gedung.`;
    }

    // Menggunakan domain api.whatsapp.com agar teks terinjeksi langsung di kolom input chat
    const url = `https://api.whatsapp.com/send/?phone=${NO_WHATSAPP}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-up text-zinc-800 max-w-4xl mx-auto">
      
      {/* Banner Utama */}
      <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-400">
            <MessageSquare size={16} className="text-zinc-500" />
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              Hubungi Layanan Pengelola
            </h3>
          </div>
          <p className="text-zinc-500 text-[11px] font-medium max-w-xl">
            Untuk efisiensi dan respons cepat, seluruh layanan pengaduan, konfirmasi administrasi, dan tanya jawab dialihkan langsung menuju WhatsApp Official Gedung.
          </p>
        </div>
        
        {/* Tombol Utama */}
        <button 
          onClick={() => handleRedirectWA('Umum')}
          className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
        >
          <span>WhatsApp Pusat (Umum)</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Grid Pilihan Kategori */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
          Pilih Jalur Pengaduan Spesifik
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Kerusakan */}
          <div 
            onClick={() => handleRedirectWA('Perbaikan & Kerusakan Teknisi')}
            className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 rounded-2xl shadow-sm flex flex-col justify-between gap-6 cursor-pointer group transition duration-150"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                <Wrench size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">
                  Pemeliharaan & Kerusakan
                </h4>
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mt-1">
                  Laporan kendala pipa bocor, kelistrikan koridor, kerusakan unit, atau kebutuhan teknisi.
                </p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Hubungi Pemeliharaan <ArrowUpRight size={11} />
            </div>
          </div>

          {/* Card 2: Keuangan */}
          <div 
            onClick={() => handleRedirectWA('Keuangan & Tagihan IPL')}
            className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 rounded-2xl shadow-sm flex flex-col justify-between gap-6 cursor-pointer group transition duration-150"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                <Wallet size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">
                  Keuangan & Tagihan
                </h4>
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mt-1">
                  Konfirmasi manual bukti bayar, pertanyaan denda, rincian billing, atau tunggakan IPL.
                </p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Hubungi Finance <ArrowUpRight size={11} />
            </div>
          </div>

          {/* Card 3: Reservasi */}
          <div 
            onClick={() => handleRedirectWA('Reservasi Fasilitas')}
            className="p-5 bg-white border border-zinc-100 hover:border-zinc-300 rounded-2xl shadow-sm flex flex-col justify-between gap-6 cursor-pointer group transition duration-150"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
                <CalendarDays size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">
                  Reservasi & Fasilitas
                </h4>
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mt-1">
                  Pengecekan slot jadwal kosong aula, izin penggunaan fasilitas bersama, atau pembatalan sewa.
                </p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 group-hover:text-zinc-900 transition-colors">
              Hubungi Admin Fasilitas <ArrowUpRight size={11} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}