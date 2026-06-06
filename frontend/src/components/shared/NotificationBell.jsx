import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahan ini
import { Bell, X, CheckCheck, AlertTriangle, Info, Wrench, CreditCard } from 'lucide-react';

const MOCK_NOTIFS = [
  { id: 1, type: 'urgent',  icon: AlertTriangle, title: 'Tiket Urgent Baru', desc: 'AC bocor di Unit 18C perlu ditangani segera.', time: '5 mnt lalu', read: false },
  { id: 2, type: 'info',    icon: Info,          title: 'Pengumuman Baru', desc: 'Kolam renang kembali dibuka mulai besok.', time: '1 jam lalu', read: false },
  { id: 3, type: 'billing', icon: CreditCard,    title: 'Tagihan Dikonfirmasi', desc: 'Pembayaran IPL Unit 12A April 2026 berhasil.', time: '2 jam lalu', read: false },
  { id: 4, type: 'repair',  icon: Wrench,        title: 'Tiket Selesai', desc: 'Kran kamar mandi Unit 07A sudah diperbaiki.', time: 'Kemarin', read: true },
  { id: 5, type: 'info',    icon: Info,          title: 'Jadwal Kebersihan', desc: 'Jadwal cleaning minggu ini telah diperbarui.', time: 'Kemarin', read: true },
];

const TYPE_STYLES = {
  urgent:  { bg: 'bg-[#FEF0EE]', color: 'text-[#C05040]' },
  info:    { bg: 'bg-[#EEEDFB]', color: 'text-[#4840B0]' },
  billing: { bg: 'bg-[#E8FAF3]', color: 'text-[#187050]' },
  repair:  { bg: 'bg-[#FEF7EC]', color: 'text-[#A05820]' },
};

export default function NotificationBell() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const ref = useRef(null);
  const navigate = useNavigate(); // Inisialisasi navigate

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss     = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="hover:bg-gray-100"
        style={{
          position: 'relative',
          width: 36, height: 36,
          borderRadius: 10,
          border: '1.5px solid rgba(30,30,30,0.1)',
          background: open ? '#F0EDE8' : '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        <Bell size={16} color="#8A857F" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: '#F9C3BA',
            border: '1.5px solid white',
          }} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 340, background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid rgba(30,30,30,0.08)',
          boxShadow: '0 12px 32px rgba(30,30,30,0.12)',
          zIndex: 999,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(30,30,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1E1E1E' }}>Notifikasi</span>
            <button onClick={markAllRead} style={{ fontSize: 11, fontWeight: 700, color: '#8A857F', background: 'none', border: 'none', cursor: 'pointer' }}>
              Tandai semua dibaca
            </button>
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifs.map(n => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              const Icon = n.icon;
              return (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ display: 'flex', padding: '12px 14px', background: n.read ? '#FFFFFF' : '#FAF6F0', borderBottom: '1px solid rgba(30,30,30,0.05)', cursor: 'pointer' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }} className={s.bg}>
                    <Icon size={15} className={s.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.read ? 600 : 800 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: '#8A857F' }}>{n.desc}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} style={{ background: 'none', border: 'none', color: '#C8C2BC' }}><X size={12} /></button>
                </div>
              );
            })}
          </div>

          {/* Tombol Lihat Semua yang sekarang Fungsional */}
          <div style={{ padding: '10px', borderTop: '1px solid rgba(30,30,30,0.07)' }}>
            <button 
              onClick={() => { navigate('/superadmin/notifikasi'); setOpen(false); }}
              className="w-full py-2 text-[12px] font-bold text-[#8A857F] hover:text-[#1E1E1E] transition-colors"
            >
              Lihat semua notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}