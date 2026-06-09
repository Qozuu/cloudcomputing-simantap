// Contains API endpoints mapped to backend REST endpoints.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  SUPER_ADMIN: {
    USERS: '/super-admin/users',
    SETTINGS: '/super-admin/settings',
    LOGS: '/super-admin/logs',
  },
  PEMELIHARAAN: {
    REPORTS: '/pemeliharaan/reports',
    TASKS: '/pemeliharaan/tasks',
  },
  KEUANGAN: {
    BILLING: '/keuangan/billing',
    PAYMENTS: '/keuangan/payments',
    REPORTS: '/keuangan/reports',
  },
  KEBERSIHAN: {
    SCHEDULES: '/kebersihan/schedules',
    REPORTS: '/kebersihan/reports',
  },
  KEAMANAN: {
    VISITORS: '/keamanan/visitors',
    INCIDENTS: '/keamanan/incidents',
  },
  FASILITAS: {
    FACILITIES: '/fasilitas',
    BOOKINGS: '/fasilitas/bookings',
  },
  PENGHUNI: {
    DASHBOARD: '/penghuni/dashboard',
    BILLING: '/penghuni/billing',
    BOOKINGS: '/penghuni/bookings',
    REPORTS: '/penghuni/reports',
  }
};
