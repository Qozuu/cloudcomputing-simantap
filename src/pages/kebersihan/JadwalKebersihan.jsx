import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function JadwalKebersihan() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Fungsi helper presisi mengambil tanggal lokal komputer (WIB) berformat YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // State Form dengan tanggal default hari ini
  const [formData, setFormData] = useState({
    day: getTodayDateString(), 
    area: '',
    timeStart: '06:00',
    timeEnd: '11:00',
    team: 'Tim A (Supri & Slamet)'
  });
  const [successToast, setSuccessToast] = useState('');

  const getTeamBadgeClass = (team) => {
    if (/Tim A/i.test(team)) return 'badge-pink text-pink-900 font-extrabold';
    if (/Tim B/i.test(team)) return 'badge-yellow text-amber-950 font-extrabold';
    if (/Tim C/i.test(team)) return 'badge-lavender text-purple-950 font-extrabold';
    return 'badge-gray text-slate-900 font-extrabold';
  };

  const getDotColorClass = (team) => {
    if (/Tim A/i.test(team)) return 'bg-pink-600';
    if (/Tim B/i.test(team)) return 'bg-amber-600';
    if (/Tim C/i.test(team)) return 'bg-purple-600';
    return 'bg-slate-600';
  };

  // Mengubah YYYY-MM-DD menjadi teks lokal Indonesia (Contoh: Rabu, 17 Jun)
  const dateToDayStr = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = new Date(year, month - 1, day);
    const dayName = days[d.getDay()];
    
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) {
      return `Hari Ini, ${day} ${monthsIndo[month - 1]}`;
    }
    
    return `${dayName}, ${day} ${monthsIndo[month - 1]}`;
  };

  const getShiftFromTime = (timeStart) => {
    const hour = parseInt(timeStart.split(':')[0]);
    if (isNaN(hour) || hour < 12) return 'pagi';
    if (hour >= 12 && hour < 18) return 'siang';
    return 'malam';
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jadwal')
        .select('*, petugas:users(nama)')
        .eq('jenis', 'kebersihan');

      if (error) throw error;

      if (data) {
        const todayStr = getTodayDateString();

        // KRUSIAL: Filter HANYA mengambil data hari ini dan esok-esoknya saja (Abaikan masa lalu)
        const activeSchedules = data.filter(item => item.tanggal >= todayStr);
        
        // Urutkan dari tanggal paling dekat ke paling jauh
        activeSchedules.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

        const groups = {};
        activeSchedules.forEach(item => {
          const dayName = dateToDayStr(item.tanggal);
          if (!groups[dayName]) {
            groups[dayName] = [];
          }

          let timeDisplay = '08:00-10:00';
          if (item.shift === 'pagi') timeDisplay = '06:00-11:00';
          else if (item.shift === 'siang') timeDisplay = '12:00-17:00';
          else if (item.shift === 'malam') timeDisplay = '18:00-22:00';

          const teamDisplay = item.catatan || 'Tim A';

          groups[dayName].push({
            id: item.id,
            area: item.area || 'Umum',
            time: timeDisplay,
            team: teamDisplay,
            dotColor: getDotColorClass(teamDisplay)
          });
        });

        // Tandai grup mana yang berstatus "Hari Ini"
        const formatted = Object.keys(groups).map(day => ({
          day,
          items: groups[day],
          isToday: day.includes('Hari Ini')
        }));
        
        setSchedules(formatted);
      }
    } catch (err) {
      console.error('Failed to load schedules:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModalWithCurrentDate = () => {
    setFormData((prev) => ({
      ...prev,
      day: getTodayDateString(),
      area: ''
    }));
    setModalOpen(true);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!formData.area.trim()) return;

    try {
      let { data: { user } } = await supabase.auth.getUser();
      let activeAdminId = user?.id;

      if (!activeAdminId) {
        const { data: firstAdmin } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin_kebersihan')
          .limit(1)
          .single();
        
        activeAdminId = firstAdmin?.id;
      }

      const computedShift = getShiftFromTime(formData.timeStart);

      const { error } = await supabase
        .from('jadwal')
        .insert({
          petugas_id: activeAdminId,
          tanggal: formData.day,
          area: formData.area,
          shift: computedShift,
          catatan: formData.team,
          jenis: 'kebersihan',
          status: 'terjadwal'
        });

      if (error) throw error;

      setModalOpen(false);
      setSuccessToast(`Jadwal area "${formData.area}" berhasil disimpan!`);
      setTimeout(() => setSuccessToast(''), 3000);
      loadSchedules();
    } catch (err) {
      console.error('Failed to insert schedule:', err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-950 font-black text-sm">Memuat data operasional...</div>;
  }

  // Cek apakah ada jadwal mendatang (setelah Hari Ini) untuk menentukan posisi pembatas
  const hasFutureSchedules = schedules.some(g => !g.isToday);

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Page Header banner */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-300">
        <div>
          <h3 className="text-xl font-black text-slate-950 mb-1">Informasi Kebersihan</h3>
          <p className="text-xs text-slate-800 font-bold">
            Sistem pengaturan rotasi dan urutan tugas kerja kebersihan harian gedung.
          </p>
        </div>
      </div>

      {/* Main card section */}
      <div className="card-section p-6 bg-white border border-slate-300">
        <div className="flex items-center justify-between pb-5 border-b border-slate-300 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-950">Urutan Tugas Kerja</h2>
            <p className="text-xs text-slate-800 font-bold">Menampilkan jadwal shift aktif saat ini</p>
          </div>
          <button
            onClick={openModalWithCurrentDate}
            className="btn-primary py-2.5 px-4 text-xs font-black bg-slate-950 text-white border border-slate-950 hover:bg-slate-900 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Jadwal</span>
          </button>
        </div>

        {/* List Tugas Terurut */}
        <div className="space-y-8">
          {schedules.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl">
              <p className="text-xs font-bold text-slate-500">Belum ada jadwal tugas aktif di database.</p>
            </div>
          ) : (
            schedules.map((group, idx) => {
              // Cek jika grup ini adalah awal dari jadwal mendatang, maka munculkan pembatas di atasnya
              const showFutureDivider = !group.isToday && idx > 0 && schedules[idx - 1].isToday;

              return (
                <React.Fragment key={idx}>
                  {/* PEMBATAS ANTARA HARI INI DAN JADWAL AKAN DATANG */}
                  {showFutureDivider && (
                    <div className="relative py-6 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-slate-300"></div>
                      </div>
                      <div className="relative bg-white px-4 flex items-center gap-2 text-slate-500 border border-slate-300 rounded-full py-1 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Jadwal Yang Akan Datang</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Day Heading */}
                    <h4 className={`text-xs font-black uppercase tracking-wider flex items-center justify-between px-4 py-2.5 rounded-xl border-2 ${group.isToday ? 'text-slate-950 border-slate-950 bg-slate-100 shadow-sm' : 'text-slate-700 border-slate-300 bg-slate-50'}`}>
                      <span className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                        {group.day}
                      </span>
                      {group.isToday && <span className="text-[10px] bg-emerald-600 px-2.5 py-0.5 rounded-md font-black text-white animate-pulse">Live Shift</span>}
                    </h4>

                    {/* Area Item List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-1">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-white border-2 border-slate-300 hover:border-slate-600 rounded-2xl transition duration-150 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-3.5 h-3.5 rounded-full ${item.dotColor} flex-shrink-0 border border-black/10`}></span>
                            <span className="text-xs font-black text-slate-950">{item.area}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-400">
                              <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.time}
                            </span>
                            <span className={`badge-base ${getTeamBadgeClass(item.team)} border`}>
                              {item.team}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Tambah Jadwal Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box border-2 border-slate-950">
            <div className="modal-header">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tambah Jadwal Kebersihan</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-950 hover:text-black transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="modal-body space-y-4">
              <div>
                <label className="label-modern text-slate-950 font-black">Hari / Tanggal</label>
                <input
                  type="date"
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-950 focus:border-slate-950 transition-colors shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="label-modern text-slate-950 font-black">Area Kebersihan</label>
                <input
                  type="text"
                  name="area"
                  required
                  placeholder="Contoh: Lobby Utama Tower B"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="input-modern font-black text-slate-950 border-2 border-slate-400 focus:border-slate-950 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern text-slate-950 font-black">Jam Mulai</label>
                  <input
                    type="text"
                    name="timeStart"
                    required
                    placeholder="06:00"
                    value={formData.timeStart}
                    onChange={handleInputChange}
                    className="input-modern font-black text-slate-950 border-2 border-slate-400 focus:border-slate-950 bg-white"
                  />
                </div>
                <div>
                  <label className="label-modern text-slate-950 font-black">Jam Selesai</label>
                  <input
                    type="text"
                    name="timeEnd"
                    required
                    placeholder="11:00"
                    value={formData.timeEnd}
                    onChange={handleInputChange}
                    className="input-modern font-black text-slate-950 border-2 border-slate-400 focus:border-slate-950 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern text-slate-950 font-black">Petugas / Tim Lapangan</label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="select-modern input-modern font-black text-slate-950 border-2 border-slate-400 focus:border-slate-950 bg-white"
                >
                  <option value="Tim A (Supri & Slamet)">Tim A (Supri & Slamet) - Pagi</option>
                  <option value="Tim A (Agus & Dani)">Tim A (Agus & Dani) - Pagi</option>
                  <option value="Tim B (Siti & Roni)">Tim B (Siti & Roni) - Siang</option>
                  <option value="Tim B (Dewi & Lestari)">Tim B (Dewi & Lestari) - Siang</option>
                  <option value="Tim C (Joko & Budi)">Tim C (Joko & Budi) - Malam</option>
                  <option value="Tim C (Hendro & Tono)">Tim C (Hendro & Tono) - Malam</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-300">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-black bg-slate-950 text-white hover:bg-slate-900 transition-colors"
                >
                  <span>✓ Simpan Jadwal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-black text-slate-950 border-2 border-slate-400 hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="toast-modern toast-success bg-slate-950 border border-slate-800 text-white">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}