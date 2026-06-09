import React from 'react';
import {
  PhoneCall,
  Clock,
  BookOpen,
  Wrench,
  Wallet,
  Car,
  Info
} from 'lucide-react';

export default function PusatInformasi() {
  const cards = [
    {
      icon: PhoneCall,
      title: 'Kontak Darurat',
      content: (
        <ul className="space-y-1">
          <li><span className="font-bold text-active">Satpam:</span> ext. 100</li>
          <li><span className="font-bold text-active">PMK:</span> 113</li>
          <li><span className="font-bold text-active">Ambulans:</span> 118</li>
          <li><span className="font-bold text-active">Pengelola:</span> 081-1234-5678</li>
        </ul>
      )
    },
    {
      icon: Clock,
      title: 'Jam Operasional Fasilitas',
      content: (
        <ul className="space-y-1">
          <li><span className="font-bold text-active">Kolam Renang:</span> 06:00-21:00</li>
          <li><span className="font-bold text-active">Gym:</span> 05:00-22:00</li>
          <li><span className="font-bold text-active">Ruang Serbaguna:</span> 08:00-22:00</li>
        </ul>
      )
    },
    {
      icon: BookOpen,
      title: 'Peraturan Apartemen',
      content: (
        <ul className="space-y-1">
          <li>⚠️ <span className="font-bold text-active">Jam tenang:</span> 22:00-06:00</li>
          <li>🚭 Dilarang merokok di area dalam</li>
          <li>🗑️ Sampah di TPS lantai 1</li>
        </ul>
      )
    },
    {
      icon: Wrench,
      title: 'Laporan Kerusakan',
      content: (
        <p className="leading-relaxed">
          Gunakan fitur <span className="font-bold text-active">E-Reporting</span> di aplikasi atau hubungi admin pemeliharaan apartemen di <span className="font-bold text-active">ext. 102</span>.
        </p>
      )
    },
    {
      icon: Wallet,
      title: 'Pembayaran IPL',
      content: (
        <p className="leading-relaxed">
          Transfer to <span className="font-bold text-active">BCA 1234567890</span> a.n PT Pengelola Apartemen, or scan QRIS via <span className="font-bold text-active">GoPay/OVO/DANA</span>.
        </p>
      )
    },
    {
      icon: Car,
      title: 'Informasi Parkir',
      content: (
        <ul className="space-y-1">
          <li>🚗 <span className="font-bold text-active">Slot tersedia:</span> 260</li>
          <li>💵 <span className="font-bold text-active">Tarif tamu:</span> Rp 10.000/jam</li>
          <li>📄 Daftar stiker parkir di kantor pengelola</li>
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Visual Info Grid */}
      <div className="card-section p-6 space-y-6">
        <div className="border-b border-soft pb-4 flex items-center gap-1.5">
          <Info className="text-muted" size={18} />
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
            Pusat Informasi Apartemen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            
            const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
            const cardClass = cardColors[idx % 4];
            
            const iconColors = ['card-icon-pink', 'card-icon-yellow', 'card-icon-lavender', 'card-icon-mint'];
            const iconClass = iconColors[idx % 4];

            return (
              <div
                key={idx}
                className={`${cardClass} hover:shadow-soft transition-all duration-200 flex flex-col gap-4`}
              >
                {/* Icon top */}
                <div className={`${iconClass} shadow-sm`}>
                  <IconComponent size={20} className="stroke-[2.5]" />
                </div>
                
                {/* Title & Content */}
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-[#1E1E1E] leading-snug">
                    {card.title}
                  </h4>
                  <div className="text-xs text-[#8A857F] font-semibold leading-relaxed">
                    {card.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
