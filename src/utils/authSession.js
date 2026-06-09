// src/utils/authSession.js
// Disesuaikan dengan schema database: tabel users, absensi, dst.

// ─────────────────────────────────────────
// ROLE MAPPING
// DB pakai prefix 'admin_', frontend tidak
// ─────────────────────────────────────────
export const ROLE_MAP = {
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
// ─────────────────────────────────────────
const BYPASS_ATTENDANCE = ['super_admin', 'penghuni', 'sdm'];

export function needsAttendance(frontendRole) {
  return !BYPASS_ATTENDANCE.includes(frontendRole);
}

// ─────────────────────────────────────────
// SESSION STORAGE KEYS
// ─────────────────────────────────────────
export const SESSION_KEYS = {
  ROLE:               'smt_role',        
  DB_ROLE:            'smt_db_role',     
  INTENDED_ROUTE:     'smt_intended',    
  USER_ID:            'smt_user_id',     
  USER_NAME:          'smt_nama',        
  USER_EMAIL:         'smt_email',       
  USER_NO_HP:         'smt_no_hp',       
  CHECKIN_TIME:       'smt_masuk',       
  CHECKOUT_TIME:      'smt_keluar',      
  CHECKIN_DATE:       'smt_tgl',         
  ABSENSI_ID:         'smt_absensi_id',  
  MUST_CHANGE_PW:     'smt_must_pw',     
  POST_CHECKIN_ROUTE: 'smt_post_checkin',
};

// ─────────────────────────────────────────
// SESSION: SIMPAN & BACA
// ─────────────────────────────────────────
export function saveSession(frontendRole, targetRoute, userProfile = {}) {
  sessionStorage.setItem(SESSION_KEYS.ROLE,           frontendRole);
  sessionStorage.setItem(SESSION_KEYS.DB_ROLE,        userProfile.role || ROLE_MAP[frontendRole] || frontendRole);
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
// ABSENSI UTILS
// ─────────────────────────────────────────
export function saveCheckIn(jamMasuk, absensiRowId = '') {
  const today = new Date().toLocaleDateString('id-ID');
  sessionStorage.setItem(SESSION_KEYS.CHECKIN_TIME, jamMasuk);
  sessionStorage.setItem(SESSION_KEYS.CHECKIN_DATE, today);
  sessionStorage.setItem(SESSION_KEYS.ABSENSI_ID,   absensiRowId);
}

export function saveCheckOut(jamKeluar) {
  sessionStorage.setItem(SESSION_KEYS.CHECKOUT_TIME, jamKeluar);
}

export function hasCheckedInToday() {
  const today      = new Date().toLocaleDateString('id-ID');
  const savedDate  = sessionStorage.getItem(SESSION_KEYS.CHECKIN_DATE);
  const savedTime  = sessionStorage.getItem(SESSION_KEYS.CHECKIN_TIME);
  return savedDate === today && !!savedTime;
}

export function isCheckoutMode() {
  return hasCheckedInToday() && !sessionStorage.getItem(SESSION_KEYS.CHECKOUT_TIME);
}

export function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// ─────────────────────────────────────────
// MUST CHANGE PASSWORD KEYS
// ─────────────────────────────────────────
export function setMustChangePassword(value) {
  sessionStorage.setItem(SESSION_KEYS.MUST_CHANGE_PW, String(value));
}

export function getMustChangePassword() {
  return sessionStorage.getItem(SESSION_KEYS.MUST_CHANGE_PW) === 'true';
}

export function setPostCheckinRoute(path) {
  sessionStorage.setItem(SESSION_KEYS.POST_CHECKIN_ROUTE, path);
}

export function getPostCheckinRoute() {
  return sessionStorage.getItem(SESSION_KEYS.POST_CHECKIN_ROUTE) || '';
}

export function clearPostCheckinRoute() {
  sessionStorage.removeItem(SESSION_KEYS.POST_CHECKIN_ROUTE);
}