"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import SettingsField, { SettingsCard } from "@/components/account/settings/SettingsField";
import { changeAccountPassword } from "@/lib/accountSettingsApi";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Mirrors validateNewPassword in lib/accountSettings.js (the server re-checks)
function validate(form) {
  const errors = {};
  if (!form.currentPassword) errors.currentPassword = "Enter your current password.";
  if (form.newPassword.length < 8) {
    errors.newPassword = "Use at least 8 characters.";
  } else if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
    errors.newPassword = "Include at least one letter and one number.";
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = "Choose a password different from your current one.";
  }
  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "The passwords don't match.";
  }
  return errors;
}

export default function PasswordSection({ notify }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    const result = await changeAccountPassword(form);
    setSaving(false);

    if (result.success) {
      setForm(EMPTY);
      setErrors({});
      setVisible(false);
      notify(true, "Password updated. Use your new password next time you sign in.");
    } else {
      setErrors(result.errors || {});
      notify(false, result.message);
    }
  };

  const toggle = (
    <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
      aria-label={visible ? "Hide passwords" : "Show passwords"}
    >
      {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
    </button>
  );

  const fieldProps = (name) => ({
    id: `password-${name}`,
    name,
    type: visible ? "text" : "password",
    value: form[name],
    onChange: handleChange,
    disabled: saving,
    error: errors[name],
    maxLength: 72,
  });

  return (
    <SettingsCard title="Password" description="Change the password you use to sign in.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <SettingsField
          {...fieldProps("currentPassword")}
          label="Current password"
          autoComplete="current-password"
          trailing={toggle}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SettingsField
            {...fieldProps("newPassword")}
            label="New password"
            autoComplete="new-password"
            hint="At least 8 characters, with a letter and a number."
          />
          <SettingsField {...fieldProps("confirmPassword")} label="Confirm new password" autoComplete="new-password" />
        </div>

        <div className="flex pt-1 sm:justify-end">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {saving ? "Updating" : "Update password"}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}
