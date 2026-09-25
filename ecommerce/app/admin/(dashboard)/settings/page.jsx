"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, Settings2, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { fetchSettings, getFieldErrors, saveSettings, uploadLogo } from "@/lib/adminSettingsApi";
import { getErrorMessage, isUnauthorized } from "@/lib/adminDashboardApi";
import { formatCurrency } from "@/lib/formatCurrency";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Card, CARD } from "@/components/admin/ui/Card";
import { ErrorState, InlineAlert, Skeleton, friendlyError } from "@/components/admin/ui/States";
import { useToast } from "@/components/admin/ui/Toast";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import StoreSettings from "@/components/admin/settings/StoreSettings";
import OrderSettings from "@/components/admin/settings/OrderSettings";
import PaymentSettings from "@/components/admin/settings/PaymentSettings";
import NotificationSettings from "@/components/admin/settings/NotificationSettings";
import SecuritySettings from "@/components/admin/settings/SecuritySettings";
import useUnsavedChangesWarning from "@/components/admin/settings/useUnsavedChangesWarning";

/* ------------------------------------------------------------------
   Tabs - each key matches a section of the settings document
------------------------------------------------------------------ */
const TABS = [
  { key: "general", label: "General", icon: Settings2, Component: GeneralSettings },
  { key: "store", label: "Store", icon: Store, Component: StoreSettings },
  { key: "orders", label: "Orders", icon: ShoppingBag, Component: OrderSettings },
  { key: "payments", label: "Payments", icon: CreditCard, Component: PaymentSettings },
  { key: "notifications", label: "Notifications", icon: Bell, Component: NotificationSettings },
  { key: "security", label: "Security", icon: ShieldCheck, Component: SecuritySettings },
];

const TAB_LABELS = Object.fromEntries(TABS.map((t) => [t.key, t.label]));

// Quick checks before saving; keys are "section.field" like the server's errors
const CLIENT_CHECKS = {
  store: ({ deliveryFee }) => {
    const raw = String(deliveryFee ?? "").trim();
    const fee = Number(raw);
    if (raw === "") return { "store.deliveryFee": "Enter a delivery fee. Use 0 for free delivery." };
    if (!Number.isFinite(fee)) return { "store.deliveryFee": "Delivery fee must be a number, e.g. 25 or 25.50." };
    if (fee < 0) return { "store.deliveryFee": "Delivery fee can't be negative." };
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return { "store.deliveryFee": "Use at most 2 decimal places, e.g. 25.50." };
    return {};
  },
};

// Number inputs hold strings while typing, so compare loosely ("24" == 24, "" == null)
const sameValue = (a, b) => String(a ?? "") === String(b ?? "");

const isSectionDirty = (saved, draft, section) =>
  Object.keys(saved?.[section] || {}).some(
    (field) => !sameValue(saved[section][field], draft?.[section]?.[field]),
  );

// "store.taxPercentage" -> { taxPercentage }, "payments" -> { _section }
const errorsForSection = (errors, section) => {
  const result = {};
  for (const [path, message] of Object.entries(errors)) {
    if (path === section) result._section = message;
    else if (path.startsWith(`${section}.`)) {
      result[path.slice(section.length + 1)] = message;
    }
  }
  return result;
};

export default function AdminSettings() {
  const router = useRouter();

  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [admin, setAdmin] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [activeTab, setActiveTab] = useState("general");
  const [savingSection, setSavingSection] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const toast = useToast();
  const showSuccess = toast.success;
  const showError = toast.error;

  const handleUnauthorized = useCallback(() => {
    router.replace("/admin/admin-login");
  }, [router]);

  /* ---------------------------------------------------------
     Load settings
  --------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const data = await fetchSettings();
        if (cancelled) return;

        setSaved(data.settings);
        setDraft(data.settings);
        setAdmin(data.admin);
      } catch (err) {
        if (cancelled) return;
        if (isUnauthorized(err)) return handleUnauthorized();

        console.error(err);
        setLoadError(friendlyError(err, "Settings couldn't be loaded."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, handleUnauthorized]);

  /* ---------------------------------------------------------
     Unsaved changes
  --------------------------------------------------------- */
  const dirtySections = saved
    ? TABS.map((t) => t.key).filter((key) => isSectionDirty(saved, draft, key))
    : [];

  useUnsavedChangesWarning(
    dirtySections.length > 0,
    "You have unsaved settings. Leave this page and discard them?",
  );

  /* ---------------------------------------------------------
     Handlers
  --------------------------------------------------------- */
  const handleFieldChange = (section, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`${section}.${field}`];
      delete next[section];
      return next;
    });
  };

  const handleDiscard = (section) => {
    setDraft((prev) => ({ ...prev, [section]: saved[section] }));
    setFieldErrors((prev) => errorsWithoutSection(prev, section));
  };

  const handleSave = async (section) => {
    // Catch obvious mistakes before a request (the server checks again)
    const clientErrors = CLIENT_CHECKS[section]?.(draft[section]) || {};
    if (Object.keys(clientErrors).length) {
      setFieldErrors((prev) => ({ ...prev, ...clientErrors }));
      showError(Object.values(clientErrors)[0]);
      document.getElementById(Object.keys(clientErrors)[0].replace(".", "-"))?.focus();
      return;
    }

    try {
      setSavingSection(section);

      const previousFee = saved.store?.deliveryFee;
      const updated = await saveSettings({ [section]: draft[section] });

      setSaved(updated);
      // Refresh only this section so edits in other tabs are kept
      setDraft((prev) => ({ ...prev, [section]: updated[section] }));
      setFieldErrors((prev) => errorsWithoutSection(prev, section));

      const newFee = updated.store?.deliveryFee;
      showSuccess(
        section === "store" && newFee !== previousFee
          ? `Delivery fee updated to ${formatCurrency(newFee)}. New orders use it from now on.`
          : "Settings updated successfully",
      );
    } catch (err) {
      if (isUnauthorized(err)) return handleUnauthorized();

      console.error(err);
      setFieldErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
      showError(
        err?.response?.status === 400
          ? getErrorMessage(err, "Some settings need fixing before they can be saved.")
          : "Settings couldn't be saved. Your changes are still here, so you can try again.",
      );
    } finally {
      setSavingSection(null);
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      setUploadingLogo(true);

      const updated = await uploadLogo(file);

      // The upload is saved server-side, so update both copies
      setSaved(updated);
      setDraft((prev) => ({
        ...prev,
        general: { ...prev.general, logo: updated.general.logo },
      }));
      showSuccess("Logo updated");
    } catch (err) {
      if (isUnauthorized(err)) return handleUnauthorized();

      console.error(err);
      showError(getErrorMessage(err, "Failed to upload logo"));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePasswordChanged = () =>
    setAdmin((prev) => ({
      ...prev,
      passwordSource: "database",
      passwordChangedAt: new Date().toISOString(),
    }));

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  const header = (
    <PageHeader title="Settings" description="Store details, checkout rules and admin security." />
  );

  if (loading && !saved) {
    return (
      <>
        {header}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6">
          <Skeleton className="h-11 lg:h-64" />
          <div className={`${CARD} space-y-4 p-5`}>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72 max-w-full" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (loadError && !saved) {
    return (
      <>
        {header}
        <Card>
          <ErrorState
            title="Couldn't load settings"
            message={loadError}
            onRetry={() => setReloadKey((k) => k + 1)}
            retrying={loading}
          />
        </Card>
      </>
    );
  }

  const tab = TABS.find((t) => t.key === activeTab);
  const { Component } = tab;
  const section = tab.key;

  const sectionProps = {
    values: draft[section],
    errors: errorsForSection(fieldErrors, section),
    onChange: (field, value) => handleFieldChange(section, field, value),
    dirty: dirtySections.includes(section),
    saving: savingSection === section,
    onSave: () => handleSave(section),
    onDiscard: () => handleDiscard(section),
  };

  const extraProps = {
    store: { saved: saved.store },
    general: {
      onUploadLogo: handleLogoUpload,
      onLogoError: showError,
      uploadingLogo,
    },
    security: {
      admin,
      onPasswordChanged: handlePasswordChanged,
      onSuccess: showSuccess,
      onError: showError,
      onUnauthorized: handleUnauthorized,
    },
  }[section];

  return (
    <>
      {header}

      {dirtySections.length > 0 && (
        <div className="mb-4">
          <InlineAlert tone="warning">
            Unsaved changes in{" "}
            <span className="font-medium">{dirtySections.map((key) => TAB_LABELS[key]).join(", ")}</span>. Save each
            section before leaving.
          </InlineAlert>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6">
        {/* Section list: scrolls sideways on phones, vertical from lg */}
        <nav className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:sticky lg:top-22" aria-label="Settings sections">
          <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = key === activeTab;
              const dirty = dirtySections.includes(key);

              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(key)}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm whitespace-nowrap transition-colors sm:h-9 ${
                      active
                        ? "border border-line bg-white font-medium text-ink"
                        : "border border-transparent text-ink-soft hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? "text-ink" : "text-muted"}`} aria-hidden="true" />
                    <span>{label}</span>
                    {dirty && (
                      <>
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-warning-mark" aria-hidden="true" />
                        <span className="sr-only">(unsaved changes)</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">
          <Component key={section} {...sectionProps} {...extraProps} />
        </div>
      </div>
    </>
  );
}

function errorsWithoutSection(errors, section) {
  return Object.fromEntries(
    Object.entries(errors).filter(
      ([path]) => path !== section && !path.startsWith(`${section}.`),
    ),
  );
}
