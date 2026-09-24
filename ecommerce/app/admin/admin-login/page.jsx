"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, ArrowLeft, LockKeyhole } from "lucide-react";
import Button from "@/components/admin/ui/Button";
import { Field, INPUT, describedBy } from "@/components/admin/ui/Field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your admin email.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

// Server messages for 400/401 are written for people; anything else gets a calm fallback
function loginErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return "That email and password don't match an admin account.";
  if (status === 400) return error.response.data?.message || "Enter your email and password.";
  if (status === 429) return "Too many attempts. Wait a moment and try again.";
  if (!error?.response) return "Can't reach the server. Check your connection and try again.";
  return "Sign-in isn't available right now. Please try again shortly.";
}

export default function AdminLogin() {
  const router = useRouter();

  const [adminLogin, setAdminLogin] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminLogin((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate(adminLogin);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors.email ? "admin-email" : "admin-password")?.focus();
      return;
    }

    try {
      setLoading(true);
      setFormError(null);

      const formData = new FormData();
      formData.append("email", adminLogin.email.trim());
      formData.append("password", adminLogin.password);

      const { data } = await axios.post("/api/auth/admin/login", formData);
      if (!data.success) throw new Error(data.message || "Invalid credentials");

      setRedirecting(true);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormError(loginErrorMessage(error));
      setAdminLogin((prev) => ({ ...prev, password: "" }));
      document.getElementById("admin-password")?.focus();
      setLoading(false);
    }
  };

  const busy = loading || redirecting;

  return (
    <main className="admin flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-95">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="text-lg font-semibold tracking-[0.14em]">
            <span className="text-ink">ELE</span>
            <span className="text-rose">OKA</span>
          </span>
          <span className="rounded border border-line bg-white px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-muted uppercase">
            Admin
          </span>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-[0_1px_2px_rgb(28_26_23/0.04)] sm:p-7">
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-muted">Store management is limited to authorised staff.</p>

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-md border border-danger/25 bg-danger-tint px-3 py-2.5 text-[13px] text-danger"
            >
              <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            <Field id="admin-email" label="Email" error={errors.email}>
              <input
                id="admin-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={adminLogin.email}
                onChange={handleChange}
                disabled={busy}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("admin-email", { error: errors.email })}
                className={INPUT}
              />
            </Field>

            <Field id="admin-password" label="Password" error={errors.password}>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={adminLogin.password}
                  onChange={handleChange}
                  disabled={busy}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={describedBy("admin-password", { error: errors.password })}
                  className={`${INPUT} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 rounded px-2 text-xs font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-pressed={showPassword}
                  aria-controls="admin-password"
                >
                  {showPassword ? "Hide" : "Show"}
                  <span className="sr-only"> password</span>
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              variant="primary"
              loading={busy}
              loadingText={redirecting ? "Opening dashboard..." : "Signing in..."}
              className="h-11 w-full sm:h-10"
            >
              Sign in
            </Button>
          </form>
        </div>

        <div className="mt-5 flex items-start justify-center gap-2 px-2 text-center text-xs text-muted">
          <LockKeyhole className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>Sessions end automatically. You can sign out other devices from Settings.</p>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-sm text-[13px] text-ink-soft underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to the store
          </Link>
        </p>
      </div>
    </main>
  );
}
