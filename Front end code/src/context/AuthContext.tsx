import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farmer } from '../types';
import { apiService } from '../services/api';
import safeStorage, { StorageKeys } from '../services/storage';

interface AuthContextType {
  user: Farmer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, pass: string) => Promise<void>;
  demoLogin: (role?: 'farmer' | 'admin') => Promise<void>;
  otpLogin: (mobile: string, otp: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const token = await safeStorage.getItem(StorageKeys.AUTH_TOKEN);
      const cachedProfile = await safeStorage.getItem(StorageKeys.USER_PROFILE);
      
      if (cachedProfile) {
        setUser(JSON.parse(cachedProfile));
      }
      
      if (token) {
        const freshUser = await apiService.getMe();
        setUser(freshUser);
      }
    } catch (error) {
      console.log('Session expired or offline fallback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (mobile: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiService.login(mobile, pass);
      setUser(res.farmer);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'farmer' | 'admin' = 'farmer') => {
    setIsLoading(true);
    try {
      const res = await apiService.demoLogin(role);
      setUser(res.farmer);
    } finally {
      setIsLoading(false);
    }
  };

  const otpLogin = async (mobile: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await apiService.otpLogin(mobile, otp);
      setUser(res.farmer);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await apiService.register(data);
      setUser(res.farmer);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const fresh = await apiService.getMe();
      setUser(fresh);
    } catch (e) {
      console.warn('Could not refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        otpLogin,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
