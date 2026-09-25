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

function sanitizeProfileString(val: any, fallback: string = ''): string {
  if (typeof val !== 'string') return fallback;
  let clean = val.trim();
  // Remove surrounding quotes if double-stringified
  clean = clean.replace(/^["']|["']$/g, '').trim();
  try {
    if (clean.includes('%')) {
      clean = decodeURIComponent(clean);
    }
  } catch {}
  return clean || fallback;
}

function extractCleanUserData(userObj: any, metadata: any): User {
  const id = sanitizeProfileString(userObj?.id);
  const rawEmail = userObj?.email || metadata?.email || '';
  const email = sanitizeProfileString(rawEmail).toLowerCase();

  // Multi-tier priority name extraction
  let name = sanitizeProfileString(
    metadata?.full_name ||
    metadata?.name ||
    metadata?.user_name ||
    metadata?.display_name ||
    userObj?.name ||
    ''
  );

  // If no name or placeholder, derive clean display name from email
  if (!name || name === 'User' || name === 'undefined' || name === 'null') {
    if (email && email.includes('@')) {
      const prefix = email.split('@')[0];
      name = prefix
        .split(/[._-]/)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    } else {
      name = 'Security Operator';
    }
  }

  const avatar_url = sanitizeProfileString(
    metadata?.avatar_url || metadata?.picture || userObj?.avatar_url || ''
  ) || null;

  return {
    id,
    email,
    name,
    avatar_url,
    created_at: userObj?.created_at,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      // 1. Check Supabase OAuth / persistent session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session.user) {
        setAccessToken(session.access_token);
        const cleanUser = extractCleanUserData(session.user, session.user.user_metadata);
        setUser(cleanUser);

        // Fetch / sync backend profile in background
        api.get('/auth/me').then(res => {
          if (res.data?.user) {
            setUser(prev => ({
              ...prev,
              ...extractCleanUserData(res.data.user, null)
            }));
          }
        }).catch(() => {});

        setIsLoading(false);
        return;
      }

      // 2. Check local token for email/password sessions
      const token = getAccessToken();
      if (!token) {
        try {
          const { data } = await api.post('/auth/refresh');
          setAccessToken(data.accessToken);
          setUser(extractCleanUserData(data.user, null));
          setIsLoading(false);
          return;
        } catch {
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      const { data } = await api.get('/auth/me');
      setUser(extractCleanUserData(data.user, null));
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
        const cleanUser = extractCleanUserData(session.user, session.user.user_metadata);
        setUser(cleanUser);

        api.get('/auth/me').then(res => {
          if (res.data?.user) {
            setUser(prev => ({
              ...prev,
              ...extractCleanUserData(res.data.user, null)
            }));
          }
        }).catch(() => {});

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
    setUser(extractCleanUserData(data.user, null));
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
    setAccessToken(data.accessToken);
    setUser(extractCleanUserData(data.user, null));
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
