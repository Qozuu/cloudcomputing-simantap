import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  User,
  Clock,
  Camera,
  CheckCircle2,
  FileImage,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LaporanKerusakan() {
  const fileInputRef = useRef(null);
  const [successToast, setSuccessToast] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  
  // State untuk menyimpan ID valid hasil sinkronisasi dengan database schema
  const [dbUser, setDbUser] = useState({ id: null, unitId: null });

  const [formData, setFormData] = useState({
    category: 'listrik',
    description: ''
  });

  useEffect(() => {
    async function sinkronisasiUserKeDatabase() {
      try {
        setLoading(true);
        
        // 1. Ambil session email yang sedang aktif login di browser
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.warn("Sesi otentikasi tidak ditemukan.");
          setLoading(false);
          return;
        }

        // 2. Ambil ID Pengguna asli dari tabel public.users (Sesuai constraint fkey)
        const { data: dataUser, error: errorUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (errorUser || !dataUser) {
          console.error("Email auth tidak terdaftar di tabel public.users database!");
          setLoading(false);
          return;
        }

        // 3. Ambil Unit ID kamar dari tabel public.penghuni
        const { data: dataPenghuni, error: errorPenghuni } = await supabase
          .from('penghuni')
          .select('unit_id')
          .eq('email', user.email)
          .maybeSingle();

        // Mengunci ID valid ke dalam state komponen
        setDbUser({
          id: dataUser.id, // Ini adalah UUID public.users yang lolos fkey constraint
          unitId: dataPenghuni?.unit_id || null
        });

        // Muat list tiket untuk user id ini
        await fetchTickets(dataUser.id);
      } catch (err) {
        console.error("Gagal sinkronisasi data user:", err.message);
      } finally {
        setLoading(false);
      }
    }

    sinkronisasiUserKeDatabase();
  }, []);

  // Mengambil daftar laporan dari database (Dibatasi maksimal 3 teratas)
  async function fetchTickets(userId) {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('laporan')
        .select('*, ditugaskan_ke:ditugaskan_ke(nama)')
        .eq('pelapor_id', userId)
        .neq('status', 'selesai')
        .order('created_at', { ascending: false })
        .limit(3); // ✨ Mengunci kuota agar hanya 3 tiket terbaru yang dirender di sini

      if (error) throw error;
      
      const mapped = (data || []).map(t => {
        let displayCategory = 'LAINNYA';
        const kat = String(t.kategori).toLowerCase();
        if (kat === 'listrik') displayCategory = 'INFRASTRUKTUR LISTRIK';
        if (kat === 'air') displayCategory = 'PLUMBING & SALURAN AIR';
        if (kat === 'struktur') displayCategory = 'STRUKTUR & BANGUNAN';
        if (kat === 'fasilitas') displayCategory = 'FASILITAS UMUM / LIFT';
        if (kat === 'ac') displayCategory = 'AC / PENDINGIN';

        return {
          id: `TK-${String(t.id).substring(0, 4).toUpperCase()}`, 
          title: t.judul || t.deskripsi,
          category: displayCategory,
          date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          teknisi: t.ditugaskan_ke?.nama || 'Sedang Diplot',
          estimasi: 'Verifikasi Admin',
          status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Menunggu',
          fotoUrl: t.foto_url,
          raw: t
        };
      });
      setTickets(mapped);
    } catch (err) {
      console.error('Gagal memuat list tiket laporan:', err.message);
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!dbUser.id) {
      alert('Gagal mengirim laporan: ID Pelapor Anda tidak terdaftar atau tidak sah di tabel users database.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Deskripsi kerusakan tidak boleh kosong.');
      return;
    }

    try {
      let uploadedFotoUrl = null;

      // Proses upload foto ke storage bucket jika ada
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${dbUser.id}_${Date.now()}.${fileExt}`;
        const filePath = `laporan/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('laporan-kerusakan') 
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('laporan-kerusakan')
            .getPublicUrl(filePath);
          uploadedFotoUrl = publicUrlData.publicUrl;
        }
      }

      // Sesuai CHECK constraint database: 'listrik', 'air', 'struktur', 'fasilitas', 'ac', 'lainnya'
      const cleanCategory = formData.category.toLowerCase();
      const judulLaporan = `${formData.category.toUpperCase()} — ${formData.description.substring(0, 30)}...`;

      // Menyusun objek laporan baru yang patuh pada susunan kolom tabel
      const newLaporan = {
        pelapor_id: dbUser.id,       // Berisi ID dari public.users (Valid sesuai FKey)
        unit_id: dbUser.unitId,      // Berisi ID Unit dari public.unit atau null
        judul: judulLaporan,
        deskripsi: formData.description,
        kategori: cleanCategory,     // Dipastikan berupa lowercase agar lolos check constraint
        status: 'menunggu',
        foto_url: uploadedFotoUrl
      };

      const { error } = await supabase
        .from('laporan')
        .insert([newLaporan]);

      if (error) throw error;

      setSuccessToast(`Laporan kerusakan berhasil terkirim!`);
      setTimeout(() => setSuccessToast(''), 4000);

      // Reset form input
      setFormData({ category: 'listrik', description: '' });
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh list tiket di client side
      await fetchTickets(dbUser.id);
    } catch (err) {
      console.error('Gagal menyimpan laporan:', err.message);
      alert(`Gagal menyimpan laporan ke database: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-zinc-800 animate-fade-up">
      
      {/* List Tiket Laporan Aktif */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench size={15} className="text-zinc-500" />
          <span>Laporan Pengaduan Aktif</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-6 text-xs font-semibold text-zinc-400">Memuat data laporan...</div>
          ) : tickets.map((ticket) => (
            <div
              key={ticket.raw.id}
              className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{ticket.id}</span>
                <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  ticket.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h4 className="text-xs font-bold text-zinc-900 leading-snug truncate flex-1 font-medium">
                  {ticket.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveModalTicket(ticket)}
                  className="flex items-center gap-1 text-[11px] font-bold text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-sm transition hover:bg-zinc-50"
                >
                  <Eye size={12} />
                  <span>Detail</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-zinc-600 border-t border-zinc-100 pt-3 mt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-400" />
                  <span>Masuk: {ticket.date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-zinc-400" />
                  <span>Teknisi: {ticket.teknisi}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-zinc-400" />
                  <span>Estimasi: {ticket.estimasi}</span>
                </span>
              </div>
            </div>
          ))}
          
          {!loading && tickets.length === 0 && (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-xs font-semibold text-zinc-400">
              Tidak ada laporan kerusakan atau komplain yang sedang aktif.
            </div>
          )}
        </div>
      </div>

      {/* Form Input Pengaduan */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-3 border-b border-zinc-100">
          Buat Laporan Kerusakan Baru
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Kategori Bidang Kerusakan</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition"
            >
              <option value="listrik">Infrastruktur Listrik</option>
              <option value="air">Plumbing & Saluran Air</option>
              <option value="struktur">Fasilitas Struktur & Bangunan</option>
              <option value="fasilitas">Fasilitas Umum / Lift</option>
              <option value="ac">AC / Pendingin</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Deskripsi Detail Kerusakan</label>
            <textarea
              rows={4}
              required
              placeholder="Sebutkan secara rinci titik kerusakan fasilitas..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition resize-none font-medium"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Lampiran Bukti Foto</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 rounded-xl flex flex-col items-center justify-center gap-2 py-6 cursor-pointer transition"
            >
              {selectedFileName ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                    <FileImage size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-900">{selectedFileName}</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Klik untuk mengganti gambar</span>
                </>
              ) : (
                <>
                  <Camera size={20} className="text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-400">Klik untuk upload foto kondisi kerusakan</span>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition">
            <Plus size={14} />
            <span>Kirim Laporan Resmi</span>
          </button>
        </form>
      </div>

      {/* Modal Popup Detail Laporan */}
      {activeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-zinc-100">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{activeModalTicket.id}</span>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Detail Kendala</h3>
              </div>
              <button 
                onClick={() => setActiveModalTicket(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-200 text-zinc-400 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs font-semibold">
              <div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 mb-2">
                  Kategori: {activeModalTicket.category}
                </span>
                <p className="text-zinc-900 font-medium leading-relaxed whitespace-pre-wrap bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-medium">
                  {activeModalTicket.title}
                </p>
              </div>

              {activeModalTicket.fotoUrl && (
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1.5">Foto Lampiran</p>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 max-h-48 bg-zinc-100">
                    <img src={activeModalTicket.fotoUrl} alt="Bukti kerusakan" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="bg-zinc-50/50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-zinc-100">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Tanggal Masuk</p>
                  <p className="text-zinc-900 font-bold mt-0.5">{activeModalTicket.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Status Progres</p>
                  <p className="text-emerald-700 font-bold mt-0.5">{activeModalTicket.status}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Teknisi Ditunjuk</p>
                  <p className="text-zinc-900 font-bold mt-0.5">{activeModalTicket.teknisi}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Estimasi Selesai</p>
                  <p className="text-zinc-900 font-bold mt-0.5">{activeModalTicket.estimasi}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
              <button
                onClick={() => setActiveModalTicket(null)}
                className="px-4 py-2 bg-zinc-900 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Success Alert */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-wide">Laporan Terkirim</p>
            <p className="text-[10px] text-zinc-400 font-medium">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}