"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./Button";

/*
  Native <dialog> opened with showModal(): the browser traps focus,
  makes the page behind inert and closes on Escape. `busy` blocks
  closing while a request is running.
*/
function useModal(open) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return ref;
}

function modalHandlers(onClose, busy) {
  return {
    // Escape
    onCancel: (e) => {
      e.preventDefault();
      if (!busy) onClose();
    },
    // Click on the backdrop (the dialog element itself, outside the panel)
    onClick: (e) => {
      if (e.target === e.currentTarget && !busy) onClose();
    },
  };
}

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
  const ref = useModal(open);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="admin-confirm-title"
      aria-describedby={message ? "admin-confirm-message" : undefined}
      className="admin-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-white p-0 text-ink shadow-[0_24px_48px_-12px_rgb(28_26_23/0.25)]"
      {...modalHandlers(onCancel, loading)}
    >
      {open && (
        <div className="p-5 sm:p-6">
          <h2 id="admin-confirm-title" className="text-base font-semibold">
            {title}
          </h2>
          {message && (
            <div id="admin-confirm-message" className="mt-2 text-sm leading-relaxed text-ink-soft">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {/* The safe choice gets focus first, so Enter never destroys anything */}
            <Button autoFocus onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              loading={loading}
              loadingText="Working..."
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}

/*
  Side panel for details (order view) and the mobile navigation.
  Full width on phones, max 480px from sm up.
*/
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = "right",
  busy = false,
  footer,
  width = "max-w-full sm:max-w-[480px]",
  hideHeader = false,
  labelledBy,
  children,
}) {
  const ref = useModal(open);
  const fromLeft = side === "left";

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy || "admin-drawer-title"}
      className={`admin-drawer ${fromLeft ? "from-left mr-auto ml-0 border-r" : "mr-0 ml-auto border-l"} my-0 h-dvh max-h-dvh w-full border-line bg-white p-0 text-ink ${width}`}
      {...modalHandlers(onClose, busy)}
    >
      {open && (
        <div className="flex h-full flex-col">
          {!hideHeader && (
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2 id="admin-drawer-title" className="text-base font-semibold">
                  {title}
                </h2>
                {description && <div className="mt-0.5 text-[13px] text-muted">{description}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={busy} aria-label="Close panel" className="-mr-2">
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

          {footer && <div className="border-t border-line bg-paper px-4 py-3 sm:px-5">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
