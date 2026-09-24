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

export default function LoginPage() {
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useEcommerce();

  const [form, setForm] = useState({ email: "", password: "" });
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
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address, like name@example.com.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", form.email.trim());
      formData.append("password", form.password);

      const { data } = await axios.post("/api/auth/login", formData);

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        // Back to the page that asked for sign-in (same-site paths only)
        router.push(getSafeRedirect("/"));
        return;
      }
      setFormError(data.message || "We couldn't sign you in. Please try again.");
    } catch (error) {
      setFormError(error?.response?.data?.message || "We couldn't reach the server. Please check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your orders, saved pieces and addresses."
      footer={
        <>
          New to Eleoka?{" "}
          <Link href="/signup" className="link text-ink">
            Create an account
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

        <AuthField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          }
        />

        <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? "Signing in" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
