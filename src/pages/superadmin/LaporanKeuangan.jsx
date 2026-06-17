import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Pastikan path import supabase client sudah benar

export default function LaporanKeuangan() {
  const [pendapatanData, setPendapatanData] = useState([]);
  const [pengeluaranData, setPengeluaranData] = useState([]);
  
  const [totalPendapatan, setTotalPendapatan] = useState('Rp 0 Jt');
  const [totalPengeluaran, setTotalPengeluaran] = useState('Rp 0 Jt');
  const [labaBersih, setLabaBersih] = useState('Rp 0 Jt');
  
  const [persenLaba, setPersenLaba] = useState('+0%');
  const [persenIpl, setPersenIpl] = useState('0%');
  
  const [loading, setLoading] = useState(true);

  // Helper untuk mengubah format tanggal (YYYY-MM-DD) menjadi "Bulan Tahun"
  const formatBulanTahun = (dateString) => {
    if (!dateString) return 'Lainnya';
    const parts = dateString.split('-');
    if (parts.length < 2) return dateString;
    
    const yr = parts[0];
    const mn = parseInt(parts[1], 10);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[mn - 1]} ${yr}`;
  };

  // Helper untuk format angka ke Juta (misal: 15000000 -> Rp 15 Jt)
  const formatKeJuta = (angka) => {
    return `Rp ${Math.round(angka / 1000000)} Jt`;
  };

  useEffect(() => {
    async function kalkulasiKeuanganLangsung() {
      try {
        setLoading(true);

        // Ambil data secara bersamaan dari 4 tabel sesuai skema DB kamu
        const [
          { data: tagihanList },
          { data: fasilitasList },
          { data: parkirList },
          { data: pengeluaranList }
        ] = await Promise.all([
          supabase.from('tagihan').select('jumlah, status, periode, jenis'),
          supabase.from('tagihan_fasilitas').select('total_tarif, status, tgl_reservasi'),
          supabase.from('parking_log').select('biaya, waktu_masuk').not('waktu_keluar', 'is', null),
          supabase.from('pengeluaran').select('nominal, kategori, tanggal').eq('status', 'selesai')
        ]);

        const strukturBulanan = {};
        let akumulasiTargetIpl = 0;
        let akumulasiRealisasiIpl = 0;

        // Fungsi inisialisasi agar objek bulan tidak undefined
        const inisialisasiBulan = (bulanKey) => {
          if (!strukturBulanan[bulanKey]) {
            strukturBulanan[bulanKey] = { 
              iplTarget: 0, iplRealisasi: 0, parkir: 0, fasilitas: 0, 
              sdm: 0, operasional: 0, perbaikan: 0 
            };
          }
        };

        // 1. Hitung Tagihan IPL (Sesuai ENUM huruf kapital 'IPL')
        if (tagihanList) {
          tagihanList.forEach(t => {
            const bulanKey = formatBulanTahun(t.periode);
            inisialisasiBulan(bulanKey);
            
            if (t.jenis === 'IPL') {
              const nominal = Number(t.jumlah) || 0;
              strukturBulanan[bulanKey].iplTarget += nominal;
              akumulasiTargetIpl += nominal;
              
              if (t.status === 'sudah_bayar') {
                strukturBulanan[bulanKey].iplRealisasi += nominal;
                akumulasiRealisasiIpl += nominal;
              }
            }
          });
        }

        // 2. Hitung Pendapatan Sewa Fasilitas
        if (fasilitasList) {
          fasilitasList.forEach(f => {
            const bulanKey = formatBulanTahun(f.tgl_reservasi);
            inisialisasiBulan(bulanKey);
            if (f.status === 'Disetujui') {
              strukturBulanan[bulanKey].fasilitas += Number(f.total_tarif) || 0;
            }
          });
        }

        // 3. Hitung Pendapatan Parkir
        if (parkirList) {
          parkirList.forEach(p => {
            const tglSaja = p.waktu_masuk ? p.waktu_masuk.split('T')[0] : '';
            const bulanKey = formatBulanTahun(tglSaja);
            inisialisasiBulan(bulanKey);
            strukturBulanan[bulanKey].parkir += Number(p.biaya) || 0;
          });
        }

        // 4. Hitung Pengeluaran (Sesuai ENUM: sdm_gaji, operasional, perbaikan)
        if (pengeluaranList) {
          pengeluaranList.forEach(p => {
            const bulanKey = formatBulanTahun(p.tanggal);
            inisialisasiBulan(bulanKey);
            
            const nominal = Number(p.nominal) || 0;
            if (p.kategori === 'sdm_gaji') {
              strukturBulanan[bulanKey].sdm += nominal;
            } else if (p.kategori === 'operasional') {
              strukturBulanan[bulanKey].operasional += nominal;
            } else if (p.kategori === 'perbaikan') {
              strukturBulanan[bulanKey].perbaikan += nominal;
            }
          });
        }

        // --- GABUNGKAN MENJADI ARRAY DATA ---
        const listBulan = Object.keys(strukturBulanan);
        let grandTotalPendapatan = 0;
        let grandTotalPengeluaran = 0;

          const pData = [];
          const eData = [];

        listBulan.forEach(bulan => {
          const b = strukturBulanan[bulan];

          // Kalkulasi Pendapatan Bulanan
          const totalPendBulan = b.iplRealisasi + b.parkir + b.fasilitas;
          grandTotalPendapatan += totalPendBulan;
          const pctBulan = b.iplTarget > 0 ? Math.round((b.iplRealisasi / b.iplTarget) * 100) : 0;

          pData.push({
            bulan: bulan,
            target: formatKeJuta(b.iplTarget),
            realisasi: formatKeJuta(b.iplRealisasi),
            parkir: formatKeJuta(b.parkir),
            fasilitas: formatKeJuta(b.fasilitas),
            total: formatKeJuta(totalPendBulan),
            pct: pctBulan
          });

          // Kalkulasi Pengeluaran Bulanan
          const totalPengBulan = b.sdm + b.operasional + b.perbaikan;
          grandTotalPengeluaran += totalPengBulan;

          eData.push({
            bulan: bulan,
            sdm: formatKeJuta(b.sdm),
            operasional: formatKeJuta(b.operasional),
            perbaikan: formatKeJuta(b.perbaikan),
            total: formatKeJuta(totalPengBulan)
          });
        });

        // Hitung Persentase Total Dinamis untuk Badge Atas
        const hitungPersenLaba = grandTotalPendapatan > 0 
          ? Math.round(((grandTotalPendapatan - grandTotalPengeluaran) / grandTotalPendapatan) * 100) 
          : 0;
        const hitungPersenIplTotal = akumulasiTargetIpl > 0 
          ? Math.round((akumulasiRealisasiIpl / akumulasiTargetIpl) * 100) 
          : 0;

        // Set semua State UI
        setPendapatanData(pData);
        setPengeluaranData(eData);
        setTotalPendapatan(formatKeJuta(grandTotalPendapatan));
        setTotalPengeluaran(formatKeJuta(grandTotalPengeluaran));
        setLabaBersih(formatKeJuta(grandTotalPendapatan - grandTotalPengeluaran));
        setPersenLaba(hitungPersenLaba >= 0 ? `+${hitungPersenLaba}%` : `${hitungPersenLaba}%`);
        setPersenIpl(`${hitungPersenIplTotal}%`);

      } catch (err) {
        console.error('Gagal memproses data laporan keuangan:', err);
      } finally {
        setLoading(false);
      }
    }

    kalkulasiKeuanganLangsung();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-xs font-bold text-muted">MENGHITUNG LAPORAN KEUANGAN...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* KARTU PENDAPATAN */}
        <div className="card-pink flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Total Pendapatan</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">{totalPendapatan}</h4>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(249,195,186,0.6)', color: '#C05040' }}>
            {persenIpl} Target IPL Tercapai
          </span>
        </div>

        {/* KARTU PENGELUARAN */}
        <div className="card-yellow flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Total Pengeluaran</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">{totalPengeluaran}</h4>
          <span className="text-[#8A857F] font-semibold text-xs mt-3 block">Operasional + Perbaikan + SDM</span>
        </div>

        {/* KARTU LABA BERSIH */}
        <div className="card-lavender flex flex-col justify-between min-h-[110px] hover:translate-y-[-2px] transition duration-150">
          <span className="text-[#8A857F] font-semibold text-xs">Laba Bersih</span>
          <h4 className="text-[#1E1E1E] font-black text-2xl mt-2">{labaBersih}</h4>
          <span className="badge-base w-max mt-2" style={{ backgroundColor: 'rgba(198,193,247,0.6)', color: '#4840B0' }}>
            {persenLaba} Margin Profit
          </span>
        </div>
      </div>

      {/* Table 1: Laporan Pendapatan */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Laporan Pendapatan per Bulan — SiMantap
          </h3>
          <p className="text-xs text-muted mt-0.5">Rincian penerimaan dana otomatis dari database</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Target IPL</th>
                <th>Realisasi IPL</th>
                <th>Pendapatan Parkir</th>
                <th>Sewa Fasilitas</th>
                <th>Total Pendapatan</th>
                <th>% Target IPL</th>
              </tr>
            </thead>
            <tbody>
              {pendapatanData.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-xs text-muted py-4">Tidak ada data pendapatan di database.</td></tr>
              ) : (
                pendapatanData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-ink">{row.bulan}</td>
                    <td className="font-mono text-muted">{row.target}</td>
                    <td className="font-mono text-ink">{row.realisasi}</td>
                    <td className="font-mono text-muted">{row.parkir}</td>
                    <td className="font-mono text-muted">{row.fasilitas}</td>
                    <td className="font-mono text-ink font-bold">{row.total}</td>
                    <td>
                      <span className={`badge-base ${row.pct >= 90 ? 'badge-mint' : 'badge-yellow'}`}>
                        {row.pct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Laporan Pengeluaran */}
      <div className="card-section p-6 overflow-hidden space-y-4">
        <div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Laporan Pengeluaran per Bulan — SiMantap
          </h3>
          <p className="text-xs text-muted mt-0.5">Rincian pengeluaran murni dari database keuangan</p>
        </div>

        <div className="table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>SDM / Gaji Karyawan</th>
                <th>Biaya Operasional</th>
                <th>Biaya Perbaikan</th>
                <th>Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaranData.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-xs text-muted py-4">Tidak ada data pengeluaran di database.</td></tr>
              ) : (
                pengeluaranData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-ink">{row.bulan}</td>
                    <td className="font-mono text-muted">{row.sdm}</td>
                    <td className="font-mono text-muted">{row.operasional}</td>
                    <td className="font-mono text-muted">{row.perbaikan}</td>
                    <td className="font-mono text-ink font-bold">{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}