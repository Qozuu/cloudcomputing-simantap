import React, { useState } from 'react';

export default function TiketKerusakan() {
  // Initial tickets state
  const [tickets, setTickets] = useState([
    {
      id: 'TK-0088',
      title: 'AC bocor di Unit 18C',
      unit: 'Unit 18C',
      date: '21 Apr 2026',
      status: 'Urgent',
      teknisi: null
    },
    {
      id: 'TK-0087',
      title: 'Kran kamar mandi menetes',
      unit: 'Unit 12A',
      date: '20 Apr 2026',
      status: 'Proses',
      teknisi: 'Pak Heri'
    },
    {
      id: 'TK-0086',
      title: 'Pintu lift berbunyi',
      unit: 'Tower B',
      date: '19 Apr 2026',
      status: 'Proses',
      teknisi: null
    },
    {
      id: 'TK-0085',
      title: 'Saklar lampu mati',
      unit: 'Unit 05B',
      date: '18 Apr 2026',
      status: 'Proses',
      teknisi: 'Pak Heri'
    },
    {
      id: 'TK-0084',
      title: 'Kunci pintu balkon rusak',
      unit: 'Unit 10C',
      date: '17 Apr 2026',
      status: 'Urgent',
      teknisi: null
    },
    {
      id: 'TK-0083',
      title: 'Intercom mati',
      unit: 'Unit 08A',
      date: '16 Apr 2026',
      status: 'Proses',
      teknisi: 'Pak Roni'
    },
    {
      id: 'TK-0082',
      title: 'Tempat parkir tergenang air',
      unit: 'Basement 1',
      date: '15 Apr 2026',
      status: 'Proses',
      teknisi: null
    },
    {
      id: 'TK-0081',
      title: 'Lampu koridor redup',
      unit: 'Tower A Lt 5',
      date: '14 Apr 2026',
      status: 'Proses',
      teknisi: 'Pak Agus'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  
  // Available technicians list
  const techniciansList = ['Pak Heri', 'Pak Roni', 'Pak Agus', 'Pak Ridwan', 'Pak Riko'];

  // Handle Mark Done
  const handleMarkDone = (id) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === id ? { ...ticket, status: 'Selesai' } : ticket
      )
    );
  };

  // Handle Assign Technician
  const handleAssignTeknisi = (id, teknisiName) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === id 
          ? { ...ticket, teknisi: teknisiName, status: ticket.status === 'Urgent' ? 'Urgent' : 'Proses' } 
          : ticket
      )
    );
    setAssigningTicketId(null);
  };

  // Filter logic
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

  // Calculate active tickets (Urgent or Proses)
  const activeCount = tickets.filter(t => t.status === 'Urgent' || t.status === 'Proses').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls row */}
      <div className="card-section p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Status Dropdown Filter */}
          <div className="relative">
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="btn-ghost btn-sm flex items-center justify-between min-w-[140px] text-left"
            >
              <span>{statusFilter}</span>
              <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${filterDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {filterDropdownOpen && (
              <>
                {/* Overlay background to close on click outside */}
                <div 
                  className="fixed inset-0 z-35" 
                  onClick={() => setFilterDropdownOpen(false)}
                ></div>
                
                {/* Floating Dropdown Items */}
                <div className="absolute left-0 mt-2 w-48 bg-white border border-soft rounded-xl shadow-lg z-40 py-1.5 animate-scale-in">
                  {['Semua Status', 'Urgent', 'Proses', 'Selesai'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-app-bg transition duration-150 ${
                        statusFilter === status ? 'text-ink bg-app-bg font-bold' : 'text-muted'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4.5 w-4.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari tiket berdasarkan ID, kerusakan, atau unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern block w-full pl-10 pr-4 py-2 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Right Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-semibold">Status Aktif:</span>
          <span className="badge-base badge-pink shadow-none">
            {activeCount} aktif
          </span>
        </div>
      </div>

      {/* Tickets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, idx) => {
            const isUrgent = ticket.status === 'Urgent';
            const isProses = ticket.status === 'Proses';
            const isSelesai = ticket.status === 'Selesai';
            
            const cardColors = ['card-pink', 'card-yellow', 'card-lavender', 'card-mint'];
            const cardClass = cardColors[idx % 4];

            let statusBadgeClass = '';
            if (isUrgent) statusBadgeClass = 'bg-[rgba(249,195,186,0.6)] text-[#C05040]';
            if (isProses) statusBadgeClass = 'bg-[rgba(252,214,165,0.6)] text-[#A05820]';
            if (isSelesai) statusBadgeClass = 'bg-[rgba(181,234,215,0.6)] text-[#187050]';
            if (!statusBadgeClass) statusBadgeClass = 'badge-base badge-dark';
            else statusBadgeClass = `badge-base ${statusBadgeClass}`;

            return (
              <div 
                key={ticket.id} 
                className={`${cardClass} hover:shadow-soft transition duration-200 flex flex-col justify-between gap-4`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-[#8A857F] block">{ticket.id}</span>
                    <h4 className="font-black text-[#1E1E1E] text-base mt-1 line-clamp-2">
                      {ticket.title}
                    </h4>
                  </div>
                  <span className={statusBadgeClass}>
                    {ticket.status}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#8A857F] pb-2 border-b border-black/5">
                  {/* Unit info */}
                  <div className="flex items-center gap-1.5 font-bold">
                    <svg className="w-4 h-4 text-[#C05040]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[#1E1E1E]">{ticket.unit}</span>
                  </div>

                  {/* Date info */}
                  <div className="flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{ticket.date}</span>
                  </div>

                  {/* Technician info */}
                  {ticket.teknisi ? (
                    <div className="flex items-center gap-1.5 font-bold text-[#1E1E1E] bg-white/40 px-2 py-0.5 rounded-md">
                      <svg className="w-4 h-4 text-[#A05820]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{ticket.teknisi}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium text-[#8A857F] italic">
                      <span>Belum ditugaskan</span>
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between gap-3 mt-1 relative">
                  
                  {/* Assign Technician Overlay Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setAssigningTicketId(assigningTicketId === ticket.id ? null : ticket.id)}
                      disabled={isSelesai}
                      className="btn-ghost btn-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Assign Teknisi</span>
                    </button>

                    {assigningTicketId === ticket.id && (
                      <>
                        <div className="fixed inset-0 z-35" onClick={() => setAssigningTicketId(null)}></div>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-surface border border-soft rounded-xl shadow-xl z-40 py-1.5 animate-scale-in">
                          <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-muted">Pilih Teknisi</p>
                          {techniciansList.map((tech) => (
                            <button
                              key={tech}
                              onClick={() => handleAssignTeknisi(ticket.id, tech)}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-ink hover:bg-app-bg transition"
                            >
                              {tech}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mark as Completed */}
                  <button
                    onClick={() => handleMarkDone(ticket.id)}
                    disabled={isSelesai}
                    className={
                      isSelesai 
                        ? 'badge-base badge-mint py-2 px-4 shadow-none inline-flex items-center gap-1' 
                        : 'btn-primary btn-sm justify-center flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed'
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
          <div className="col-span-full bg-surface rounded-2xl shadow-none border border-soft p-12 text-center">
            <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <p className="text-sm font-semibold text-muted">Tidak ada tiket kerusakan yang cocok dengan filter atau pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
