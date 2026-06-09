import { useState, useEffect } from 'react';
import { unitService } from '../services/unitService';

export function useUnit() {
  const [towers, setTowers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      unitService.getTowers(),
      unitService.getUnits()
    ])
      .then(([towerData, unitData]) => {
        setTowers(towerData);
        setUnits(unitData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { towers, units, loading, error };
}