import { useState, useEffect } from 'react';
import { cleaningService } from '../services/cleaningService';

export function useCleaning() {
  const [schedules, setSchedules] = useState([]);
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      cleaningService.getSchedules(),
      cleaningService.getCleaningRequests()
    ])
      .then(([scheduleData, requestData]) => {
        setSchedules(scheduleData);
        setCleaningRequests(requestData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { schedules, cleaningRequests, loading, error };
}