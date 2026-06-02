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
