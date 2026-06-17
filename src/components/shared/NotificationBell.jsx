import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, AlertTriangle, Info, Wrench, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TYPE_STYLES = {
  urgent:  { bg: 'bg-[#FEF0EE]', color: 'text-[#C05040]' },
  info:    { bg: 'bg-[#EEEDFB]', color: 'text-[#4840B0]' },
  billing: { bg: 'bg-[#E8FAF3]', color: 'text-[#187050]' },
  repair:  { bg: 'bg-[#FEF7EC]', color: 'text-[#A05820]' },
};

export default function NotificationBell() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil data DB role dari tabel 'users'
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const dbRole = userProfile?.role || 'penghuni';

      // 2. Ambil data tower dari tabel 'penghuni' (Hanya select kolom 'tower' agar terhindar dari bad request 400 kolom dimensi_luas)
      const { data: tenantProfile } = await supabase
        .from('penghuni')
        .select('tower')
        .eq('user_id', user.id)
        .maybeSingle();

      const towerPenghuni = tenantProfile?.tower || 'Semua';

      // 3. Ambil seluruh data dari tabel 'notifications' (Pakai 's' sesuai dengan skema database asli)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Gagal mengambil tabel notifications:", error.message);
        return;
      }

      // 4. Lakukan penyaringan data (Filter) berdasarkan kecocokan target_tower di sisi frontend
      const filteredData = (data || []).filter(item => {
        return (
          item.target_tower === 'Semua Penghuni' || 
          item.target_tower === towerPenghuni
        );
      });

      const categoryMap = {
        darurat: 'urgent',
        info: 'info',
        promo: 'billing',
        peraturan: 'repair'
      };

      // Map data database ke dalam format state tampilan notifikasi
      const mapped = filteredData.map(item => ({
        id:    item.id,
        type:  categoryMap[item.category?.toLowerCase()] || 'info',
        title: item.title,
        desc:  item.message,
        time:  formatTimeAgo(item.created_at),
        read:  false,
      }));

      setNotifs(mapped);
    }

    fetchNotifications();

    // Realtime Channel: Mendengarkan perubahan data baru pada tabel 'notifications'
    const channel = supabase
      .channel('notif-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' }, // ◄ Disamakan menjadi 'notifications'
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: userProfile } = await supabase
            .from('users').select('role').eq('id', user.id).single();
          const dbRole = userProfile?.role || 'penghuni';

          const { data: tenantProfile } = await supabase
            .from('penghuni').select('tower').eq('user_id', user.id).maybeSingle();
          const towerPenghuni = tenantProfile?.tower || 'Semua';

          // Ambil properti dari data payload baru yang masuk
          const newTargetTower = payload.new.target_tower;
          const newTargetRole = payload.new.target_role;

          const matchTower = newTargetTower === 'Semua Penghuni' || newTargetTower === towerPenghuni;
          const matchRole = !newTargetRole || newTargetRole === 'all' || newTargetRole === dbRole;

          if (matchTower && matchRole) {
            const categoryMap = {
              darurat: 'urgent',
              info: 'info',
              promo: 'billing',
              peraturan: 'repair'
            };
            setNotifs(prev => [{
              id:    payload.new.id,
              type:  categoryMap[payload.new.category?.toLowerCase()] || 'info',
              title: payload.new.title,
              desc:  payload.new.message,
              time:  'Baru saja',
              read:  false,
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function formatTimeAgo(dateString) {
    if (!dateString) return 'Baru saja';
    const diff = Date.now() - new Date(dateString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Baru saja';
    if (mins < 60)  return `${mins} mnt lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  }

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
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(30,30,30,0.07)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1E1E1E' }}>Notifikasi</span>
            <button onClick={markAllRead} style={{ fontSize: 11, fontWeight: 700, color: '#8A857F', background: 'none', border: 'none', cursor: 'pointer' }}>
              Tandai semua dibaca
            </button>
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifs.map(n => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              const Icon = n.type === 'urgent' ? AlertTriangle : n.type === 'billing' ? CreditCard : n.type === 'repair' ? Wrench : Info;
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

            {notifs.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: 11, color: '#8A857F', fontWeight: 600 }}>
                Tidak ada notifikasi baru untuk tower Anda.
              </div>
            )}
          </div>

          {/* Tombol Lihat Semua */}
          <div style={{ padding: '10px', borderTop: '1px solid rgba(30,30,30,0.07)' }}>
            <div 
              onClick={() => { setOpen(false); navigate('/notifikasi'); }}
              style={{ cursor: 'pointer' }}
              className="w-full py-2 text-[12px] font-bold text-[#8A857F] hover:text-[#1E1E1E] transition-colors text-center"
            >
              Lihat semua notifikasi
            </div>
          </div>
        </div>
      )}
    </div>
  );
}