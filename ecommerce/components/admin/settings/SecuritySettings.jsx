"use client";

import { useState } from "react";
import { KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";
import ConfirmDialog from "@/ui/ConfirmDialog";
import { formatDate } from "@/lib/formatDate";
import {
  changeAdminPassword,
  getFieldErrors,
  logoutAllAdminSessions,
} from "@/lib/adminSettingsApi";
import { getErrorMessage, isUnauthorized } from "@/lib/adminDashboardApi";
import {
  NumberField,
  PrimaryButton,
  SettingsCard,
  TextField,
} from "./SettingsFields";

const EMPTY_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// Mirrors the server rules so obvious mistakes are caught before a request
function validatePasswords({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = "Enter your current password";
  if (newPassword.length < 8) {
    errors.newPassword = "Use at least 8 characters";
  } else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    errors.newPassword = "Include at least one letter and one number";
  } else if (newPassword === currentPassword) {
    errors.newPassword = "Must be different from the current password";
  }
  if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

function ChangePasswordCard({ onSuccess, onError, onUnauthorized }) {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (field) => (value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validatePasswords(passwords);
    if (Object.keys(clientErrors).length) return setErrors(clientErrors);

    try {
      setSaving(true);
      const message = await changeAdminPassword(passwords);
      setPasswords(EMPTY_PASSWORDS);
      setErrors({});
      onSuccess(message);
    } catch (err) {
      if (isUnauthorized(err)) return onUnauthorized();
      setErrors(getFieldErrors(err));
      onError(getErrorMessage(err, "Failed to change password"));
    } finally {
      setSaving(false);
    }
  };

  const hasInput = Object.values(passwords).some(Boolean);

  return (
    <SettingsCard
      title="Change Password"
      description="Changing your password signs you out on every other device."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Helps password managers pair the new password with the account */}
        <input type="hidden" name="username" autoComplete="username" />

        <div className="max-w-md space-y-5">
          <TextField
            id="security-currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={update("currentPassword")}
            error={errors.currentPassword}
          />
          <TextField
            id="security-newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={update("newPassword")}
            error={errors.newPassword}
            hint="At least 8 characters with a letter and a number"
          />
          <TextField
            id="security-confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={update("confirmPassword")}
            error={errors.confirmPassword}
          />
        </div>

        <div className="flex justify-end">
          <PrimaryButton type="submit" loading={saving} disabled={!hasInput}>
            <KeyRound className="w-4 h-4" />
            Update password
          </PrimaryButton>
        </div>
      </form>
    </SettingsCard>
  );
}

export default function SecuritySettings({
  values,
  errors,
  onChange,
  admin,
  onPasswordChanged,
  onSuccess,
  onError,
  onUnauthorized,
  ...cardProps
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleLogoutAll = async () => {
    try {
      setRevoking(true);
      onSuccess(await logoutAllAdminSessions());
    } catch (err) {
      if (isUnauthorized(err)) return onUnauthorized();
      onError(getErrorMessage(err, "Failed to sign out other sessions"));
    } finally {
      setRevoking(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account */}
      <SettingsCard
        title="Admin Account"
        description="The account used to sign in to this dashboard."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D98880]/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#D98880]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]">
                Admin email
              </p>
              <p className="text-sm font-medium text-[#1C1A17] truncate">
                {admin?.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D98880]/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#D98880]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A6A52]">
                Password
              </p>
              <p className="text-sm text-[#1C1A17]">
                {admin?.passwordSource === "database"
                  ? `Stored securely (hashed). Last changed ${formatDate(admin.passwordChangedAt)}.`
                  : "Using the initial password from the server configuration. Change it below to store a hashed password instead."}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#8A6A52]">
            The admin email is set by <code className="font-mono">ADMIN_EMAIL</code>{" "}
            on the server and can&apos;t be changed here.
          </p>
        </div>
      </SettingsCard>

      <ChangePasswordCard
        onSuccess={(message) => {
          onPasswordChanged();
          onSuccess(message);
        }}
        onError={onError}
        onUnauthorized={onUnauthorized}
      />

      {/* Sessions */}
      <SettingsCard
        title="Sessions"
        description="How long admin sign-ins last, and signing out other devices."
        {...cardProps}
      >
        <div className="space-y-6">
          <div className="max-w-xs">
            <NumberField
              id="security-sessionDurationHours"
              label="Stay signed in for"
              suffix="hours"
              min={1}
              max={168}
              step="1"
              value={values.sessionDurationHours}
              onChange={(v) => onChange("sessionDurationHours", v)}
              error={errors.sessionDurationHours}
              hint="1 to 168 hours. Applies from your next sign-in."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#1C1A17]/5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1C1A17]">
                Sign out all other sessions
              </p>
              <p className="text-xs text-[#8A6A52] mt-0.5">
                Ends every admin sign-in except this one.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out others
            </button>
          </div>
        </div>
      </SettingsCard>

      <ConfirmDialog
        open={confirmOpen}
        title="Sign out other sessions?"
        message="Every other device signed in as admin will need to sign in again."
        confirmText="Yes, sign out"
        cancelText="Cancel"
        loading={revoking}
        onConfirm={handleLogoutAll}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
