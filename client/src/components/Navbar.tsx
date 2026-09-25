import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ShieldCheck, LogOut, LayoutDashboard, FlaskConical, Menu, X, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-sm shadow-cyan-500/10">
            <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Oops! <span className="text-cyan-400">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-slate-400 -mt-1">
              Autonomous AI Security
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition">
            Overview
          </Link>
          <Link to={user ? "/labs" : "/login"} className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            Oops! Labs
          </Link>
          <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition">
            About & Ethics
          </Link>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            API Docs
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold hover:bg-cyan-500/20 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Console
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <span className="text-xs text-slate-300 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                Enter Oops! Labs
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0d1117] px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 py-1"
          >
            Overview
          </Link>
          <Link
            to={user ? "/labs" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 py-1"
          >
            Oops! Labs
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 py-1"
          >
            About & Ethics
          </Link>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium text-slate-400 py-1"
          >
            API Docs
          </a>
          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-cyan-400"
                >
                  Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-sm font-medium text-rose-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-slate-800 text-white text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-bold"
                >
                  Enter Oops! Labs
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
