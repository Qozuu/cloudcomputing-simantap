import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TiketKerusakan() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  
  // State untuk Pop-up Input Tiket Baru Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUnit, setNewUnit] = useState('');

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama, no_hp), teknisi:users!ditugaskan_ke(nama), unit(nomor_unit, tower(nama_tower))')
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;

        if (ticketsData) {
          const mapped = ticketsData.map(ticket => ({
            id: String(ticket.id),
            title: ticket.judul || ticket.deskripsi || 'Tidak ada judul',
            unit: ticket.unit?.nomor_unit ? `Unit ${ticket.unit.nomor_unit}` : 'Umum',
            date: new Date(ticket.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            status: ticket.status === 'selesai' || ticket.status === 'Selesai' ? 'Selesai' : 'Proses',
            teknisi: ticket.teknisi?.nama || null
          }));
          setTickets(mapped);
        }

        // Fetch technicians
        const { data: techData, error: techError } = await supabase
          .from('users')
          .select('id, nama, role')
          .ilike('role', '%teknisi%');

        if (techError) throw techError;

        if (techData && techData.length > 0) {
          setTechnicians(techData);
        } else {
          // Fallback if no technicians in DB
          setTechnicians([
            { id: 1, nama: 'Pak Heri', role: 'Teknisi' },
            { id: 2, nama: 'Pak Roni', role: 'Teknisi' },
            { id: 3, nama: 'Pak Agus', role: 'Teknisi' },
            { id: 4, nama: 'Pak Ridwan', role: 'Teknisi' },
            { id: 5, nama: 'Pak Riko', role: 'Teknisi' }
          ]);
        }
      } catch (err) {
        console.error('Error loading tickets:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fungsi mengubah status menjadi Selesai
  const handleMarkDone = async (id) => {
    try {
      const { error } = await supabase
        .from('laporan')
        .update({ status: 'selesai', updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;

      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === id ? { ...ticket, status: 'Selesai' } : ticket
        )
      );
    } catch (err) {
      console.error('Error updating ticket status:', err.message);
    }
  };

  // Fungsi menugaskan teknisi baru
  const handleAssignTeknisi = async (id, tech) => {
    try {
      const { error } = await supabase
        .from('laporan')
        .update({ ditugaskan_ke: tech.id, status: 'proses' })
        .eq('id', id);

      if (error) throw error;

      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === id 
            ? { ...ticket, teknisi: tech.nama, status: 'Proses' } 
            : ticket
        )
      );
      setAssigningTicketId(null);
    } catch (err) {
      console.error('Error assigning technician:', err.message);
    }
  };

  // Fungsi menyimpan pembuatan tiket manual baru
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTitle || !newUnit) return;

    try {
      // Find unit_id matching newUnit
      const { data: unitData } = await supabase
        .from('unit')
        .select('id')
        .eq('nomor_unit', newUnit)
        .single();

      const unitId = unitData ? unitData.id : null;

      // Get current user id
      const { data: { user } } = await supabase.auth.getUser();
      const pelaporId = user ? user.id : null;

      const { data: insertedData, error } = await supabase
        .from('laporan')
        .insert({
          judul: newTitle,
          deskripsi: newTitle,
          unit_id: unitId,
          pelapor_id: pelaporId,
          status: 'proses',
          created_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;

      if (insertedData) {
        const formattedDate = new Date(insertedData.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        const newTicket = {
          id: String(insertedData.id),
          title: insertedData.judul || insertedData.deskripsi || 'Tidak ada judul',
          unit: newUnit,
          date: formattedDate,
          status: 'Proses',
          teknisi: null
        };

        setTickets(prev => [newTicket, ...prev]);
      }
      
      // Reset parameter input form & tutup modal popup
      setNewTitle('');
      setNewUnit('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating manual ticket:', err.message);
    }
  };

  // Logika Filter Pencarian dan Status Dropdown
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

  // Menghitung jumlah total tiket aktif saat ini (Proses)
  const activeCount = tickets.filter(t => t.status === 'Proses').length;

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative overflow-visible">
      
      {/* 🛠️ CONTROLS ROW - Diberikan overflow-visible agar menu dropdown tidak ambles ke bawah kartu putih */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-visible relative z-30 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1 overflow-visible">
          
          {/* 🔍 FILTER STATUS DROPDOWN */}
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
                {/* Overlay penutup klik area luar */}
                <div 
                  className="fixed inset-0 z-40 bg-black/[0.01]" 
                  onClick={() => setFilterDropdownOpen(false)}
                ></div>
                
                {/* Menu pilihan status mengambang mutlak di paling depan */}
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

          {/* INPUT FORM PENCARIAN TIKET */}
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

        {/* STATISTIK TIKET AKTIF & TOMBOL GLOBAL MANUAL */}
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

      {/* 🗂️ GRID DAFTAR TIKET KERUSAKAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, idx) => {
            const isSelesai = ticket.status === 'Selesai';
            
            // Pewarnaan soft pastel background khas SiManTap
            const cardColors = [
              'bg-red-50/60 border border-red-100/70', 
              'bg-amber-50/60 border border-amber-100/70', 
              'bg-purple-50/60 border border-purple-100/70', 
              'bg-emerald-50/60 border border-emerald-100/70'
            ];
            const cardClass = cardColors[idx % 4];

            let statusBadgeClass = isSelesai 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800';

            return (
              <div 
                key={ticket.id} 
                className={`${cardClass} rounded-2xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between gap-4`}
              >
                {/* Header Info Tiket */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">{ticket.id}</span>
                    <h4 className="font-extrabold text-gray-900 text-base mt-1 line-clamp-2">
                      {ticket.title}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${statusBadgeClass}`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Indikator Unit, Tanggal, Teknisi */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pb-2 border-b border-gray-900/5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{ticket.unit}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{ticket.date}</span>
                  </div>

                  {ticket.teknisi ? (
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 bg-white/60 px-2 py-0.5 rounded-md border border-gray-100">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{ticket.teknisi}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium text-gray-400 italic">
                      <span>Belum ditugaskan</span>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Kerja Tiket */}
                <div className="flex items-center justify-between gap-3 mt-1 relative">
                  
                  {/* PENUGASAN TEKNISI OVERLAY DROPDOWN */}
                  <div className="relative">
                    <button
                      onClick={() => setAssigningTicketId(assigningTicketId === ticket.id ? null : ticket.id)}
                      disabled={isSelesai}
                      className="px-3 py-1.5 text-xs font-bold bg-white/80 border border-gray-300 rounded-xl flex items-center gap-1.5 text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Assign Teknisi</span>
                    </button>

                    {assigningTicketId === ticket.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setAssigningTicketId(null)}></div>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-40 py-1.5 animate-scale-in">
                          <p className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-50 pb-1 mb-1">Pilih Teknisi</p>
                          {technicians.map((tech) => (
                            <button
                              key={tech.id}
                              onClick={() => handleAssignTeknisi(ticket.id, tech)}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
                            >
                              {tech.nama}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* KELOLA TOMBOL SELESAI */}
                  <button
                    onClick={() => handleMarkDone(ticket.id)}
                    disabled={isSelesai}
                    className={
                      isSelesai 
                        ? 'px-4 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-xl inline-flex items-center gap-1 cursor-default' 
                        : 'px-4 py-1.5 text-xs font-black bg-black text-white rounded-xl justify-center flex items-center gap-1 hover:bg-gray-800 transition'
                    }
                  >
                    {isSelesai ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Selesai</span>
                      </>
                    ) : (
                      <span>Tandai Selesai</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <p className="text-sm font-bold text-gray-400">Tidak ada tiket kerusakan yang cocok dengan filter pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* 🔳 POPUP MODAL DIALOG Pembuatan Tiket Baru Manual (Global) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-black uppercase tracking-wider">Buat Laporan Tiket Manual</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Deskripsi Masalah Kerusakan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Lampu koridor lantai 3 padam" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Lokasi / Sektor Unit</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Area Publik / Unit 14B" 
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition"
                  required
                />
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                  * Catatan Sistem: Berdasarkan aturan baru, tiket yang dibuat mandiri/manual oleh internal admin akan otomatis masuk berstatus awal <span className="font-black uppercase">"Proses"</span>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black transition text-center"
                >
                  Simpan Laporan
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition text-center"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}