"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { AccountPageHeader } from "@/components/account/AccountShell";
import ProfileSection from "@/components/account/settings/ProfileSection";
import PasswordSection from "@/components/account/settings/PasswordSection";
import NotificationsSection from "@/components/account/settings/NotificationsSection";
import { ErrorState } from "@/components/ui/States";
import { fetchAccountSettings } from "@/lib/accountSettingsApi";
import Toast from "@/ui/Toast";

function SettingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settings">
      {[3, 3, 3].map((rows, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-6 border-t border-line py-10 first:border-t-0 first:pt-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12"
        >
          <div className="space-y-2">
            <div className="skeleton h-6 w-28" />
            <div className="skeleton h-3 w-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: rows }, (_, j) => (
              <div key={j} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { isLoggedIn, authChecked, setUser } = useEcommerce();

  const [reloadKey, setReloadKey] = useState(0);
  // Result of the last finished request: status is ready | error
  const [loaded, setLoaded] = useState({ key: null, status: null, settings: null });
  const requestKey = String(reloadKey);

  const [toast, setToast] = useState({ message: "", success: false, error: false });
  const notify = (success, message) => setToast({ message: message || "", success, error: !success });
  const clearToast = useCallback(() => setToast({ message: "", success: false, error: false }), []);

  useEffect(() => {
    if (!authChecked || !isLoggedIn) return;

    const controller = new AbortController();
    fetchAccountSettings({ signal: controller.signal })
      .then((settings) => setLoaded({ key: requestKey, status: "ready", settings }))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        console.error(error?.response?.data?.message || "Could not load settings");
        setLoaded({ key: requestKey, status: "error", settings: null });
      });

    return () => controller.abort();
  }, [authChecked, isLoggedIn, requestKey]);

  const status = loaded.key === requestKey ? loaded.status : "loading";
  const settings = loaded.settings;

  // Keep the page and the navbar/account menu in step after a save
  const handleSaved = (next) => {
    if (!next) return;
    setLoaded((current) => ({ ...current, settings: next }));
    setUser((current) =>
      current
        ? { ...current, fullName: next.profile.fullName, phone: next.profile.phone, image: next.profile.image }
        : current,
    );
  };

  return (
    <>
      <AccountPageHeader title="Settings" description="Your profile, password and notification choices." />

      {!isLoggedIn || status === "loading" ? (
        <SettingsSkeleton />
      ) : status === "error" ? (
        <ErrorState title="Your settings didn't load." onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <div>
          <ProfileSection profile={settings.profile} onSaved={handleSaved} notify={notify} />
          <PasswordSection notify={notify} />
          <NotificationsSection notifications={settings.notifications} onSaved={handleSaved} notify={notify} />
        </div>
      )}

      <div className="toast-region">
        <Toast success={toast.success} error={toast.error} message={toast.message} onClose={clearToast} />
      </div>
    </>
  );
}
