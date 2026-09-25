import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-primary tracking-tight">
              Oops! <span className="text-cyan-600 dark:text-cyan-400">AI</span>
            </span>
            <p className="text-xs text-secondary">
              Break it. Understand it. Fix it. Trust it.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-secondary font-medium">
          <Link to="/about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">About & Ethics</Link>
          <Link to="/privacy" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">Terms of Service</Link>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            API Documentation
          </a>
          <a
            href="https://github.com/madhuharshag/Oops-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        <div className="text-xs text-muted font-mono flex items-center gap-1">
          Built for AI Security, Privacy & Trust Hackathon 2025
        </div>
      </div>
    </footer>
  );
};
