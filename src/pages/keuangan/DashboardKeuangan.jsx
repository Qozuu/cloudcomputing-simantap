import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardKeuangan() {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    {
      title: 'Tagihan Bulan Ini',
      value: 'Rp 0 Jt',
      subtitle: '0 unit · Rp 0/unit avg',
      borderColor: 'border-l-[4px] border-l-[#F9C3BA]'
    },
    {
      title: 'Sudah Terbayar',
      value: 'Rp 0 Jt',
      badge: '+0% realisasi',
      badgeBg: 'badge-base badge-mint',
      borderColor: 'border-l-[4px] border-l-[#FCD6A5]'
    },
    {
      title: 'Menunggu',
      value: 'Rp 0 Jt',
      subtitle: '0 unit belum bayar',
      borderColor: 'border-l-[4px] border-l-[#C6C1F7]'
    },
    {
      title: 'Tunggakan',
      value: 'Rp 0 Jt',
      subtitle: '0 unit terlambat',
      borderColor: 'border-l-[4px] border-l-[#B5EAD7]'
    }
  ]);

  const [chartData, setChartData] = useState([]);
  const [expenses, setExpenses] = useState([
    { label: 'SDM / Gaji', pct: 0, amount: 'Rp 0 Jt', color: 'progress-pink' },
    { label: 'Operasional', pct: 0, amount: 'Rp 0 Jt', color: 'progress-lavender' },
    { label: 'Perbaikan', pct: 0, amount: 'Rp 0 Jt', color: 'progress-mint' }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch all bills
        const { data: bills, error: billsError } = await supabase
          .from('tagihan')
          .select('*');

        if (billsError) throw billsError;

        if (bills) {
          // Process stats
          const totalBills = bills.length;
          
          const sumTotal = (arr) => arr.reduce((acc, b) => acc + (b.total || b.jumlah || 0), 0);
          
          const totalAmount = sumTotal(bills);
          const avgAmount = totalBills > 0 ? Math.round(totalAmount / totalBills) : 0;
          
          const paidBills = bills.filter(b => b.status?.toLowerCase() === 'sudah_bayar' || b.status?.toLowerCase() === 'lunas');
          const paidAmount = sumTotal(paidBills);
          const paidPct = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : '0';

          const pendingBills = bills.filter(b => b.status?.toLowerCase() === 'menunggu');
          const pendingAmount = sumTotal(pendingBills);
          const pendingCount = pendingBills.length;

          const overdueBills = bills.filter(b => b.status?.toLowerCase() === 'terlambat' || b.status?.toLowerCase() === 'tunggakan');
          const overdueAmount = sumTotal(overdueBills);
          const overdueCount = overdueBills.length;

          const formatJuta = (val) => {
            if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
            return `Rp ${val.toLocaleString('id-ID')}`;
          };

          const formatRibu = (val) => {
            if (val >= 1000) return `${Math.round(val / 1000)}rb`;
            return val.toLocaleString('id-ID');
          };

          setStats([
            {
              title: 'Tagihan Bulan Ini',
              value: formatJuta(totalAmount),
              subtitle: `${totalBills} unit · Rp ${formatRibu(avgAmount)}/unit avg`,
              borderColor: 'border-l-[4px] border-l-[#F9C3BA]'
            },
            {
              title: 'Sudah Terbayar',
              value: formatJuta(paidAmount),
              badge: `+${paidPct}% realisasi`,
              badgeBg: 'badge-base badge-mint',
              borderColor: 'border-l-[4px] border-l-[#FCD6A5]'
            },
            {
              title: 'Menunggu',
              value: formatJuta(pendingAmount),
              subtitle: `${pendingCount} unit belum bayar`,
              borderColor: 'border-l-[4px] border-l-[#C6C1F7]'
            },
            {
              title: 'Tunggakan',
              value: formatJuta(overdueAmount),
              subtitle: `${overdueCount} unit terlambat`,
              borderColor: 'border-l-[4px] border-l-[#B5EAD7]'
            }
          ]);

          // Process chartData (6 months income trend)
          const monthsMap = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
            '07': 'Jul', '08': 'Ags', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
          };
          
          const last6Months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const y = d.getFullYear();
            last6Months.push({
              key: `${y}-${m}`,
              name: monthsMap[m],
              fullName: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
              amount: 0
            });
          }

          paidBills.forEach(b => {
            let targetKey = '';
            if (b.periode && b.periode.includes('-')) {
              targetKey = b.periode.substring(0, 7);
            } else if (b.periode) {
              const parts = b.periode.split(' ');
              if (parts.length === 2) {
                const monthNames = {
                  'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06',
                  'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
                  'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
                };
                const mKey = monthNames[parts[0].toLowerCase()];
                if (mKey) {
                  targetKey = `${parts[1]}-${mKey}`;
                }
              }
            }

            const match = last6Months.find(item => item.key === targetKey || b.periode?.toLowerCase().includes(item.fullName.toLowerCase()) || b.periode?.toLowerCase().includes(item.name.toLowerCase()));
            if (match) {
              match.amount += (b.total || b.jumlah || 0);
            }
          });

          setChartData(last6Months.map(m => ({
            name: m.name,
            Pendapatan: Math.round(m.amount / 1000000)
          })));
        }

        // Fetch expenses
        try {
          const { data: expData, error: expError } = await supabase
            .from('pengeluaran')
            .select('*');

          if (!expError && expData && expData.length > 0) {
            const totalExp = expData.reduce((acc, row) => acc + (row.nominal || row.amount || 0), 0);
            
            const getCatTotal = (cat) => expData.filter(row => row.kategori?.toLowerCase().includes(cat.toLowerCase())).reduce((acc, row) => acc + (row.nominal || row.amount || 0), 0);
            
            const sdmTotal = getCatTotal('sdm') || getCatTotal('gaji');
            const operasionalTotal = getCatTotal('operasional');
            const perbaikanTotal = getCatTotal('perbaikan');
            
            const sdmPct = totalExp > 0 ? Math.round((sdmTotal / totalExp) * 100) : 0;
            const operasionalPct = totalExp > 0 ? Math.round((operasionalTotal / totalExp) * 100) : 0;
            const perbaikanPct = totalExp > 0 ? Math.round((perbaikanTotal / totalExp) * 100) : 0;

            const formatJutaExp = (val) => {
              if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)} Jt`;
              return `Rp ${val.toLocaleString('id-ID')}`;
            };

            setExpenses([
              { label: 'SDM / Gaji', pct: sdmPct, amount: formatJutaExp(sdmTotal), color: 'progress-pink' },
              { label: 'Operasional', pct: operasionalPct, amount: formatJutaExp(operasionalTotal), color: 'progress-lavender' },
              { label: 'Perbaikan', pct: perbaikanPct, amount: formatJutaExp(perbaikanTotal), color: 'progress-mint' }
            ]);
          } else {
            setExpenses([
              { label: 'SDM / Gaji', pct: 48, amount: 'Rp 68 Jt', color: 'progress-pink' },
              { label: 'Operasional', pct: 30, amount: 'Rp 42 Jt', color: 'progress-lavender' },
              { label: 'Perbaikan', pct: 22, amount: 'Rp 32 Jt', color: 'progress-mint' }
            ]);
          }
        } catch (e) {
          setExpenses([
            { label: 'SDM / Gaji', pct: 48, amount: 'Rp 68 Jt', color: 'progress-pink' },
            { label: 'Operasional', pct: 30, amount: 'Rp 42 Jt', color: 'progress-lavender' },
            { label: 'Perbaikan', pct: 22, amount: 'Rp 32 Jt', color: 'progress-mint' }
          ]);
        }
      } catch (err) {
        console.error('Error loading dashboard keuangan:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const formatRupiahYAxis = (value) => {
    return `Rp ${value} Jt`;
  };

  if (loading) {
    return <div className="p-6 text-muted text-sm">Memuat...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const cardClasses = [
            'card-pink',
            'card-yellow',
            'card-lavender',
            'card-mint'
          ];
          const bgClass = cardClasses[idx % 4];
          
          return (
            <div
              key={idx}
              className={`${bgClass} flex flex-col justify-between min-h-[120px] transition hover:shadow-soft hover:scale-[1.01] duration-150`}
            >
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-[#8A857F] uppercase tracking-widest leading-none">
                  {stat.title}
                </p>
                <p className="text-2xl font-black text-[#1E1E1E] leading-none mt-1">
                  {stat.value}
                </p>
              </div>
              
              <div className="mt-3">
                {stat.badge ? (
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    idx % 4 === 0 ? 'bg-[rgba(249,195,186,0.6)] text-[#C05040]' :
                    idx % 4 === 1 ? 'bg-[rgba(252,214,165,0.6)] text-[#A05820]' :
                    idx % 4 === 2 ? 'bg-[rgba(198,193,247,0.6)] text-[#4840B0]' :
                    'bg-[rgba(181,234,215,0.6)] text-[#187050]'
                  }`}>
                    {stat.badge}
                  </span>
                ) : (
                  <p className="text-xs text-[#8A857F] font-semibold">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left: 6 Months Income Bar Chart (60%) */}
        <div className="lg:col-span-6 card-section p-6 flex flex-col justify-between">
          <div className="border-b border-soft pb-4 mb-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Tren Pendapatan 6 Bulan
            </h3>
            <p className="text-[10px] text-muted font-bold mt-0.5">Akumulasi pendapatan IPL, parkir, dan fasilitas</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(30,30,30,0.05)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#8A857F' }}
                />
                <YAxis 
                  tickFormatter={formatRupiahYAxis} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#8A857F' }}
                  domain={[0, 400]}
                />
                <Tooltip 
                  formatter={(value) => [`Rp ${value} Jt`]}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(30,30,30,0.07)', background: '#FFFFFF', fontSize: '11px', fontWeight: 'bold' }}
                />
                {/* Single bar lavender color */}
                <Bar dataKey="Pendapatan" fill="#C6C1F7" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pengeluaran Progress Bars (40%) */}
        <div className="lg:col-span-4 card-section p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-soft pb-4 mb-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </h3>
            <Link
              to="/keuangan/expense"
              className="text-xs font-bold text-ink hover:text-muted transition flex items-center gap-0.5"
            >
              <span>Lihat Detail</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-5 py-2 flex-1 flex flex-col justify-center">
            {expenses.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-ink">
                  <span>{item.label}</span>
                  <span>{item.amount}</span>
                </div>
                <div className="progress-track">
                  <div 
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted font-bold tracking-tight text-right">{item.pct}% dari total pengeluaran</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
