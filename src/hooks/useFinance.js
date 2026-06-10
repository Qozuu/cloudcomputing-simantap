import { useState, useEffect } from 'react';
import { financeService } from '../services/financeService';

export function useFinance() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    financeService.getExpenses()
      .then(data => setExpenses(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { expenses, loading, error };
}