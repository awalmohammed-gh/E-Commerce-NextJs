"use client";

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
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-301 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="font-editorial font-semibold text-xl text-[#1C1A17]">
                {title}
              </h3>

              {message && (
                <p className="font-utility text-sm text-[#8A6A52] mt-2">
                  {message}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="font-utility text-sm font-medium text-[#4A463F] hover:text-[#1C1A17] px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="font-utility text-sm font-medium bg-[#1C1A17] text-[#F5F1EA] px-5 py-2 rounded-full hover:bg-[#332F29] transition-colors disabled:opacity-60"
                >
                  {loading ? "..." : confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
