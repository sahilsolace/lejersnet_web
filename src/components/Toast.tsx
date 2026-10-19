import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 max-w-sm w-full sm:w-auto rounded-card bg-white border border-border shadow-cardLg px-4 py-3 animate-slideUp"
          >
            {iconFor(t.type)}
            <p className="flex-1 text-sm text-ink leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-muted/60 hover:text-ink"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

function iconFor(type: ToastType) {
  const cls = 'shrink-0 mt-0.5';
  switch (type) {
    case 'success':
      return <CheckCircle2 size={18} className={cls + ' text-success'} />;
    case 'error':
      return <XCircle size={18} className={cls + ' text-danger'} />;
    case 'warning':
      return <AlertTriangle size={18} className={cls + ' text-warning'} />;
    default:
      return <Info size={18} className={cls + ' text-accent'} />;
  }
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
