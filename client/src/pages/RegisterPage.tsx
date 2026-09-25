import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password rules validation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isMatch = password === confirmPassword && password.length > 0;

  const isPasswordStrong = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError('Password does not meet required security strength complexity.');
      return;
    }

    if (!isMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, confirmPassword);
      showToast('Registration successful! Welcome to Oops! AI.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Registration failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed.';
      setError(msg);
      showToast(msg, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="cyber-card p-8 sm:p-10 w-full max-w-lg border-cyan-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 text-cyan-600 dark:text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Create your account</h1>
          <p className="text-xs text-secondary mt-1 font-mono">
            Deploy secure AI agents with full behavioral testing.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 dark:bg-rose-950/50 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-surface-muted hover:bg-surface border border-border hover:border-cyan-500/50 text-primary font-medium text-sm transition flex items-center justify-center gap-3 shadow-sm mb-4"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-border w-full"></div>
          <span className="bg-surface px-3 text-[10px] font-mono uppercase tracking-wider text-muted shrink-0">
            or register with email
          </span>
          <div className="border-t border-border w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent Security Engineer"
                className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

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
                placeholder="engineer@corp.io"
                className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1.5">
                Password
              </label>
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

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-sm text-primary placeholder-muted focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Password Security Complexity Feedback */}
          <div className="p-3 bg-surface-muted rounded-lg border border-border text-[11px] font-mono space-y-1">
            <span className="text-secondary block mb-1 font-semibold uppercase text-[10px]">
              Password Requirements:
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className={hasMinLen ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {hasMinLen ? '✓' : '•'} 8+ characters
              </span>
              <span className={hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {hasUpper ? '✓' : '•'} 1 Uppercase
              </span>
              <span className={hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {hasLower ? '✓' : '•'} 1 Lowercase
              </span>
              <span className={hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {hasNumber ? '✓' : '•'} 1 Number
              </span>
              <span className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {hasSpecial ? '✓' : '•'} 1 Special char
              </span>
              <span className={isMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted'}>
                {isMatch ? '✓' : '•'} Passwords match
              </span>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              id="agree"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 rounded bg-surface-muted border-border text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="agree" className="text-xs text-secondary">
              I agree to the{' '}
              <Link to="/terms" className="text-cyan-600 dark:text-cyan-400 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Policy</Link>, and acknowledge testing remains within ethical bounds.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordStrong || !isMatch}
            className="w-full mt-4 py-2.5 px-4 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:opacity-40 text-white dark:text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-secondary">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
