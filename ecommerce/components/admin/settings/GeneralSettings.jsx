"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { SettingsCard, TextAreaField, TextField } from "./SettingsFields";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

function LogoField({ logo, uploading, onUpload, onRemove, onInvalid }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    if (!LOGO_TYPES.includes(file.type)) {
      return onInvalid("Logo must be a PNG, JPG or WebP image");
    }
    if (file.size > MAX_LOGO_SIZE) {
      return onInvalid("Logo must be 2 MB or smaller");
    }
    onUpload(file);
  };

  return (
    <div>
      <p className="block font-utility text-[11px] font-semibold uppercase tracking-wider text-[#4A463F] mb-2">
        Logo
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-20 h-20 shrink-0 rounded-2xl bg-[#F7F4EE] border border-[#E5DDD1] flex items-center justify-center overflow-hidden">
          {logo ? (
            <Image
              src={logo}
              alt="Store logo"
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          ) : (
            <ImagePlus className="w-6 h-6 text-[#8A6A52]" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-[#F7F4EE] border border-[#E5DDD1] hover:bg-white hover:border-[#1C1A17] text-[#1C1A17] px-4 py-2 rounded-full text-sm transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              {uploading ? "Uploading..." : logo ? "Replace logo" : "Upload logo"}
            </button>
            {logo && !uploading && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-[#8A6A52]">
            PNG, JPG or WebP, up to 2 MB. Uploads are saved immediately.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={LOGO_TYPES.join(",")}
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function GeneralSettings({
  values,
  errors,
  onChange,
  onUploadLogo,
  onLogoError,
  uploadingLogo,
  ...cardProps
}) {
  return (
    <SettingsCard
      title="General Information"
      description="Your business details, shown to customers and on receipts."
      {...cardProps}
    >
      <div className="space-y-5">
        <LogoField
          logo={values.logo}
          uploading={uploadingLogo}
          onUpload={onUploadLogo}
          onRemove={() => onChange("logo", "")}
          onInvalid={onLogoError}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            id="general-systemName"
            label="Business name"
            value={values.systemName}
            onChange={(v) => onChange("systemName", v)}
            error={errors.systemName}
            maxLength={80}
            placeholder="Eleoka"
          />
          <TextField
            id="general-email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(v) => onChange("email", v)}
            error={errors.email}
            placeholder="hello@eleoka.com"
          />
          <TextField
            id="general-phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(v) => onChange("phone", v)}
            error={errors.phone}
            placeholder="+233 24 000 0000"
          />
          <TextField
            id="general-website"
            label="Website"
            type="url"
            value={values.website}
            onChange={(v) => onChange("website", v)}
            error={errors.website}
            placeholder="https://eleoka.com"
          />
        </div>

        <TextField
          id="general-address"
          label="Address"
          value={values.address}
          onChange={(v) => onChange("address", v)}
          error={errors.address}
          maxLength={300}
          placeholder="Street, city, region"
        />

        <TextAreaField
          id="general-description"
          label="Description"
          value={values.description}
          onChange={(v) => onChange("description", v)}
          error={errors.description}
          maxLength={1000}
          placeholder="A short description of your store"
          hint={`${(values.description || "").length}/1000`}
        />
      </div>
    </SettingsCard>
  );
}
