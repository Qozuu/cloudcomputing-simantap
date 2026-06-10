import { useState, useEffect } from 'react';
import { maintenanceService } from '../services/maintenanceService';

export function useMaintenance() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    maintenanceService.getTiket()
      .then(data => setTickets(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { tickets, loading, error };
}