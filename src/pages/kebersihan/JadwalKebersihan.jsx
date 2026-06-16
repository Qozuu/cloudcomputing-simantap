import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function JadwalKebersihan() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Senin, 21 Apr',
    area: '',
    timeStart: '06:00',
    timeEnd: '08:00',
    team: 'Tim A'
  });
  const [successToast, setSuccessToast] = useState('');

  const getTeamBadgeClass = (team) => {
    switch (team) {
      case 'Tim A':
        return 'badge-pink';
      case 'Tim B':
        return 'badge-yellow';
      case 'Tim C':
        return 'badge-lavender';
      default:
        return 'badge-gray';
    }
  };

  const getDotColorClass = (team) => {
    switch (team) {
      case 'Tim A':
        return 'bg-pastel-pink';
      case 'Tim B':
        return 'bg-pastel-yellow';
      case 'Tim C':
        return 'bg-pastel-lavender';
      default:
        return 'bg-muted';
    }
  };

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
    return `${dayName}, ${day} ${monthsIndo[month - 1]}`;
  };

  const dayStrToDate = (dayStr) => {
    const mapping = {
      'Senin, 21 Apr': '2026-04-21',
      'Selasa, 22 Apr': '2026-04-22',
      'Rabu, 23 Apr': '2026-04-23',
      'Kamis, 24 Apr': '2026-04-24',
      'Jumat, 25 Apr': '2026-04-25',
      'Sabtu, 26 Apr': '2026-04-26',
      'Minggu, 27 Apr': '2026-04-27'
    };
    return mapping[dayStr] || dayStr;
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jadwal')
        .select('*, petugas:users(nama)')
        .eq('jenis', 'kebersihan')
        .order('tanggal');

      if (error) throw error;

      if (data) {
        const groups = {};
        data.forEach(item => {
          const dayName = dateToDayStr(item.tanggal);
          if (!groups[dayName]) {
            groups[dayName] = [];
          }
          groups[dayName].push({
            id: item.id,
            area: item.area || item.keterangan || 'Umum',
            time: item.waktu || '08:00-10:00',
            team: item.tim || 'Tim A',
            dotColor: getDotColorClass(item.tim || 'Tim A')
          });
        });

        const formatted = Object.keys(groups).map(day => ({
          day,
          items: groups[day]
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

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!formData.area.trim()) return;

    const timeRange = `${formData.timeStart}-${formData.timeEnd}`;
    
    try {
      const { error } = await supabase
        .from('jadwal')
        .insert({
          tanggal: dayStrToDate(formData.day),
          area: formData.area,
          waktu: timeRange,
          tim: formData.team,
          jenis: 'kebersihan'
        });

      if (error) throw error;

      setModalOpen(false);
      setSuccessToast(`Jadwal area "${formData.area}" berhasil ditambahkan!`);
      setTimeout(() => setSuccessToast(''), 3000);
      setFormData((prev) => ({ ...prev, area: '' }));
      loadSchedules();
    } catch (err) {
      console.error('Failed to insert schedule:', err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      {/* Page Header banner */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-ink mb-1">Informasi Kebersihan</h3>
          <p className="text-xs text-muted">
            Lihat jadwal kebersihan harian area apartemen Grand Surabaya minggu ini.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3.5 py-1.5 bg-pastel-lavender-bg rounded-full border border-pastel-lavender/30 text-xs font-bold text-[#4840B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pastel-lavender animate-pulse"></span>
            <span>Minggu Ini</span>
          </div>
        </div>
      </div>

      {/* Main card section */}
      <div className="card-section p-6">
        <div className="flex items-center justify-between pb-5 border-b border-soft mb-6">
          <div>
            <h2 className="text-base font-extrabold text-ink">Jadwal Kebersihan Minggu Ini</h2>
            <p className="text-xs text-muted">Jadwal area operasional & tugas lapangan</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Tambah Jadwal</span>
          </button>
        </div>

        {/* Weekly plain list grouped by date */}
        <div className="space-y-8">
          {schedules.map((group, idx) => (
            <div key={idx} className="space-y-3">
              {/* Day Heading */}
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2 bg-app-bg px-4 py-2.5 rounded-xl border border-soft">
                <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {group.day}
              </h4>

              {/* Area Item List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-1">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white border border-soft hover:border-ink/10 rounded-2xl transition duration-150 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${item.dotColor} flex-shrink-0`}></span>
                      <span className="text-xs font-bold text-ink">{item.area}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Time Range */}
                      <span className="text-[11px] font-medium text-muted bg-[#FAF6F0] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-soft">
                        <svg className="w-3 h-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.time}
                      </span>
                      
                      {/* Team badge */}
                      <span className={`badge-base ${getTeamBadgeClass(item.team)}`}>
                        {item.team}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tambah Jadwal Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Jadwal Kebersihan</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSchedule} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Hari / Tanggal</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Senin, 21 Apr">Senin, 21 Apr</option>
                  <option value="Selasa, 22 Apr">Selasa, 22 Apr</option>
                  <option value="Rabu, 23 Apr">Rabu, 23 Apr</option>
                  <option value="Kamis, 24 Apr">Kamis, 24 Apr</option>
                  <option value="Jumat, 25 Apr">Jumat, 25 Apr</option>
                  <option value="Sabtu, 26 Apr">Sabtu, 26 Apr</option>
                  <option value="Minggu, 27 Apr">Minggu, 27 Apr</option>
                </select>
              </div>

              <div>
                <label className="label-modern">Area Kebersihan</label>
                <input
                  type="text"
                  name="area"
                  required
                  placeholder="Contoh: Lobby Utama Tower B"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="input-modern font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Jam Mulai</label>
                  <input
                    type="text"
                    name="timeStart"
                    required
                    placeholder="08:00"
                    value={formData.timeStart}
                    onChange={handleInputChange}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Jam Selesai</label>
                  <input
                    type="text"
                    name="timeEnd"
                    required
                    placeholder="10:00"
                    value={formData.timeEnd}
                    onChange={handleInputChange}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Tim Bertugas</label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="select-modern input-modern font-semibold"
                >
                  <option value="Tim A">Tim A (Pastel Pink)</option>
                  <option value="Tim B">Tim B (Pastel Yellow)</option>
                  <option value="Tim C">Tim C (Pastel Lavender)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  <span>✓ Simpan Jadwal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 btn-ghost justify-center py-2.5 rounded-xl text-xs font-bold"
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
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
