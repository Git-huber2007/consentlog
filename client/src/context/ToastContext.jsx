import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const styles = {
            success:
              'bg-white dark:bg-slate-900 border-l-4 border-emerald-500 text-slate-800 dark:text-slate-100',
            error:
              'bg-white dark:bg-slate-900 border-l-4 border-rose-500 text-slate-800 dark:text-slate-100',
            warning:
              'bg-white dark:bg-slate-900 border-l-4 border-amber-500 text-slate-800 dark:text-slate-100',
            info: 'bg-white dark:bg-slate-900 border-l-4 border-indigo-500 text-slate-800 dark:text-slate-100',
          };

          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />,
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
                styles[t.type] || styles.info
              }`}
            >
              {icons[t.type] || icons.info}
              <div className="flex-1 text-sm">
                {t.title && <p className="font-semibold mb-0.5">{t.title}</p>}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

