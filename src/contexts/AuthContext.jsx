import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://192.168.0.10:8080/api';

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  function logout() {
    apiService.logout();
    setCurrentUser(null);
  }

  useEffect(() => {
    // Sayfa yüklendiğinde token kontrolü
    if (apiService.isAuthenticated()) {
      // Token varsa kullanıcı bilgilerini al
      // Bu örnekte basitlik için localStorage'dan alıyoruz
      const userData = localStorage.getItem('userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
