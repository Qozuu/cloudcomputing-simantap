import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import PemeliharaanLayout from '../layouts/PemeliharaanLayout';
import KebersihanLayout from '../layouts/KebersihanLayout';
import FasilitasLayout from '../layouts/FasilitasLayout';
import PenghuniLayout from '../layouts/PenghuniLayout';
import KeamananLayout from '../layouts/KeamananLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import KeuanganLayout from '../layouts/KeuanganLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import DashboardTiket from '../pages/pemeliharaan/DashboardTiket';
import TiketKerusakan from '../pages/pemeliharaan/TiketKerusakan';
import RiwayatPerbaikan from '../pages/pemeliharaan/RiwayatPerbaikan';
import CSLiveChat from '../pages/pemeliharaan/CSLiveChat';
import AbsensiTeknisi from '../pages/pemeliharaan/AbsensiTeknisi';

import JadwalKebersihan from '../pages/kebersihan/JadwalKebersihan';
import PermintaanCleaning from '../pages/kebersihan/PermintaanCleaning';
import RiwayatPekerjaan from '../pages/kebersihan/RiwayatPekerjaan';
import AbsensiPetugas from '../pages/kebersihan/AbsensiPetugas';
import PusatInformasi from '../pages/kebersihan/PusatInformasi';
import AbsensiCheckIn from '../pages/kebersihan/AbsensiCheckIn';

import DashboardFasilitas from '../pages/fasilitas/DashboardFasilitas';
import ReservasiMasuk from '../pages/fasilitas/ReservasiMasuk';
import JadwalFasilitas from '../pages/fasilitas/JadwalFasilitas';
import KelolaFasilitas from '../pages/fasilitas/KelolaFasilitas';
import TagihanReservasi from '../pages/fasilitas/TagihanReservasi';
import PusatInformasiFasilitas from '../pages/fasilitas/PusatInformasi';
import AbsensiCheckInFasilitas from '../pages/fasilitas/AbsensiCheckIn';

import Beranda from '../pages/penghuni/Beranda';
import EBilling from '../pages/penghuni/EBilling';
import LaporanKerusakan from '../pages/penghuni/LaporanKerusakan';
import Pengumuman from '../pages/penghuni/Pengumuman';
import PusatInformasiPenghuni from '../pages/penghuni/PusatInformasi';
import FasilitasApartemen from '../pages/penghuni/FasilitasApartemen';
import KontakPengelola from '../pages/penghuni/CustomerService';
import ProfilSaya from '../pages/penghuni/ProfilSaya';

import DashboardKeamanan from '../pages/keamanan/DashboardKeamanan';
import LogTamu from '../pages/keamanan/LogTamu';
import LogParkir from '../pages/keamanan/LogParkir';
import BroadcastPesan from '../pages/keamanan/BroadcastPesan';
import AbsensiSatpam from '../pages/keamanan/AbsensiSatpam';

import LoginPage from '../pages/auth/LoginPage';
import OnboardingPage from '../pages/auth/OnboardingPage';
// RegisterPage sengaja tetap di-import agar tidak error di sidebar Explorer VS Code kamu, tapi tidak dipakai di rute manapun.
import RegisterPage from '../pages/auth/RegisterPage'; 
import ForgotPassword from '../pages/auth/ForgotPassword';
import RolePickerPage from '../pages/auth/RolePickerPage';
import Unauthorized from '../pages/Unauthorized';

// Keuangan Pages
import DashboardKeuangan from '../pages/keuangan/DashboardKeuangan';
import TagihanEBilling from '../pages/keuangan/TagihanEBilling';
import RekonsiliPembayaran from '../pages/keuangan/RekonsiliPembayaran';
import LaporanPengeluaran from '../pages/keuangan/LaporanPengeluaran';
import LaporanPendapatan from '../pages/keuangan/LaporanPendapatan';
import PendapatanFasilitas from '../pages/keuangan/PendapatanFasilitas';
import AbsensiKaryawan from '../pages/keuangan/AbsensiKaryawan';
import AbsensiCheckInKeuangan from '../pages/keuangan/AbsensiCheckIn';
import ChatKeuangan  from '../pages/keuangan/ChatKeuangan';
import ChatFasilitas from '../pages/fasilitas/ChatFasilitas';
import KelolaPenghuniKeuangan from '../pages/keuangan/KelolaPenghuniKeuangan';

import ProtectedRoute from '../components/shared/ProtectedRoute';
import AttendanceGuard from '../components/shared/AttendanceGuard';
import SharedAbsensiCheckIn from '../pages/shared/AbsensiCheckIn';
import NotifikasiPage from '../pages/shared/NotifikasiPage';
import Homepage from '../pages/superadmin/Homepage';
import Dashboard from '../pages/superadmin/Dashboard';
import DataTower from '../pages/superadmin/DataTower';
import DataUnit from '../pages/superadmin/DataUnit';
import ManajemenFasilitas from '../pages/superadmin/ManajemenFasilitas';
import DataPenghuni from '../pages/superadmin/DataPenghuni';
import DataAdminDivisi from '../pages/superadmin/DataAdminDivisi';
import AbsenKaryawan from '../pages/superadmin/AbsenKaryawan';
import LaporanKeuangan from '../pages/superadmin/LaporanKeuangan';
import GrafikMonitoring from '../pages/superadmin/GrafikMonitoring';
import AuditLog from '../pages/superadmin/AuditLog';
import PusatInformasiSuperAdmin from '../pages/superadmin/PusatInformasi';

const router = createBrowserRouter([
  {
    path: '/',
    element: <OnboardingPage />,
  },
  {
    path: '/pemeliharaan',
    element: <AttendanceGuard><PemeliharaanLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to="/pemeliharaan/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardTiket />,
      },
      {
        path: 'tiket',
        element: <TiketKerusakan />,
      },
      {
        path: 'riwayat',
        element: <RiwayatPerbaikan />,
      },
      {
        path: 'chat',
        element: <CSLiveChat />,
      },
      {
        path: 'absensi',
        element: <AbsensiTeknisi />,
      },
    ],
  },
  {
    path: '/kebersihan',
    element: <AttendanceGuard><KebersihanLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to={ROUTES.KEBERSIHAN.JADWAL} replace />,
      },
      {
        path: 'jadwal',
        element: <JadwalKebersihan />,
      },
      {
        path: 'permintaan',
        element: <PermintaanCleaning />,
      },
      {
        path: 'riwayat',
        element: <RiwayatPekerjaan />,
      },
      {
        path: 'absensi',
        element: <AbsensiPetugas />,
      },
      {
        path: 'informasi',
        element: <PusatInformasi />,
      },
    ],
  },
  {
    path: '/keamanan',
    element: <AttendanceGuard><KeamananLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to={ROUTES.KEAMANAN.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardKeamanan />,
      },
      {
        path: 'tamu',
        element: <LogTamu />,
      },
      {
        path: 'parkir',
        element: <LogParkir />,
      },
      {
        path: 'broadcast',
        element: <BroadcastPesan />,
      },
      {
        path: 'absensi',
        element: <AbsensiSatpam />,
      },
    ],
  },
  {
    path: '/fasilitas',
    element: <AttendanceGuard><FasilitasLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to={ROUTES.FASILITAS.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardFasilitas />,
      },
      {
        path: 'reservasi',
        element: <ReservasiMasuk />,
      },
      {
        path: 'jadwal',
        element: <JadwalFasilitas />,
      },
      {
        path: 'kelola',
        element: <KelolaFasilitas />,
      },
      {
        path: 'tagihan',
        element: <TagihanReservasi />,
      },
      {
        path: 'chat',
        element: <ChatFasilitas />,
      },
      {
        path: 'informasi',
        element: <PusatInformasiFasilitas />,
      },
    ],
  },
  {
    path: '/penghuni',
    element: <PenghuniLayout />,
    children: [
      {
        path: '',
        element: <Navigate to={ROUTES.PENGHUNI.DASHBOARD} replace />,
      },
      {
        path: 'beranda',
        element: <Beranda />,
      },
      {
        path: 'billing',
        element: <EBilling />,
      },
      {
        path: 'laporan',
        element: <LaporanKerusakan />,
      },
      {
        path: 'pengumuman',
        element: <Pengumuman />,
      },
      {
        path: 'informasi',
        element: <PusatInformasiPenghuni />,
      },
      {
        path: 'fasilitas',
        element: <FasilitasApartemen />,
      },
      {
        path: 'cs',
        element: <KontakPengelola />,
      },
      {
        path: 'profil',
        element: <ProfilSaya />,
      },
    ],
  },
  {
    path: '/keuangan',
    element: <AttendanceGuard><KeuanganLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to={ROUTES.KEUANGAN.DASHBOARD} replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardKeuangan />,
      },
      {
        path: 'billing',
        element: <TagihanEBilling />,
      },
      {
        path: 'reconcile',
        element: <RekonsiliPembayaran />,
      },
      {
        path: 'expense',
        element: <LaporanPengeluaran />,
      },
      {
        path: 'revenue',
        element: <LaporanPendapatan />,
      },
      {
        path: 'facility',
        element: <PendapatanFasilitas />,
      },
      {
        path: 'chat',
        element: <ChatKeuangan />,
      },
      {
        path: 'absen',
        element: <AbsensiKaryawan />,
      },
      {
        path: 'residents',
        element: <KelolaPenghuniKeuangan />,
      },
    ],
  },
  {
    path: ROUTES.KEBERSIHAN.CHECKIN,
    element: <AbsensiCheckIn />,
  },
  {
    path: ROUTES.FASILITAS.CHECKIN,
    element: <AbsensiCheckInFasilitas />,
  },
  {
    path: ROUTES.KEUANGAN.CHECKIN,
    element: <AbsensiCheckInKeuangan />,
  },
  {
    path: '/absensi',
    element: <SharedAbsensiCheckIn />,
  },
  {
    path: '/notifikasi',
    element: <NotifikasiPage />,
  },
  {
    path: '/super-admin',
    element: <AttendanceGuard><SuperAdminLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Homepage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tower',
        element: <DataTower />,
      },
      {
        path: 'unit',
        element: <DataUnit />,
      },
      {
        path: 'fasilitas',
        element: <ManajemenFasilitas />,
      },
      {
        path: 'penghuni',
        element: <DataPenghuni />,
      },
      {
        path: 'admin',
        element: <DataAdminDivisi />,
      },
      {
        path: 'absen',
        element: <AbsenKaryawan />,
      },
      {
        path: 'laporan',
        element: <LaporanKeuangan />,
      },
      {
        path: 'grafik',
        element: <GrafikMonitoring />,
      },
      {
        path: 'audit',
        element: <AuditLog />,
      },
      {
        path: 'informasi',
        element: <PusatInformasiSuperAdmin />,
      },
    ],
  },
  {
    path: '/superadmin',
    element: <AttendanceGuard><SuperAdminLayout /></AttendanceGuard>,
    children: [
      {
        path: '',
        element: <Navigate to="/superadmin/homepage" replace />,
      },
      {
        path: 'homepage',
        element: <Homepage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tower',
        element: <DataTower />,
      },
      {
        path: 'unit',
        element: <DataUnit />,
      },
      {
        path: 'fasilitas',
        element: <ManajemenFasilitas />,
      },
      {
        path: 'penghuni',
        element: <DataPenghuni />,
      },
      {
        path: 'admin',
        element: <DataAdminDivisi />,
      },
      {
        path: 'absen',
        element: <AbsenKaryawan />,
      },
      {
        path: 'laporan',
        element: <LaporanKeuangan />,
      },
      {
        path: 'grafik',
        element: <GrafikMonitoring />,
      },
      {
        path: 'audit',
        element: <AuditLog />,
      },
      {
        path: 'informasi',
        element: <PusatInformasiSuperAdmin />,
      },
    ],
  },
  {
    path: '/pilih-role',
    element: <RolePickerPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        // ✨ SEKARANG DI-HIDE BERSIDANG: Objek rute register dilempar balik ke Home/Onboarding otomatis
        path: '/register',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);

export default router;