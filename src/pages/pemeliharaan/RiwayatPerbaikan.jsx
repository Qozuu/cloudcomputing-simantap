import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// 🔥 PERBAIKAN IMPORT: Cara ini menjamin jsPDF mengenali fungsi autoTable
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RiwayatPerbaikan() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        // Kolom teknisi dikeluarkan dari query karena tidak digunakan lagi
        const { data, error } = await supabase
          .from('laporan')
          .select('*, pelapor:users!pelapor_id(nama), unit(nomor_unit)')
          .eq('status', 'selesai')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map(row => {
            // ⏱️ LOGIKA DURASI OTOMATIS (Sudah Berjalan di Sini)
            let durasi = '—';
            if (row.created_at && row.updated_at) {
              const diffMs = new Date(row.updated_at) - new Date(row.created_at);
              const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
              durasi = diffHrs < 24 ? `${diffHrs} jam` : `${Math.floor(diffHrs / 24)} hari`;
            }
            return {
              id: `TK-${String(row.id).padStart(4, '0')}`,
              kerusakan: row.judul || row.deskripsi || 'Tidak ada keterangan',
              unit: row.unit?.nomor_unit ? `${row.unit.nomor_unit}` : 'Umum',
              selesai: row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
              durasi,
              status: 'Selesai'
            };
          });
          setHistoryData(mapped);
        }
      } catch (err) {
        console.error('Error fetching repair history:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleExport = () => {
    if (historyData.length === 0) {
      alert("Tidak ada data riwayat yang bisa diexport.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 1. HEADER DOKUMEN DENGAN AKSEN WARNA (MENYESUAIKAN TEMA WEB)
      // Membuat Banner Atas berwarna Lavender/Slate sesuai tema aplikasi
      doc.setFillColor(243, 241, 249); // Warna Lavender Lembut (#F3F1F9)
      doc.rect(0, 0, 210, 38, 'F');

      // Judul Utama (Bold & Ink Color)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(27, 27, 37); // Warna Ink Gelap
      doc.text("SiManTap", 14, 15);
      
      doc.setFontSize(11);
      doc.text("LAPORAN RIWAYAT PERBAIKAN SELESAI", 14, 21);
      
      // Sub-header Info (Rata Kanan agar Simetris)
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 110); // Muted Text
      doc.text(`Tanggal Cetak : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 140, 15);
      doc.text(`Total Laporan : ${historyData.length} Kasus Selesai`, 140, 21);
      doc.text(`Status Dokumen: Arsip Digital`, 140, 27);

      // Garis Pembatas Estetik (Aksen Mint/Emerald)
      doc.setLineWidth(0.8);
      doc.setDrawColor(16, 185, 129); // Warna Mint/Emerald (#10B981)
      doc.line(14, 32, 196, 32);

      // 2. STRUKTUR KOLOM (KOLOM TEKNISI DIHAPUS TOTAL)
      const tableHeaders = [["ID TIKET", "KERUSAKAN / MASALAH", "UNIT", "TANGGAL SELESAI", "DURASI", "STATUS"]];
      
      // Pastikan data row.id mengambil variabel id yang sudah di-mapped (Format pendek: TK-xxxx)
      const tableRows = historyData.map((row) => [
        row.id,          // Menggunakan row.id pendek hasil mapping, BUKAN UUID mentah database
        row.kerusakan,
        row.unit,
        row.selesai,
        row.durasi,
        row.status
      ]);

      // 3. EKSEKUSI AUTOTABLE DENGAN FILTER WARNA ELEGAN
      autoTable(doc, {
        startY: 44,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        
        // Pengaturan Sel secara Umum (Anti Tumpang Tindih)
        styles: { 
          fontSize: 8.5, 
          cellPadding: 4,           // Jarak aman teks ke garis kotak sel
          valign: 'middle',         // Teks otomatis presisi di tengah vertikal
          overflow: 'linebreak'     // Memaksa kalimat panjang otomatis turun ke bawah
        },
        
        // Desain Header Tabel (Meniru Tema Lavender-Ink Aplikasi Anda)
        headStyles: { 
          fillColor: [79, 70, 229],  // Warna Lavender Indigo Tua Elegan
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          halign: 'center'
        },
        
        // Penguncian Lebar Kolom yang Sempurna (Total 182mm sesuai batas aman Kertas A4)
        columnStyles: {
          0: { cellWidth: 24, fontStyle: 'bold', halign: 'center' }, // ID Tiket (TK-xxxx) terkunci rapat
          1: { cellWidth: 62, halign: 'left' },                      // Deskripsi kerusakan longgar & rapi
          2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Nomor Unit
          3: { cellWidth: 32, halign: 'center' },                    // Tanggal Selesai
          4: { cellWidth: 26, halign: 'center', fontStyle: 'italic' }, // Durasi Kerja
          5: { cellWidth: 20, halign: 'center' }                     // Status Selesai
        },
        
        // Styling Badge Status Selesai (Mengganti background baris/cell status menjadi Mint)
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 5) {
            data.cell.styles.textColor = [16, 185, 129]; // Warna teks Mint cerah
            data.cell.styles.fontStyle = 'bold';
          }
        },

        // Efek Zebra Striping Lembut di baris tabel
        alternateRowStyles: {
          fillColor: [250, 250, 252]
        }
      });

      // 4. DOWNLOAD HASIL AKHIR
      doc.save(`Laporan_Riwayat_Perbaikan_${new Date().toISOString().slice(0, 10)}.pdf`);

      // --- Efek Pemicu Toast Bawaan Web Anda ---
      if (toastTimeoutId) clearTimeout(toastTimeoutId);
      setToastVisible(true);
      const timeout = setTimeout(() => setToastVisible(false), 3000);
      setToastTimeoutId(timeout);

    } catch (pdfError) {
      console.error("Gagal generate PDF:", pdfError);
      alert("Terjadi kesalahan saat membuat PDF: " + pdfError.message);
    }
  };
  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up relative">
      <div className="card-section flex flex-col">
        
        {/* Card Header */}
        <div className="card-section-header">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Riwayat Perbaikan Selesai</h3>
          <button onClick={handleExport} className="btn-primary btn-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="card-section-body p-0 overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID TIKET</th>
                <th>KERUSAKAN</th>
                <th>UNIT</th>
                <th>SELESAI</th>
                <th>DURASI</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
              {historyData.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold text-ink">{row.id}</td>
                  <td className="font-bold text-ink">{row.kerusakan}</td>
                  <td className="text-muted font-bold">{row.unit}</td>
                  <td className="text-muted">{row.selesai}</td>
                  <td className="font-mono text-ink">{row.durasi}</td>
                  <td>
                    <span className="badge-base badge-mint">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Toast */}
      {toastVisible && (
        <div className="toast-modern toast-success">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Ekspor Berhasil</p>
            <p className="text-[10px] text-gray-300">Laporan_Riwayat_Perbaikan.pdf berhasil diunduh!</p> 
          </div>
        </div>
      )}
    </div>
  );
}