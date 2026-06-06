import { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';

export function useSecurity() {
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [parkingLogs, setParkingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      securityService.getVisitorLogs(),
      securityService.getParkingLogs()
    ])
      .then(([visitorData, parkingData]) => {
        setVisitorLogs(visitorData);
        setParkingLogs(parkingData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { visitorLogs, parkingLogs, loading, error };
}