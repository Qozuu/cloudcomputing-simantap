import { useState, useRef, useEffect } from 'react';
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

  const unreadCount = notifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss     = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          position: 'relative',
          width: 36, height: 36,
          borderRadius: 10,
          border: '1.5px solid rgba(30,30,30,0.1)',
          background: open ? '#F0EDE8' : '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
        aria-label="Notifikasi"
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
          animation: 'fadeUp 0.2s ease',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(30,30,30,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1E1E1E' }}>Notifikasi</span>
              {unreadCount > 0 && (
                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, background: '#FEF0EE', color: '#B85040', padding: '2px 8px', borderRadius: 99 }}>
                  {unreadCount} baru
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#8A857F', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
            >
              <CheckCheck size={13} />
              Tandai semua dibaca
            </button>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#C8C2BC', fontSize: 13, fontWeight: 600 }}>
                Tidak ada notifikasi
              </div>
            ) : notifs.map(n => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11,
                    padding: '12px 14px',
                    background: n.read ? '#FFFFFF' : '#FAF6F0',
                    borderBottom: '1px solid rgba(30,30,30,0.05)',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F1EB'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? '#FFFFFF' : '#FAF6F0'}
                >
                  {/* Icon */}
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={`${s.bg}`}>
                    <Icon size={15} className={s.color} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.read ? 600 : 800, color: '#1E1E1E', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11.5, color: '#8A857F', fontWeight: 500, lineHeight: 1.45 }}>{n.desc}</div>
                    <div style={{ fontSize: 10.5, color: '#C8C2BC', fontWeight: 600, marginTop: 4 }}>{n.time}</div>
                  </div>

                  {/* Unread dot + dismiss */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F9C3BA' }} />}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#C8C2BC', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#B85040'}
                      onMouseLeave={e => e.currentTarget.style.color = '#C8C2BC'}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(30,30,30,0.07)', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8A857F', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = '#1E1E1E'}
                onMouseLeave={e => e.currentTarget.style.color = '#8A857F'}
              >
                Lihat semua notifikasi
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
