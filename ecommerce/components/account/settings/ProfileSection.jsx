"use client";

import { useRef, useState } from "react";
import { Loader2, User } from "lucide-react";
import SettingsField, { SettingsCard } from "@/components/account/settings/SettingsField";
import {
  removeProfileImage,
  saveAccountSettings,
  uploadProfileImage,
} from "@/lib/accountSettingsApi";

const MAX_IMAGE = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

/*
  Name, phone and profile photo. Email is shown read-only: changing it
  safely needs email verification, which Eleoka doesn't have yet.
  onSaved(settings) runs after every successful save.
*/
export default function ProfileSection({ profile, onSaved, notify }) {
  const fileRef = useRef(null);
  // null = untouched, so the form always shows the saved values
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoAction, setPhotoAction] = useState(null); // upload | remove | null

  const values = draft ?? { fullName: profile.fullName, phone: profile.phone };
  const dirty =
    values.fullName.trim() !== profile.fullName || values.phone.trim() !== profile.phone;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft({ ...values, [name]: value });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dirty || saving) return;

    const fullName = values.fullName.trim();
    if (fullName.length < 2) {
      setErrors({ fullName: "Full name must be at least 2 characters" });
      return;
    }

    setSaving(true);
    const result = await saveAccountSettings({
      profile: { fullName, phone: values.phone.trim() },
    });
    setSaving(false);

    if (result.success) {
      setDraft(null);
      setErrors({});
      onSaved(result.settings);
      notify(true, "Profile updated");
    } else {
      setErrors(result.errors || {});
      notify(false, result.message);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      notify(false, "Photo must be a PNG, JPG or WebP image");
      return;
    }
    if (file.size > MAX_IMAGE) {
      notify(false, "Photo must be 2 MB or smaller");
      return;
    }

    setPhotoAction("upload");
    const result = await uploadProfileImage(file);
    setPhotoAction(null);

    if (result.success) onSaved(result.settings);
    notify(result.success, result.message);
  };

  const handleRemovePhoto = async () => {
    setPhotoAction("remove");
    const result = await removeProfileImage();
    setPhotoAction(null);

    if (result.success) onSaved(result.settings);
    notify(result.success, result.message);
  };

  const initial = profile.fullName.trim().charAt(0).toUpperCase();

  return (
    <SettingsCard title="Profile" description="Your name and phone number appear on your orders.">
      {/* Photo */}
      <div className="mb-8 flex items-center gap-5">
        <div className="relative h-18 w-18 shrink-0">
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.image} alt="Your profile photo" className="h-18 w-18 rounded-full bg-sand object-cover" />
          ) : (
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-ink text-2xl text-cream">
              {initial || <User className="h-7 w-7" aria-hidden="true" />}
            </div>
          )}
          {photoAction && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-paper/70">
              <Loader2 className="h-5 w-5 animate-spin text-ink" aria-label="Updating photo" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px]">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={Boolean(photoAction)}
              className="min-h-10 text-ink link disabled:opacity-50"
            >
              {photoAction === "upload" ? "Uploading" : profile.image ? "Change photo" : "Upload a photo"}
            </button>
            {profile.image && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={Boolean(photoAction)}
                className="min-h-10 text-muted underline decoration-muted/40 underline-offset-4 hover:text-danger disabled:opacity-50"
              >
                {photoAction === "remove" ? "Removing" : "Remove"}
              </button>
            )}
          </div>
          <p className="text-[13px] text-muted">PNG, JPG or WebP, up to 2 MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={handleFile}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Details */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SettingsField
            id="settings-fullName"
            name="fullName"
            label="Full name"
            autoComplete="name"
            maxLength={80}
            value={values.fullName}
            onChange={handleChange}
            disabled={saving}
            error={errors.fullName}
          />
          <SettingsField
            id="settings-phone"
            name="phone"
            type="tel"
            label="Phone number"
            autoComplete="tel"
            placeholder="024 123 4567"
            maxLength={20}
            value={values.phone}
            onChange={handleChange}
            disabled={saving}
            error={errors.phone}
          />
        </div>

        <SettingsField
          id="settings-email"
          label="Email"
          type="email"
          value={profile.email}
          readOnly
          hint="Used to sign in. Contact us if you need to change it."
        />

        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          {dirty && (
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setErrors({});
              }}
              disabled={saving}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={!dirty || saving} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {saving ? "Saving" : "Save changes"}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}