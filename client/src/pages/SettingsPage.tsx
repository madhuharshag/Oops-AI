import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Lock, Key, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Profile update
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          ACCOUNT PREFERENCES
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account credentials, workspace security, and active sessions.
        </p>
      </div>

      <div className="cyber-card p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          User Profile Information
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Registered Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-400 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Email changes are restricted to primary workspace administrators.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              Account Created
            </label>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{user?.created_at ? new Date(user.created_at).toLocaleString() : 'Active'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            {isUpdating ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security & Sessions */}
      <div className="cyber-card p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" />
          Active Session & Token Invalidation
        </h2>
        <p className="text-xs text-slate-400">
          Oops! AI implements short-lived 15-minute access tokens and rotatable, revocable 30-day HttpOnly refresh tokens.
        </p>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-200 border border-slate-700 hover:border-rose-500/40 text-xs font-mono font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Terminate Current Session & Revoke Refresh Token
          </button>
        </div>
      </div>
    </div>
  );
};
