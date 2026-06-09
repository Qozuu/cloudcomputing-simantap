import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export function useUser() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService.getAll()
      .then(data => setTenants(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { tenants, loading, error };
}