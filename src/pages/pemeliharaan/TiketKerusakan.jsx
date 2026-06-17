import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TiketKerusakan() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // State untuk Daftar Unit Valid dari Database
  const [availableUnits, setAvailableUnits] = useState([]);

  // State untuk Pop-up Input Tiket Baru Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUnitId, setNewUnitId] = useState(''); // Menyimpan ID unit (UUID)
  const [newCategory, setNewCategory] = useState('lainnya');

  // State untuk Pop-up Input Catatan Penyelesaian
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Fetch data tiket dan data unit saat komponen pertama kali dibuka
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);

        // 1. Tarik data laporan dan relasi nomor unitnya
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('laporan')
          .select('*, unit(nomor_unit, tower(nama_tower))')
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;

        // 2. Tarik data seluruh unit resmi (disesuaikan dengan skema DDL public.unit)
        const { data: unitsData, error: unitsError } = await supabase
          .from('unit')
          .select('id, nomor_unit')
          .order('nomor_unit', { ascending: true });

        // JIKA ERROR SAAT AMBIL UNIT, LANGSUNG MUNCULKAN ALERT DETEKTIF
        if (unitsError) {
          console.error("Gagal mengambil data unit dari database:", unitsError.message);
          alert("Gagal memuat daftar unit: " + unitsError.message + "\nPeriksa apakah RLS tabel 'unit' sudah di-enable access.");
          throw unitsError;
        }

        // Set state data unit valid
        if (unitsData) {
          console.log("Data unit berhasil dimuat:", unitsData);
          setAvailableUnits(unitsData);
        }

        // Mapping data tiket untuk tampilan UI
        if (ticketsData) {
          const mapped = ticketsData.map(ticket => ({
            id: String(ticket.id),
            title: ticket.judul || ticket.deskripsi || 'Tidak ada judul',
            unit: ticket.unit?.nomor_unit ? `Unit ${ticket.unit.nomor_unit}` : 'Umum/Area Publik',
            date: new Date(ticket.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            status: ticket.status === 'selesai' || ticket.status === 'Selesai' ? 'Selesai' : 'Proses',
            catatan_teknisi: ticket.catatan_teknisi || null
          }));
          setTickets(mapped);
        }
      } catch (err) {
        console.error('Error loading data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // Pemicu membuka modal konfirmasi selesai
  const openMarkDoneModal = (id) => {
    setSelectedTicketId(id);
    setAdminNote(''); 
    setIsDoneModalOpen(true);
  };

  // Fungsi menyimpan catatan & menyelesaikan tiket
  const handleMarkDoneSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    try {
      const { error } = await supabase
        .from('laporan')
        .update({ 
          status: 'selesai', 
          catatan_teknisi: adminNote, 
          updated_at: new Date() 
        })
        .eq('id', selectedTicketId);

      if (error) throw error;

      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === selectedTicketId ? { ...ticket, status: 'Selesai', catatan_teknisi: adminNote } : ticket
        )
      );
      
      setIsDoneModalOpen(false);
      setSelectedTicketId(null);
      alert("Tiket berhasil diselesaikan!");
    } catch (err) {
      console.error('Error updating ticket status:', err.message);
      alert('Gagal menyelesaikan tiket: ' + err.message);
    }
  };

  // Fungsi membuat tiket baru
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Sesi Anda berakhir. Silakan login kembali.");
        return;
      }
      
      const pelaporId = user.id;

      // Ambil data kiriman sesuai format data public.laporan kamu
      const { data: insertedData, error: insertError } = await supabase
        .from('laporan')
        .insert({
          judul: newTitle,
          deskripsi: newTitle,
          unit_id: newUnitId || null, // Jika kosong, otomatis masuk area umum (NULL diizinkan di skema DDL-mu)
          pelapor_id: pelaporId,
          kategori: newCategory,
          status: 'menunggu' // Menggunakan DEFAULT 'menunggu' sesuai check constraint DDL kamu
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;

      if (insertedData) {
        const selectedUnitText = availableUnits.find(u => u.id === newUnitId)?.nomor_unit;

        const formattedDate = new Date(insertedData.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        const newTicket = {
          id: String(insertedData.id),
          title: insertedData.judul || 'Tidak ada judul',
          unit: newUnitId ? `Unit ${selectedUnitText}` : 'Umum/Area Publik',
          date: formattedDate,
          status: 'Proses',
          catatan_teknisi: null
        };

        setTickets(prev => [newTicket, ...prev]);
      }
      
      setNewTitle('');
      setNewUnitId('');
      setNewCategory('lainnya');
      setIsModalOpen(false);
      alert("Tiket manual berhasil diterbitkan!");
    } catch (err) {
      console.error('Error creating manual ticket:', err.message);
      alert('Gagal membuat tiket: ' + err.message);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'Semua Status') {
      return matchesSearch;
    } else {
      return matchesSearch && ticket.status === statusFilter;
    }
  });

  const activeCount = tickets.filter(t => t.status === 'Proses').length;

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat data dari server...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative overflow-visible">
      
      {/* BAR KONTROL & PENCARIAN */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm overflow-visible relative z-30">
        <div className="flex flex-wrap items-center gap-3 flex-1 overflow-visible">
          
          {/* FILTER DROPDOWN STATUS */}
          <div className="relative z-50 overflow-visible">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="px-4 py-2 text-xs font-bold bg-white border border-gray-300 rounded-full flex items-center justify-between min-w-[140px] text-left text-gray-700 hover:bg-gray-50 transition"
            >
              <span>{statusFilter}</span>
              <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${filterDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {filterDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-black/[0.01]" onClick={() => setFilterDropdownOpen(false)}></div>
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 block animate-scale-in">
                  {['Semua Status', 'Proses', 'Selesai'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition duration-150 ${
                        statusFilter === status ? 'text-black bg-gray-100 font-bold' : 'text-gray-500'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* INPUT PENCARIAN GLOBAL */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari tiket berdasarkan ID, kerusakan, atau unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Berjalan:</span>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 rounded-full">
              {activeCount} Proses
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-black bg-black text-white rounded-xl flex items-center gap-1.5 hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Buat Tiket Manual</span>
          </button>
        </div>
      </div>

      {/* GRID KARTU TIKET LAPORAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, idx) => {
            const isSelesai = ticket.status === 'Selesai';
            const cardColors = [
              'bg-red-50/60 border border-red-100/70', 
              'bg-amber-50/60 border border-amber-100/70', 
              'bg-purple-50/60 border border-purple-100/70', 
              'bg-emerald-50/60 border border-emerald-100/70'
            ];
            const cardClass = cardColors[idx % 4];
            let statusBadgeClass = isSelesai ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';

            return (
              <div key={ticket.id} className={`${cardClass} rounded-2xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between gap-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">{ticket.id}</span>
                    <h4 className="font-extrabold text-gray-900 text-base mt-1 line-clamp-2">{ticket.title}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusBadgeClass}`}>{ticket.status}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pb-2 border-b border-gray-900/5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{ticket.unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{ticket.date}</span>
                  </div>
                </div>

                {/* Tampilan Catatan */}
                {isSelesai && ticket.catatan_teknisi && (
                  <div className="p-3 bg-white/80 rounded-xl border border-gray-200/60 text-[11px] text-gray-600 space-y-0.5 shadow-inner">
                    <span className="font-extrabold uppercase tracking-wider text-gray-400 block text-[9px]">Catatan Penyelesaian:</span>
                    <p className="italic font-medium text-gray-700">"{ticket.catatan_teknisi}"</p>
                  </div>
                )}

                <div className="flex items-center justify-end mt-1">
                  <button
                    onClick={() => openMarkDoneModal(ticket.id)} 
                    disabled={isSelesai}
                    className={isSelesai ? 'px-4 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-xl inline-flex items-center gap-1' : 'px-4 py-1.5 text-xs font-black bg-black text-white rounded-xl hover:bg-gray-800 transition'}
                  >
                    {isSelesai ? 'Sudah Selesai' : 'Selesaikan Tiket'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-sm font-bold text-gray-400">Tidak ada tiket kerusakan yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: Pembuatan Tiket Baru Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-black uppercase tracking-wider">Buat Laporan Tiket Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Deskripsi Masalah</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Lampu koridor mati" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition"
                  required
                />
              </div>

              {/* DROPDOWN SELECT UNIT */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Lokasi / Nomor Unit</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition"
                >
                  <option value="">-- Area Umum / Fasilitas Publik --</option>
                  {availableUnits.length > 0 ? (
                    availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        Unit {unit.nomor_unit}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>⚠️ Data unit kosong di database</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Kategori Kerusakan</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition"
                >
                  <option value="listrik">Listrik</option>
                  <option value="air">Air</option>
                  <option value="struktur">Struktur</option>
                  <option value="fasilitas">Fasilitas</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black transition">Simpan Laporan</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Input Catatan Penyelesaian */}
      {isDoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Konfirmasi Penyelesaian</span>
              </h3>
              <button onClick={() => setIsDoneModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleMarkDoneSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Catatan Hasil Perbaikan</label>
                <textarea 
                  rows="3"
                  placeholder="Tulis ringkasan tindakan..." 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-sm">Simpan & Tutup Tiket</button>
                <button type="button" onClick={() => setIsDoneModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}