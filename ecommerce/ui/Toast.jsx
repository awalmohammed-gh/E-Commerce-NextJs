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
      icon: "text-[#3F6B4E]",
      ring: "border-[#3F6B4E]/25",
      bg: "bg-white",
    },
    error: {
      Icon: AlertCircle,
      icon: "text-[#B3413A]",
      ring: "border-[#B3413A]/30",
      bg: "bg-white",
    },
    info: {
      Icon: AlertCircle,
      icon: "text-taupe",
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
          className={`flex items-start gap-3 ${bg} border ${ring} rounded-sm shadow-[0_8px_24px_rgba(28,26,23,0.10)] p-4 w-full sm:w-96 max-w-full`}
          role={type === "error" ? "alert" : "status"}
          aria-live={type === "error" ? "assertive" : "polite"}
        >
          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${icon}`} aria-hidden="true" />

          <p className="flex-1 text-sm text-ink leading-snug">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-taupe hover:bg-ink/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
