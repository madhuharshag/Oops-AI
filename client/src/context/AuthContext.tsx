import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAccessToken, getAccessToken } from '../services/api';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      // First check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session.user) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        });
        setIsLoading(false);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        // Try silent refresh
        try {
          const { data } = await api.post('/auth/refresh');
          setAccessToken(data.accessToken);
          setUser(data.user);
          setIsLoading(false);
          return;
        } catch {
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Listen for Supabase OAuth redirects and session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token && session.user) {
        setAccessToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        });
        setIsLoading(false);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const loginWithGoogle = async () => {
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout error', err);
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase logout error', err);
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
