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
  const [idPenghuniSah, setIdPenghuniSah] = useState(null);
  const [unitIdSah, setUnitIdSah] = useState(null);

  const [formData, setFormData] = useState({
    category: 'AC / Pendingin',
    description: ''
  });

  // Fungsi fetch menggunakan id internal dari tabel penghuni
  async function fetchTickets(penghuniId) {
    try {
      const { data, error } = await supabase
        .from('laporan')
        .select('*, teknisi:karyawan(nama)') // Menyesuaikan join FK ditugaskan_ke ke tabel karyawan/users
        .eq('pelapor_id', penghuniId)
        .neq('status', 'selesai')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mapped = (data || []).map(t => ({
        id: `TK-${String(t.id).padStart(4, '0')}`,
        title: t.deskripsi || t.judul,
        category: t.kategori,
        date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        teknisi: t.teknisi?.nama || 'Sedang Diplot',
        estimasi: t.estimasi_selesai ? `${t.estimasi_selesai} Hari` : 'Verifikasi Admin',
        status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Menunggu',
        fotoUrl: t.foto_url,
        raw: t
      }));
      setTickets(mapped);
    } catch (err) {
      console.error('Gagal mengambil list tiket:', err.message);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // KOREKSI: Ambil ID internal & Unit ID langsung dari tabel penghuni
        const { data: penghuniData, error: penghuniErr } = await supabase
          .from('penghuni')
          .select('id, unit_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (penghuniErr) throw penghuniErr;

        if (penghuniData) {
          setIdPenghuniSah(penghuniData.id);
          setUnitIdSah(penghuniData.unit_id);
          // Ambil data tiket berdasarkan id penghuni internal
          await fetchTickets(penghuniData.id);
        }
      } catch (err) {
        console.error('Gagal memuat data awal keluhan:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    if (!formData.description.trim() || !idPenghuniSah) {
      alert('Sesi penghuni tidak valid atau belum termuat sempurna.');
      return;
    }

    try {
      let uploadedFotoUrl = null;

      // Fitur Tambahan Otomatis: Upload foto ke Supabase Storage jika ada file dipilih
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${idPenghuniSah}_${Date.now()}.${fileExt}`;
        const filePath = `laporan/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('laporan-kerusakan') // Pastikan nama bucket ini sudah dibuat di Supabase dashboard Anda
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('laporan-kerusakan')
            .getPublicUrl(filePath);
          uploadedFotoUrl = publicUrlData.publicUrl;
        } else {
          console.error('Gagal upload gambar, melanjutkan simpan teks:', uploadError.message);
        }
      }

      // KOREKSI UTAMA: Payload disesuaikan dengan ID internal penghuni
      const newLaporan = {
        pelapor_id: idPenghuniSah, // Integer ID dari tabel penghuni, BUKAN UUID auth
        unit_id: unitIdSah,
        judul: formData.description.substring(0, 50),
        deskripsi: formData.description,
        kategori: formData.category,
        status: 'menunggu',
        foto_url: uploadedFotoUrl
      };

      const { data, error } = await supabase
        .from('laporan')
        .insert([newLaporan])
        .select()
        .single();

      if (error) throw error;

      const ticketId = `TK-${String(data.id).padStart(4, '0')}`;
      setSuccessToast(`Laporan ${ticketId} berhasil terkirim!`);
      setTimeout(() => setSuccessToast(''), 4000);

      // Reset Form State
      setFormData({
        category: 'AC / Pendingin',
        description: ''
      });
      setSelectedFile(null);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh list tiket menggunakan ID yang sah
      await fetchTickets(idPenghuniSah);
    } catch (err) {
      console.error('Gagal mengirim laporan:', err.message);
      alert(`Gagal mengirim laporan: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm font-semibold">Memuat Layanan Pengaduan...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative text-zinc-800">
      
      {/* Section Laporan Kerusakan Aktif */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
          <Wrench size={15} className="text-zinc-500" />
          <span>Laporan Pengaduan Aktif</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket, idx) => {
            // Skema warna kartu berbasis zinc agar bersih dan profesional
            const cardBgColors = ['bg-zinc-50', 'bg-slate-50', 'bg-stone-50', 'bg-neutral-50'];
            const currentBg = cardBgColors[idx % cardBgColors.length];
            
            return (
              <div
                key={ticket.id}
                className={`${currentBg} border border-zinc-200/80 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between gap-3 shadow-sm`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{ticket.id}</span>
                  <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    ticket.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Title & Action Detail Button */}
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-xs font-bold text-zinc-900 leading-snug truncate flex-1">
                    {ticket.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveModalTicket(ticket)}
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-900 hover:text-zinc-700 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-sm transition"
                  >
                    <Eye size={12} />
                    <span>Detail</span>
                  </button>
                </div>

                {/* Meta Rows Information */}
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
            );
          })}
          
          {tickets.length === 0 && (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-8 text-center text-xs font-semibold text-zinc-400">
              Tidak ada laporan kerusakan atau komplain yang sedang aktif.
            </div>
          )}
        </div>
      </div>

      {/* Section Laporkan Kerusakan Baru */}
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
              <option value="AC / Pendingin">AC / Pendingin</option>
              <option value="Listrik">Infrastruktur Listrik</option>
              <option value="Plumbing">Plumbing & Saluran Air</option>
              <option value="Lift">Fasilitas Lift</option>
              <option value="Umum">Fasilitas Umum & Koridor</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Deskripsi Detail Kerusakan</label>
            <textarea
              rows={4}
              required
              placeholder="Sebutkan detail kerusakan (contoh: AC kamar utama bocor air dan tidak dingin)..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition resize-none font-medium"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">Lampiran Bukti Foto</label>
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

      {/* 🖥️ MODAL POPUP DETAIL LAPORAN */}
      {activeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-zinc-100 animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{activeModalTicket.id}</span>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Detail Laporan Kendala</h3>
              </div>
              <button 
                onClick={() => setActiveModalTicket(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-200 text-zinc-400 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs font-semibold">
              <div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 mb-2">
                  Kategori: {activeModalTicket.category}
                </span>
                <p className="text-zinc-900 font-medium leading-relaxed whitespace-pre-wrap bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {activeModalTicket.title}
                </p>
              </div>

              {/* Jika laporan menyertakan foto lampiran */}
              {activeModalTicket.fotoUrl && (
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1.5">Foto Lampiran</p>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 max-h-48 bg-zinc-100">
                    <img src={activeModalTicket.fotoUrl} alt="Bukti kerusakan" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Info Detail Grid */}
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

            {/* Modal Footer */}
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

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
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