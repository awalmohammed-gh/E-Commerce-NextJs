"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell, { AuthField } from "@/components/auth/AuthShell";
import { useEcommerce } from "@/context/EcommerceContextProvider";
import { getSafeRedirect } from "@/lib/safeRedirect";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Matches the server rule in /api/auth/signup
const PASSWORD_MIN = 8;

export default function SignUpPage() {
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useEcommerce();

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address, like name@example.com.";
    if (form.password.length < PASSWORD_MIN) next.password = `Use at least ${PASSWORD_MIN} characters.`;
    if (!next.password && form.confirmPassword !== form.password) next.confirmPassword = "The passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);

      const { data } = await axios.post("/api/auth/signup", formData);

      if (data.success) {
        setUser({ ...data.user, id: String(data.user.id) });
        setIsLoggedIn(true);
        router.push(getSafeRedirect("/"));
        return;
      }
      setFormError(data.message || "We couldn't create your account. Please try again.");
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        setErrors({ email: "An account with this email already exists." });
      } else {
        setFormError(message || "We couldn't reach the server. Please check your connection and try again.");
      }
    }
    setLoading(false);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
    >
      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
    </button>
  );

  return (
    <AuthShell
      title="Create an account"
      subtitle="Save pieces to your wishlist, keep your addresses and follow every order."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="link text-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && (
          <p role="alert" className="flex items-start gap-2.5 rounded-[3px] bg-danger-tint px-4 py-3 text-[14px] text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}

        <AuthField
          id="fullName"
          name="fullName"
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        {errors.email === "An account with this email already exists." && (
          <p className="-mt-3 text-[14px] text-ink-soft">
            <Link href="/login" className="link text-ink">
              Sign in instead
            </Link>
          </p>
        )}
        <AuthField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          hint={`At least ${PASSWORD_MIN} characters.`}
          trailing={passwordToggle}
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? "Creating your account" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
