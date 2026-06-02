import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';

export default function DataPenghuni() {
  const [residents, setResidents] = useState([
    { id: 1, name: 'Hendra Gunawan', unit: '12A', tower: 'Tower A', phone: '0889-7528-5486', email: 'hendra.g@email.com', dateIn: '15 Jan 2023', status: 'Aktif' },
    { id: 2, name: 'Maya Sari', unit: '05B', tower: 'Tower A', phone: '0823-4567-8901', email: 'maya.s@email.com', dateIn: '01 Mar 2022', status: 'Aktif' },
    { id: 3, name: 'Rudi Hartono', unit: '18C', tower: 'Tower B', phone: '0834-5678-9012', email: 'rudi.h@email.com', dateIn: '10 Jun 2023', status: 'Aktif' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '',
    unit: '',
    tower: 'Tower A',
    phone: '',
    email: '',
    dateIn: ''
  });

  const handleAddResident = (e) => {
    e.preventDefault();
    if (!newResident.name || !newResident.unit || !newResident.phone) return;

    // Formatting date input to human readable (e.g. 15 Jan 2023)
    const rawDate = new Date(newResident.dateIn || Date.now());
    const formattedDate = rawDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const added = {
      id: Date.now(),
      name: newResident.name,
      unit: newResident.unit,
      tower: newResident.tower,
      phone: newResident.phone,
      email: newResident.email || '—',
      dateIn: formattedDate,
      status: 'Aktif'
    };

    setResidents(prev => [added, ...prev]);
    setModalOpen(false);
    setNewResident({ name: '', unit: '', tower: 'Tower A', phone: '', email: '', dateIn: '' });
  };

  const filteredResidents = residents.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.name.toLowerCase().includes(query) ||
      res.unit.toLowerCase().includes(query) ||
      res.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Controls and Stats Header */}
      <div className="card-section p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari nama, unit, telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 input-modern font-semibold w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-bold hidden md:inline">
            412 penghuni aktif
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold"
          >
            <Plus size={14} />
            <span>Tambah Penghuni</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-section p-6 overflow-hidden">
        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Unit</th>
                <th>Tower</th>
                <th>No. Telepon</th>
                <th>Tanggal Masuk</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map((res) => (
                  <tr key={res.id}>
                    <td className="font-bold text-ink">{res.name}</td>
                    <td className="text-ink font-bold">{res.unit}</td>
                    <td className="text-muted">{res.tower}</td>
                    <td className="font-mono text-muted">{res.phone}</td>
                    <td className="text-muted">{res.dateIn}</td>
                    <td>
                      <span className="badge-base badge-mint">
                        {res.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="text-ink hover:underline font-bold text-xs">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted font-bold">
                    Tidak ada data penghuni yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tambah Penghuni Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Tambah Penghuni Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-ink transition">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddResident} className="modal-body space-y-4">
              <div>
                <label className="label-modern">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Eko Prasetyo"
                  value={newResident.name}
                  onChange={(e) => setNewResident(prev => ({ ...prev, name: e.target.value }))}
                  className="input-modern font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">No. Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 12A"
                    value={newResident.unit}
                    onChange={(e) => setNewResident(prev => ({ ...prev, unit: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Tower</label>
                  <select
                    value={newResident.tower}
                    onChange={(e) => setNewResident(prev => ({ ...prev, tower: e.target.value }))}
                    className="select-modern input-modern font-semibold"
                  >
                    <option value="Tower A">Tower A</option>
                    <option value="Tower B">Tower B</option>
                    <option value="Tower C">Tower C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">No. Telepon</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={newResident.phone}
                    onChange={(e) => setNewResident(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
                <div>
                  <label className="label-modern">Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    value={newResident.dateIn}
                    onChange={(e) => setNewResident(prev => ({ ...prev, dateIn: e.target.value }))}
                    className="input-modern font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="label-modern">Email</label>
                <input
                  type="email"
                  placeholder="Contoh: email@domain.com"
                  value={newResident.email}
                  onChange={(e) => setNewResident(prev => ({ ...prev, email: e.target.value }))}
                  className="input-modern font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-soft">
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Tambah
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
    </div>
  );
}
