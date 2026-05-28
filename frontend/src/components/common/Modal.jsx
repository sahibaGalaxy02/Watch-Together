import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-[26rem]',
    md: 'max-w-[32rem]',
    lg: 'max-w-[40rem]',
    xl: 'max-w-[48rem]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:py-8"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 bg-[#05050d]/85 backdrop-blur-md animate-fade-in" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,26,77,0.18),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,0.16),transparent_34%)] animate-fade-in" />

      <div
        className={`relative w-full ${sizes[size]} overflow-hidden rounded-2xl border border-white/15 bg-surface-900/95 shadow-2xl shadow-black/50 backdrop-blur-2xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-6 -top-24 h-44 rounded-full bg-brand-500/10 blur-3xl" />

        {title && (
          <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-300/80">
                WatchTogether
              </p>
              <h2 id="modal-title" className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/60 shadow-lg shadow-black/20 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="relative px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
