import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Close',
  variant = 'primary',
  details = [],
  loading = false,
}) => {
  if (!isOpen) return null;

  const badgeColors = {
    primary: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  const buttonColors = {
    primary: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-zinc-950',
  };

  const Icon =
    variant === 'danger' ? ShieldAlert : variant === 'warning' ? AlertTriangle : CheckCircle2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="enterprise-card max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-md ${badgeColors[variant] || badgeColors.primary}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {description}
          </p>

          {details && details.length > 0 && (
            <div className="mt-4 p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
              <p className="text-[11px] font-medium text-zinc-500">
                Summary
              </p>
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-2 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-opacity ${
              buttonColors[variant] || buttonColors.primary
            } disabled:opacity-50`}
          >
            {loading ? 'Saving...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
