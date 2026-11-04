import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger' | 'warning'
  details = [],
  loading = false,
}) => {
  if (!isOpen) return null;

  const badgeColors = {
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
  };

  const buttonColors = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
  };

  const Icon =
    variant === 'danger' ? ShieldAlert : variant === 'warning' ? AlertTriangle : CheckCircle2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl ${badgeColors[variant] || badgeColors.primary}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cryptographic SHA-256 Audit Ledger Recording
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>

          {details && details.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Audit Record Summary
              </p>
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all ${
              buttonColors[variant] || buttonColors.primary
            } disabled:opacity-50`}
          >
            {loading ? 'Recording in Ledger...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

