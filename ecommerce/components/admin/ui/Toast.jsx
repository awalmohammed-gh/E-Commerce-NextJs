"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { toastVariants } from "@/lib/adminMotion";

/*
  One toast region for the whole admin. Pages call
    const toast = useToast();
    toast.success("Product deleted");
    toast.error("Couldn't delete the product");
  Success toasts close after 4s, errors after 7s. At most 3 are shown.
*/
const ToastContext = createContext(null);

const DURATION = { success: 4000, error: 7000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      if (!message) return;
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-2), { id, type, message }]);
      setTimeout(() => dismiss(id), DURATION[type]);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[500] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const error = toast.type === "error";
            const Icon = error ? AlertCircle : CheckCircle2;

            return (
              <motion.div
                key={toast.id}
                layout
                role={error ? "alert" : "status"}
                variants={toastVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white/88 py-3 pr-2 pl-3.5 shadow-panel backdrop-blur-xl backdrop-saturate-150 sm:w-[360px] ${
                  error ? "border-danger/20" : "border-white/60"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${error ? "text-danger" : "text-success"}`}
                  aria-hidden="true"
                />
                <p className="min-w-0 flex-1 text-sm leading-snug text-ink">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="-my-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
