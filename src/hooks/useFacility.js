import { useState, useEffect } from 'react';
import { facilityService } from '../services/facilityService';

export function useFacility() {
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      facilityService.getFasilitas(),
      facilityService.getReservasi()
    ])
      .then(([facilityData, reservationData]) => {
        setFacilities(facilityData);
        setReservations(reservationData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { facilities, reservations, loading, error };
}