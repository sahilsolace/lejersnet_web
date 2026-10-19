import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'sm' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'md' ? 'max-w-lg' : 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxW} bg-white rounded-t-card sm:rounded-card shadow-cardLg animate-slideUp sm:animate-scaleIn max-h-[92vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink p-1 rounded-lg"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
}: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
      <div className="mt-5 flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-ink-muted hover:bg-bg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
            danger ? 'bg-danger hover:bg-danger/90' : 'bg-navy hover:bg-navy-dark'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
