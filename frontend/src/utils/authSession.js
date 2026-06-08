export const SESSION_KEYS = {
  ROLE:           'simantap_role',
  INTENDED_ROUTE: 'simantap_intended',
  CHECKIN_TIME:   'simantap_checkin',
  CHECKOUT_TIME:  'simantap_checkout',
  CHECKIN_DATE:   'simantap_checkin_date',
  USERNAME:       'simantap_username',
};

export function saveSession(role, intendedRoute, username) {
  sessionStorage.setItem(SESSION_KEYS.ROLE, role || '');
  sessionStorage.setItem(SESSION_KEYS.INTENDED_ROUTE, intendedRoute || '');
  sessionStorage.setItem(SESSION_KEYS.USERNAME, username || '');
}

export function getSession() {
  return {
    role:          sessionStorage.getItem(SESSION_KEYS.ROLE) || '',
    intendedRoute: sessionStorage.getItem(SESSION_KEYS.INTENDED_ROUTE) || '/login',
    username:      sessionStorage.getItem(SESSION_KEYS.USERNAME) || '',
    checkinTime:   sessionStorage.getItem(SESSION_KEYS.CHECKIN_TIME) || '',
    checkoutTime:  sessionStorage.getItem(SESSION_KEYS.CHECKOUT_TIME) || '',
    checkinDate:   sessionStorage.getItem(SESSION_KEYS.CHECKIN_DATE) || '',
  };
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEYS.ROLE);
  sessionStorage.removeItem(SESSION_KEYS.INTENDED_ROUTE);
  sessionStorage.removeItem(SESSION_KEYS.USERNAME);
  sessionStorage.removeItem(SESSION_KEYS.CHECKIN_TIME);
  sessionStorage.removeItem(SESSION_KEYS.CHECKOUT_TIME);
  sessionStorage.removeItem(SESSION_KEYS.CHECKIN_DATE);
}

export function needsAttendance(role) {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return ['keuangan', 'pemeliharaan', 'kebersihan', 'keamanan', 'fasilitas'].includes(normalized);
}

export function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export function hasCheckedInToday() {
  const checkinDate = sessionStorage.getItem(SESSION_KEYS.CHECKIN_DATE);
  if (!checkinDate) return false;
  return checkinDate === getLocalDateString();
}

export function isCheckoutMode() {
  return hasCheckedInToday() && !sessionStorage.getItem(SESSION_KEYS.CHECKOUT_TIME);
}

// src/utils/authSession.js
// Disesuaikan dengan schema database: tabel users, absensi, dst.

// ─────────────────────────────────────────
// ROLE MAPPING
// DB pakai prefix 'admin_', frontend tidak
// ─────────────────────────────────────────
export const ROLE_MAP = {
  // frontend role    → database role
  super_admin:        'super_admin',
  keuangan:           'admin_keuangan',
  pemeliharaan:       'admin_pemeliharaan',
  kebersihan:         'admin_kebersihan',
  keamanan:           'admin_keamanan',
  fasilitas:          'admin_fasilitas',
  sdm:                'admin_sdm',
  penghuni:           'penghuni',
};

export const ROLE_MAP_REVERSE = {
  // database role    → frontend role
  super_admin:        'super_admin',
  admin_keuangan:     'keuangan',
  admin_pemeliharaan: 'pemeliharaan',
  admin_kebersihan:   'kebersihan',
  admin_keamanan:     'keamanan',
  admin_fasilitas:    'fasilitas',
  admin_sdm:          'sdm',
  penghuni:           'penghuni',
};

// ─────────────────────────────────────────
// ROUTE PER ROLE (sesuai router/index.jsx)
// ─────────────────────────────────────────
export const ROLE_ROUTES = {
  super_admin:  '/superadmin/homepage',
  keuangan:     '/keuangan/dashboard',
  pemeliharaan: '/pemeliharaan/dashboard',
  kebersihan:   '/kebersihan/jadwal',
  fasilitas:    '/fasilitas/dashboard',
  keamanan:     '/keamanan/dashboard',
  sdm:          '/superadmin/homepage',
  penghuni:     '/penghuni/beranda',
};

// ─────────────────────────────────────────
// ROLE YANG BYPASS ABSENSI
// super_admin & penghuni tidak perlu check-in
// (sesuai tabel absensi: hanya karyawan)
// ─────────────────────────────────────────
const BYPASS_ATTENDANCE = ['super_admin', 'penghuni', 'sdm'];

export function needsAttendance(frontendRole) {
  return !BYPASS_ATTENDANCE.includes(frontendRole);
}

// ─────────────────────────────────────────
// SESSION STORAGE KEYS
// ─────────────────────────────────────────
export const SESSION_KEYS = {
  ROLE:               'smt_role',        // frontend role
  DB_ROLE:            'smt_db_role',     // role asli dari DB
  INTENDED_ROUTE:     'smt_intended',    // route tujuan setelah login
  USER_ID:            'smt_user_id',     // UUID dari tabel users
  USER_NAME:          'smt_nama',        // kolom nama dari tabel users
  USER_EMAIL:         'smt_email',       // kolom email dari tabel users
  USER_NO_HP:         'smt_no_hp',       // kolom no_hp dari tabel users
  CHECKIN_TIME:       'smt_masuk',       // jam_masuk (TIME)
  CHECKOUT_TIME:      'smt_keluar',      // jam_keluar (TIME)
  CHECKIN_DATE:       'smt_tgl',         // tanggal (DATE)
  ABSENSI_ID:         'smt_absensi_id',  // UUID row absensi hari ini
  MUST_CHANGE_PW:     'smt_must_pw',     // flag ganti password
  POST_CHECKIN_ROUTE: 'smt_post_checkin',
};

// ─────────────────────────────────────────
// SESSION: SIMPAN & BACA
// ─────────────────────────────────────────

/**
 * Simpan session setelah login berhasil.
 * @param {string} frontendRole  - role versi frontend ('keuangan', dst)
 * @param {string} targetRoute   - route tujuan dashboard
 * @param {object} userProfile   - data dari tabel users { id, nama, email, no_hp, role }
 */
export function saveSession(frontendRole, targetRoute, userProfile = {}) {
  sessionStorage.setItem(SESSION_KEYS.ROLE,           frontendRole);
  sessionStorage.setItem(SESSION_KEYS.DB_ROLE,        userProfile.role  || ROLE_MAP[frontendRole] || frontendRole);
  sessionStorage.setItem(SESSION_KEYS.INTENDED_ROUTE, targetRoute);
  sessionStorage.setItem(SESSION_KEYS.USER_ID,        userProfile.id    || '');
  sessionStorage.setItem(SESSION_KEYS.USER_NAME,      userProfile.nama  || '');
  sessionStorage.setItem(SESSION_KEYS.USER_EMAIL,     userProfile.email || '');
  sessionStorage.setItem(SESSION_KEYS.USER_NO_HP,     userProfile.no_hp || '');
}

export function getSession() {
  return {
    role:           sessionStorage.getItem(SESSION_KEYS.ROLE)           || '',
    dbRole:         sessionStorage.getItem(SESSION_KEYS.DB_ROLE)        || '',
    intendedRoute:  sessionStorage.getItem(SESSION_KEYS.INTENDED_ROUTE) || '/login',
    userId:         sessionStorage.getItem(SESSION_KEYS.USER_ID)        || '',
    nama:           sessionStorage.getItem(SESSION_KEYS.USER_NAME)      || '',
    email:          sessionStorage.getItem(SESSION_KEYS.USER_EMAIL)     || '',
    noHp:           sessionStorage.getItem(SESSION_KEYS.USER_NO_HP)     || '',
    checkinTime:    sessionStorage.getItem(SESSION_KEYS.CHECKIN_TIME)   || '',
    checkoutTime:   sessionStorage.getItem(SESSION_KEYS.CHECKOUT_TIME)  || '',
    checkinDate:    sessionStorage.getItem(SESSION_KEYS.CHECKIN_DATE)   || '',
    absensiId:      sessionStorage.getItem(SESSION_KEYS.ABSENSI_ID)     || '',
    mustChangePw:   sessionStorage.getItem(SESSION_KEYS.MUST_CHANGE_PW) === 'true',
  };
}

export function clearSession() {
  Object.values(SESSION_KEYS).forEach(k => sessionStorage.removeItem(k));
}

// ─────────────────────────────────────────
// ABSENSI (sesuai tabel absensi di DB)
// kolom: karyawan_id, tanggal, jam_masuk,
//        jam_keluar, status, lokasi
// ─────────────────────────────────────────

/**
 * Simpan hasil check-in ke sessionStorage.
 * UUID row absensi disimpan untuk dipakai saat check-out (update row yang sama).
 */
export function saveCheckIn(jamMasuk, absensiRowId = '') {
  const today = new Date().toLocaleDateString('id-ID');
  sessionStorage.setItem(SESSION_KEYS.CHECKIN_TIME, jamMasuk);
  sessionStorage.setItem(SESSION_KEYS.CHECKIN_DATE, today);
  sessionStorage.setItem(SESSION_KEYS.ABSENSI_ID,   absensiRowId);
}

export function saveCheckOut(jamKeluar) {
  sessionStorage.setItem(SESSION_KEYS.CHECKOUT_TIME, jamKeluar);
}

/**
 * Cek apakah sudah check-in hari ini.
 * Bandingkan tanggal dengan format lokal Indonesia.
 */
export function hasCheckedInToday() {
  const today      = new Date().toLocaleDateString('id-ID');
  const savedDate  = sessionStorage.getItem(SESSION_KEYS.CHECKIN_DATE);
  const savedTime  = sessionStorage.getItem(SESSION_KEYS.CHECKIN_TIME);
  return savedDate === today && !!savedTime;
}

/**
 * Cek apakah dalam mode check-out
 * (sudah check-in hari ini tapi belum check-out).
 */
export function isCheckoutMode() {
  return hasCheckedInToday() &&
         !sessionStorage.getItem(SESSION_KEYS.CHECKOUT_TIME);
}

// ─────────────────────────────────────────
// MUST CHANGE PASSWORD
// (kolom perlu ditambah di tabel users:
//  must_change_password BOOLEAN DEFAULT FALSE)
// ─────────────────────────────────────────
export function setMustChangePassword(value) {
  sessionStorage.setItem(SESSION_KEYS.MUST_CHANGE_PW, String(value));
}

export function getMustChangePassword() {
  return sessionStorage.getItem(SESSION_KEYS.MUST_CHANGE_PW) === 'true';
}

// ─────────────────────────────────────────
// POST-CHECKIN ROUTE
// Dipakai AttendanceGuard untuk redirect
// kembali ke dashboard setelah check-in
// ─────────────────────────────────────────
export function setPostCheckinRoute(path) {
  sessionStorage.setItem(SESSION_KEYS.POST_CHECKIN_ROUTE, path);
}

export function getPostCheckinRoute() {
  return sessionStorage.getItem(SESSION_KEYS.POST_CHECKIN_ROUTE) || '';
}

export function clearPostCheckinRoute() {
  sessionStorage.removeItem(SESSION_KEYS.POST_CHECKIN_ROUTE);
}