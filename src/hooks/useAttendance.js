import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';

export function useAttendance(date = new Date().toISOString().split('T')[0]) {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    attendanceService.getByDate(date)
      .then(data => setAttendanceLogs(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [date]);

  return { attendanceLogs, loading, error };
}