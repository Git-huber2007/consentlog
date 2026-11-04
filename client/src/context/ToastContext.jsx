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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
            error: <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />,
          };

          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg bg-white dark:bg-[#111113] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all duration-200"
            >
              {icons[t.type] || icons.info}
              <div className="flex-1 text-xs">
                {t.title && <p className="font-semibold mb-0.5">{t.title}</p>}
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
