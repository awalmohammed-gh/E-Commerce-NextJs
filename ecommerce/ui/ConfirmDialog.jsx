"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Yes",
  cancelText = "No",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  // Focus the safe choice when opening; Escape cancels
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-ink/40 z-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-301 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby={message ? "confirm-message" : undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto w-full max-w-sm bg-white rounded-sm shadow-[0_16px_40px_rgba(28,26,23,0.18)] p-6"
            >
              <h3 id="confirm-title" className="text-lg font-semibold text-ink">
                {title}
              </h3>

              {message && (
                <p id="confirm-message" className="text-sm text-muted mt-2 leading-relaxed">
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="min-h-11 text-sm font-medium text-ink-soft hover:bg-cream px-4 rounded-[3px] transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="min-h-11 text-sm font-medium bg-ink text-cream px-5 rounded-[3px] hover:bg-ink-hover transition-colors disabled:opacity-60"
                >
                  {loading ? "Please wait..." : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
