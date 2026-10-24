import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const FeedbackContext = createContext(null);
const TOAST_MS = 4500;

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used inside FeedbackProvider');
  return context;
}

function ConfirmDialog({ request, onResolve }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onResolve(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onResolve]);

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-neutral-100">{request.title}</h2>
        {request.message && <p id="confirm-message" className="mt-2 text-sm text-neutral-400">{request.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onResolve(false)}
            className="min-h-11 rounded-full border border-white/15 px-5 text-sm text-neutral-200 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${request.destructive ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-neutral-100 text-black hover:bg-white'}`}
          >
            {request.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);
  const nextId = useRef(0);

  const toast = useCallback((message, kind = 'info') => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), TOAST_MS);
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setRequest(options);
      }),
    [],
  );

  const resolveConfirm = useCallback((answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setRequest(null);
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[150] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl ${item.kind === 'error' ? 'border-rose-400/40 bg-rose-950/90 text-rose-100' : 'border-white/15 bg-neutral-900/95 text-neutral-100'}`}
          >
            {item.message}
          </div>
        ))}
      </div>
      {request && <ConfirmDialog request={request} onResolve={resolveConfirm} />}
    </FeedbackContext.Provider>
  );
}
