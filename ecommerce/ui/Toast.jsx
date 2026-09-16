"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({
  success = false,
  error = false,
  message = "",
  duration = 3500,
  onClose,
}) {
  // Determine variant
  const type = error ? "error" : success ? "success" : "info";

  const styles = {
    success: {
      Icon: CheckCircle2,
      icon: "text-green-600",
      ring: "border-green-200",
      bg: "bg-green-50",
    },
    error: {
      Icon: AlertCircle,
      icon: "text-red-600",
      ring: "border-red-200",
      bg: "bg-red-50",
    },
    info: {
      Icon: AlertCircle,
      icon: "text-[#8A6A52]",
      ring: "border-[#1C1A17]/10",
      bg: "bg-white",
    },
  };

  const { Icon, icon, ring, bg } = styles[type];

  // Auto-dismiss
  useEffect(() => {
    if (!duration || !message) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 ${bg} border ${ring} rounded-2xl shadow-lg p-4 w-full max-w-sm`}
          role="status"
          aria-live="polite"
        >
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${icon}`} />

          <p className="flex-1 font-utility text-sm text-[#1C1A17] leading-snug">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#8A6A52] hover:bg-[#1C1A17]/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
