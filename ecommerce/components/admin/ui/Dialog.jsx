"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";
import { drawerVariants, modalVariants, overlayVariants } from "@/lib/adminMotion";

/*
  Shared frame for Modal and Drawer: a native <dialog> opened with
  showModal(), so the browser traps focus, makes the page behind inert
  and reports Escape. The dialog itself is a transparent full-screen
  layer; framer-motion animates the overlay and the panel inside it.

  Closing: `open` turns false, the panel and overlay play their exit,
  and only then is the <dialog> closed and focus returned to whatever
  opened it.
*/
function MotionDialog({
  open,
  onClose,
  busy = false,
  closeOnBackdrop = true,
  dialogProps,
  layoutClassName,
  panelVariants,
  panelClassName,
  children,
}) {
  const ref = useRef(null);
  const opener = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Open before paint, so the entrance starts on the first frame
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    }
  }, [open]);

  // After the exit animation (skipped if it was reopened meanwhile)
  const finishClose = () => {
    const dialog = ref.current;
    if (openRef.current || !dialog?.open) return;
    dialog.close();
    const trigger = opener.current;
    opener.current = null;
    if (trigger?.isConnected) trigger.focus();
  };

  const requestClose = () => {
    if (!busy) onClose();
  };

  return (
    <dialog
      ref={ref}
      {...dialogProps}
      className={`admin-dialog fixed inset-0 m-0 hidden h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink open:flex ${layoutClassName}`}
      onCancel={(e) => {
        // Escape
        e.preventDefault();
        requestClose();
      }}
    >
      <AnimatePresence onExitComplete={finishClose}>
        {open && (
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-espresso-deep/35 backdrop-blur-[3px]"
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => closeOnBackdrop && requestClose()}
            aria-hidden="true"
          />
        )}
        {open && (
          <motion.div
            key="panel"
            className={`relative ${panelClassName}`}
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

/*
  Widths per size. Phones get almost the full width with a margin;
  "full" becomes a full-screen sheet on phones for very long forms.
*/
const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  full: "h-full max-w-full rounded-none sm:h-auto sm:max-w-5xl sm:rounded-2xl",
};

/*
  The one modal for every admin interaction: view, details, edit,
  create and confirmations. Header (title, optional description, close),
  a body that scrolls inside the modal, and an optional footer that
  stays visible.

  size:            "sm" | "md" | "lg" | "full"
  busy:            blocks closing while a request is running
  closeOnBackdrop: false for forms where a stray click would lose work
  role:            "dialog" or "alertdialog" (confirmations)
*/
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  busy = false,
  closeOnBackdrop = true,
  footer,
  role = "dialog",
  bodyClassName = "px-5 py-4 sm:px-6 sm:py-5",
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const bodyId = useId();
  // A confirmation is described by its message (the body)
  const describedBy = description ? descriptionId : role === "alertdialog" ? bodyId : undefined;
  const full = size === "full";

  return (
    <MotionDialog
      open={open}
      onClose={onClose}
      busy={busy}
      closeOnBackdrop={closeOnBackdrop}
      dialogProps={{
        role: role === "alertdialog" ? "alertdialog" : undefined,
        "aria-labelledby": titleId,
        "aria-describedby": describedBy,
      }}
      layoutClassName={`items-center justify-center ${full ? "p-0 sm:p-6" : "p-3 sm:p-6"}`}
      panelVariants={modalVariants}
      panelClassName={`flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/92 shadow-[0_32px_64px_-24px_rgb(27_18_13/0.4),0_2px_8px_-2px_rgb(27_18_13/0.08)] backdrop-blur-xl ${
        SIZES[size] || SIZES.md
      }`}
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-ink/8 px-5 py-3.5 sm:px-6">
        {icon}
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 id={titleId} className="text-[17px] leading-snug font-semibold text-ink">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="mt-0.5 text-[13px] text-muted">
              {description}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
          className="-mt-0.5 -mr-2 rounded-full"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </Button>
      </div>

      <div id={bodyId} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
        {children}
      </div>

      {footer && <div className="shrink-0 border-t border-ink/8 bg-paper/80 px-5 py-3 sm:px-6">{footer}</div>}
    </MotionDialog>
  );
}

// Confirmation before a destructive (or otherwise final) action. Built on Modal.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const danger = tone === "danger";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      busy={loading}
      role="alertdialog"
      icon={
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            danger ? "bg-danger-tint text-danger" : "bg-cream text-ink"
          }`}
          aria-hidden="true"
        >
          <AlertTriangle className="h-4.5 w-4.5" />
        </span>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {/* The safe choice gets focus first, so Enter never destroys anything */}
          <Button autoFocus onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            loadingText="Working..."
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {message && <div className="text-sm leading-relaxed text-ink-soft">{message}</div>}
    </Modal>
  );
}

/*
  Side drawer - for the mobile navigation only (slides in from the
  left over a fading overlay). Details, forms and confirmations use
  Modal, never a side panel.
*/
export function Drawer({ open, onClose, width = "max-w-[85vw] sm:max-w-[300px]", labelledBy, children }) {
  return (
    <MotionDialog
      open={open}
      onClose={onClose}
      dialogProps={{ "aria-labelledby": labelledBy }}
      layoutClassName="items-stretch justify-start"
      panelVariants={drawerVariants}
      panelClassName={`h-full w-full overflow-hidden border-r border-line bg-white shadow-lift ${width}`}
    >
      {children}
    </MotionDialog>
  );
}
