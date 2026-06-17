import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ROLE_ROUTES, ROLE_MAP_REVERSE } from '../../utils/authSession';
import { Bell, ArrowLeft, AlertTriangle, Info, Tag, BookOpen } from 'lucide-react';

const CAT_CONFIG = {
  darurat: {
    bg: 'bg-[#FEF0EE]',
    color: 'text-[#C05040]',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-[#EEEDFB]',
    color: 'text-[#4840B0]',
    icon: Info,
  },
  promo: {
    bg: 'bg-[#FEF7EC]',
    color: 'text-[#A05820]',
    icon: Tag,
  },
  peraturan: {
    bg: 'bg-[#E8FAF3]',
    color: 'text-[#187050]',
    icon: BookOpen,
  },
  default: {
    bg: 'bg-[#F0EDE8]',
    color: 'text-[#8A857F]',
    icon: Bell,
  }
};

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');

  function formatTimeAgo(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Baru saja';
    if (mins < 60)  return `${mins} mnt lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  }

  useEffect(() => {
    async function loadNotifications() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user's DB role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const dbRole = profile?.role || 'penghuni';

        // Fetch notifications relevant to this role (no limit)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_active', true)
          .or(`target_role.eq.all,target_role.eq.${dbRole}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map(item => ({
          id:       item.id,
          category: item.category,
          title:    item.title,
          desc:     item.message,
          time:     formatTimeAgo(item.created_at),
          read:     false,
        }));

        setNotifications(mapped);
      } catch (err) {
        console.error('Gagal memuat notifikasi:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleBack = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      const frontRole = ROLE_MAP_REVERSE[profile?.role] || 'penghuni';
      navigate(ROLE_ROUTES[frontRole] || '/');
    } catch (err) {
      navigate('/');
    }
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Semua') return true;
    return n.category?.toLowerCase() === filter.toLowerCase();
  });

  const tabs = ['Semua', 'Darurat', 'Info', 'Promo', 'Peraturan'];

  return (
    <div className="min-h-screen bg-[#FAF6F0] w-full font-sans select-none">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Header Row */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft size={18} className="text-[#1E1E1E]" />
            </button>
            <h1 className="text-2xl font-black text-[#1E1E1E] tracking-tight">Semua Notifikasi</h1>
          </div>
          {unreadCount > 0 && (
            <span className="bg-[#FEF0EE] text-[#C05040] text-xs font-black px-2.5 py-1 rounded-full border border-[#F9C3BA]/50">
              {unreadCount} Belum Dibaca
            </span>
          )}
        </header>

        {/* Filter Tabs Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {tabs.map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#1E1E1E] text-white rounded-full'
                    : 'bg-white text-[#8A857F] border border-gray-100 rounded-full hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <main>
          {loading ? (
            // Skeleton Loader State
            <div className="space-y-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white rounded-3xl p-4 border border-gray-100/50 flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center border border-gray-100 shadow-sm mb-4">
                <Bell size={28} className="text-[#8A857F]/30" />
              </div>
              <p className="text-[#8A857F] font-bold">Tidak ada notifikasi</p>
              <p className="text-xs text-[#8A857F]/75 mt-1">Belum ada pemberitahuan baru di kategori ini.</p>
            </div>
          ) : (
            // Active Notifications List
            <div className="space-y-3">
              {filteredNotifications.map((n) => {
                const conf = CAT_CONFIG[n.category?.toLowerCase()] || CAT_CONFIG.default;
                const IconComponent = conf.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`bg-white hover:bg-[#FAF6F0]/20 rounded-3xl p-4 border border-gray-100/60 shadow-sm transition-all duration-200 cursor-pointer flex gap-4 items-start relative ${
                      !n.read ? 'border-l-4 border-l-[#C05040]' : ''
                    }`}
                  >
                    {/* Icon Container */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${conf.bg}`}>
                      <IconComponent size={18} className={conf.color} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className={`text-sm text-[#1E1E1E] leading-snug truncate ${!n.read ? 'font-black' : 'font-bold'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-[#8A857F] mt-1 leading-relaxed">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-[#8A857F]/60 mt-2 block font-semibold">
                        {n.time}
                      </span>
                    </div>

                    {/* Unread Red Circle Marker */}
                    {!n.read && (
                      <span className="w-2.5 h-2.5 bg-[#C05040] rounded-full shrink-0 absolute right-4 top-5 shadow-sm shadow-[#C05040]/30 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
