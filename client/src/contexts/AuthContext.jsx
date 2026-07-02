import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('credence_token');
      const savedUser = localStorage.getItem('credence_user');

      if (token && savedUser) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expired or invalid
          localStorage.removeItem('credence_token');
          localStorage.removeItem('credence_user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('credence_token', data.token);
    localStorage.setItem('credence_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (username, email, password, confirmPassword) => {
    const { data } = await authAPI.signup({ username, email, password, confirmPassword });
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore logout API errors
    }
    localStorage.removeItem('credence_token');
    localStorage.removeItem('credence_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('credence_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
