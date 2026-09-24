"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CreditCard,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import Toast from "@/ui/Toast";
import {
  fetchSettings,
  getFieldErrors,
  saveSettings,
  uploadLogo,
} from "@/lib/adminSettingsApi";
import { getErrorMessage, isUnauthorized } from "@/lib/adminDashboardApi";
import {
  CARD_CLASS,
  RetryButton,
  Skeleton,
} from "@/components/admin/dashboard/DashboardStates";
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

  const [toast, setToast] = useState({
    message: "",
    success: false,
    error: false,
  });

  const showSuccess = (message) =>
    setToast({ message, success: true, error: false });
  const showError = (message) =>
    setToast({ message, success: false, error: true });
  const clearToast = () =>
    setToast({ message: "", success: false, error: false });

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
        setLoadError(getErrorMessage(err, "Unable to load settings"));
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
    try {
      setSavingSection(section);

      const updated = await saveSettings({ [section]: draft[section] });

      setSaved(updated);
      // Refresh only this section so edits in other tabs are kept
      setDraft((prev) => ({ ...prev, [section]: updated[section] }));
      setFieldErrors((prev) => errorsWithoutSection(prev, section));
      showSuccess("Settings updated successfully");
    } catch (err) {
      if (isUnauthorized(err)) return handleUnauthorized();

      console.error(err);
      setFieldErrors((prev) => ({ ...prev, ...getFieldErrors(err) }));
      showError(getErrorMessage(err, "Failed to save settings"));
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
    <div className="mb-8 flex flex-col gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8A6A52]">
        Account
      </p>
      <h1 className="font-semibold text-3xl sm:text-4xl text-[#1C1A17]">
        Settings
      </h1>
      <p className="text-sm text-[#8A6A52]">
        Manage your store details, checkout rules and admin security.
      </p>
    </div>
  );

  if (loading && !saved) {
    return (
      <>
        {header}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <Skeleton className="h-12 lg:h-72 rounded-3xl" />
          <div className={`${CARD_CLASS} p-7 space-y-5`}>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72 max-w-full" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
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
        <div
          className={`${CARD_CLASS} py-16 px-6 flex flex-col items-center gap-4 text-center`}
        >
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl text-[#1C1A17] font-semibold">
              Unable to load settings
            </p>
            <p className="text-sm text-[#8A6A52] mt-1">{loadError}</p>
          </div>
          <RetryButton
            onClick={() => setReloadKey((k) => k + 1)}
            loading={loading}
            label="Retry"
          />
        </div>
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
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            You have unsaved changes in{" "}
            <span className="font-semibold">
              {dirtySections.map((key) => TAB_LABELS[key]).join(", ")}
            </span>
            .
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Tabs: horizontal scroll on mobile, vertical list on desktop */}
        <nav
          className={`${CARD_CLASS} p-2 lg:sticky lg:top-8 overflow-x-auto`}
          aria-label="Settings sections"
        >
          <ul className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = key === activeTab;
              const dirty = dirtySections.includes(key);

              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(key)}
                    aria-current={active ? "page" : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-sm whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[#1C1A17] text-[#F5F1EA]"
                        : "text-[#4A463F] hover:bg-[#1C1A17]/5 hover:text-[#1C1A17]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                    {dirty && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D98880]"
                        aria-label="Unsaved changes"
                      />
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

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-200 pointer-events-none">
        <div className="pointer-events-auto">
          <Toast
            success={toast.success}
            error={toast.error}
            message={toast.message}
            onClose={clearToast}
          />
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
