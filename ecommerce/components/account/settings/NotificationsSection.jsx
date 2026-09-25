"use client";

import { useState } from "react";
import { SettingsCard } from "@/components/account/settings/SettingsField";
import { saveAccountSettings } from "@/lib/accountSettingsApi";

const OPTIONS = [
  { key: "orderUpdates", title: "Order updates", description: "When your order is confirmed, shipped or delivered." },
  { key: "paymentUpdates", title: "Payment updates", description: "Payment confirmations and problems with a payment." },
  { key: "marketing", title: "Promotions", description: "New arrivals, sales and offers from Eleoka." },
];

function Switch({ checked, disabled, onChange, labelledBy, describedBy }) {
  return ( 
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-ink" : "bg-line"
      }`}
    >
      <span
        className={`inline-block h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5.75" : "translate-x-0.75"
        }`}
      />
    </button>
  );
}

/*
  Each switch saves on its own and only flips after the API confirms.
  These are stored preferences: Eleoka doesn't send email or SMS
  notifications yet, and the note below says so.
*/
export default function NotificationsSection({ notifications, onSaved, notify }) {
  const [pendingKey, setPendingKey] = useState(null);

  const handleToggle = async (key) => {
    if (pendingKey) return;

    setPendingKey(key);
    const result = await saveAccountSettings({ notifications: { [key]: !notifications[key] } });
    setPendingKey(null);

    if (result.success) {
      onSaved(result.settings);
      notify(true, "Preference saved.");
    } else {
      notify(false, result.message);
    }
  };

  return (
    <SettingsCard
      title="Notifications"
      description="Eleoka doesn't send email or SMS updates yet. Your choices are saved and will apply when it does."
    >
      <ul className="divide-y divide-line border-y border-line">
        {OPTIONS.map((option) => (
          <li key={option.key} className="flex items-center justify-between gap-6 py-4">
            <div className="min-w-0">
              <p id={`notify-${option.key}`} className="text-[15px] text-ink">
                {option.title}
              </p>
              <p id={`notify-${option.key}-desc`} className="mt-0.5 text-[14px] text-muted">
                {option.description}
              </p>
            </div>
            <Switch
              checked={Boolean(notifications[option.key])}
              disabled={Boolean(pendingKey)}
              onChange={() => handleToggle(option.key)}
              labelledBy={`notify-${option.key}`}
              describedBy={`notify-${option.key}-desc`}
            />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[14px] text-muted">Order status is always shown in My Orders.</p>
    </SettingsCard>
  );
}
