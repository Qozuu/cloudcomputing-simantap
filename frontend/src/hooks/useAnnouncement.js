import { useState, useEffect } from 'react';
import { announcementService } from '../services/announcementService';

export function useAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    announcementService.getActiveAnnouncements()
      .then(data => setAnnouncements(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { announcements, loading, error };
}