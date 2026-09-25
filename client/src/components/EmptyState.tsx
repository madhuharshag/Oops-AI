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
    <div className="cyber-card p-10 text-center max-w-xl mx-auto my-8 border-dashed border-border">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-600 dark:text-cyan-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
      <p className="text-secondary text-sm max-w-md mx-auto mb-6">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {primaryActionLink && (
          <Link
            to={primaryActionLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            {primaryActionText}
          </Link>
        )}
        {secondaryActionLink && (
          <Link
            to={secondaryActionLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-muted hover:bg-surface text-primary font-medium text-sm border border-border transition"
          >
            <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            {secondaryActionText}
          </Link>
        )}
      </div>
    </div>
  );
};
