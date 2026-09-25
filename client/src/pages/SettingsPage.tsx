import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Lock, Key, AlertTriangle, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme, ThemePreference } from '../context/ThemeContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await api.put('/auth/profile', { name: cleanName });
      if (res.data?.user) {
        showToast('Profile updated successfully.', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update profile.';
      showToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  const themeOptions: Array<{ value: ThemePreference; label: string; desc: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light', desc: 'Clean enterprise interface with light neutral backgrounds', icon: Sun },
    { value: 'dark', label: 'Dark', desc: 'Preserved security operations dark aesthetic with cyan accents', icon: Moon },
    { value: 'system', label: 'System', desc: 'Automatically match your operating system appearance preference', icon: Monitor },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-6 border-b border-border">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          ACCOUNT PREFERENCES
        </span>
        <h1 className="text-2xl font-black text-primary tracking-tight mt-1">
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-secondary mt-1">
          Manage your account credentials, workspace security, theme preferences, and active sessions.
        </p>
      </div>

      {/* Appearance & Theme Selection */}
      <div className="cyber-card p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Appearance
          </span>
          <h2 className="text-base font-bold text-primary flex items-center gap-2 mt-0.5">
            <Sun className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Theme Preference
          </h2>
          <p className="text-xs text-secondary mt-1">
            Choose your preferred interface theme. Selected theme immediately applies across console, labs, and reports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  showToast(`Theme changed to ${opt.label} mode`, 'info');
                }}
                className={`relative flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-border bg-surface-muted hover:border-border-muted'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-white dark:text-slate-950' : 'bg-surface text-secondary'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-primary">{opt.label}</span>
                <span className="text-[11px] text-secondary mt-1 leading-snug">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Information */}
      <div className="cyber-card p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          User Profile Information
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1">
              Registered Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-muted cursor-not-allowed"
            />
            <span className="text-[11px] text-muted mt-1 block">
              Email changes are restricted to primary workspace administrators.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1">
              Account Created
            </label>
            <div className="flex items-center gap-2 text-xs font-mono text-secondary bg-surface-muted p-2.5 rounded-lg border border-border">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{user?.created_at ? new Date(user.created_at).toLocaleString() : 'Active'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition"
          >
            {isUpdating ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security & Sessions */}
      <div className="cyber-card p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-primary flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" />
          Active Session & Token Invalidation
        </h2>
        <p className="text-xs text-secondary">
          Oops! AI implements short-lived 15-minute access tokens and rotatable, revocable 30-day HttpOnly refresh tokens.
        </p>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-muted hover:bg-rose-500/10 hover:text-rose-500 text-secondary border border-border hover:border-rose-500/40 text-xs font-mono font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Terminate Current Session & Revoke Refresh Token
          </button>
        </div>
      </div>
    </div>
  );
};
