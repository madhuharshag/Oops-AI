import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PlusCircle, FlaskConical } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  primaryActionText?: string;
  primaryActionLink?: string;
  secondaryActionText?: string;
  secondaryActionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Your security workspace is empty.",
  description = "Register your first AI agent or explore Oops! Labs to begin testing against adversarial vectors.",
  primaryActionText = "Create First Agent",
  primaryActionLink = "/agents/new",
  secondaryActionText = "Explore Oops! Labs",
  secondaryActionLink = "/labs",
}) => {
  return (
    <div className="cyber-card p-10 text-center max-w-xl mx-auto my-8 border-dashed border-slate-700 bg-slate-900/40">
      <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {primaryActionLink && (
          <Link
            to={primaryActionLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            {primaryActionText}
          </Link>
        )}
        {secondaryActionLink && (
          <Link
            to={secondaryActionLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition"
          >
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            {secondaryActionText}
          </Link>
        )}
      </div>
    </div>
  );
};
