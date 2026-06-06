import { useState, useEffect } from 'react';
import { billingService } from '../services/billingService';

export function useBilling() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    billingService.getAll()
      .then(data => setBills(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { bills, loading, error };
}