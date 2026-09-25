import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      showToast('Authentication successful. Welcome back!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('secops.lead@oops-ai.test');
    setPassword('CyberSecure99!');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="cyber-card p-8 sm:p-10 w-full max-w-md border-cyan-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 text-cyan-600 dark:text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Welcome back.</h1>
          <p className="text-xs text-secondary mt-1 font-mono">
            Continue securing your AI agents.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 dark:bg-rose-950/50 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@corp.io"
                className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-secondary">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick-Fill */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-xs font-mono text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-200 flex items-center justify-center gap-1.5 mx-auto transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick-fill demo credentials
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
