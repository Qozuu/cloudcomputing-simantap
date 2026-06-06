import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState({ name: 'John Doe', role: 'super_admin' }); // Temporary mock data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return {
    user,
    loading,
    error,
    login: async (email, password) => authService.login(email, password),
    logout: async () => authService.logout()
  };
};