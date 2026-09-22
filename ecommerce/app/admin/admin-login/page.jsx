"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import Toast from "@/ui/Toast";

export default function AdminLogin() {
  const router = useRouter();

  const [adminLogin, setAdminLogin] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminLogin((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!adminLogin.email.trim()) {
      showError("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminLogin.email)) {
      showError("Please enter a valid email");
      return false;
    }
    if (!adminLogin.password) {
      showError("Please enter your password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("email", adminLogin.email);
      formData.append("password", adminLogin.password)

      const { data } = await axios.post("/api/auth/admin/login", formData);

      if (!data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      showSuccess("Welcome back, admin.");

      // Redirect to admin dashboard
      setTimeout(() => router.push("/admin"), 600);
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#0F0F0E] text-[#F5F1EA] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo / brand */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight inline-block"
            >
              <span className="text-[#F5F1EA]">ELE</span>
              <span className="text-[#D98880]">OKA</span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#8A6A52] mt-2">
              Admin Panel
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#1A1A18] rounded-[28px] border border-white/5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] p-7 sm:p-9">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D98880]/10 border border-[#D98880]/20 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D98880]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D98880]">
                  Secure access
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-[#F5F1EA] leading-tight">
                Admin sign in
              </h1>
              <p className="text-sm text-[#8A6A52] mt-2">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8A199] mb-2"
                >
                  Email address
                </label>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3.5 focus-within:border-[#D98880]/40 focus-within:bg-white/[0.05] transition-all">
                  <Mail className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={adminLogin.email}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="admin@eleoka.com"
                    className="w-full bg-transparent outline-none text-sm text-[#F5F1EA] placeholder:text-[#8A6A52]/50 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#A8A199] mb-2"
                >
                  Password
                </label>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3.5 focus-within:border-[#D98880]/40 focus-within:bg-white/[0.05] transition-all">
                  <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={adminLogin.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter your password"
                    className="w-full bg-transparent outline-none text-sm text-[#F5F1EA] placeholder:text-[#8A6A52]/50 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="shrink-0 text-[#8A6A52] hover:text-[#F5F1EA] transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#D98880] text-[#1A1A18] py-3.5 rounded-full font-semibold text-sm hover:bg-[#c97770] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="text-xs text-[#8A6A52] text-center mt-6">
              Not an admin?{" "}
              <Link
                href="/signin"
                className="text-[#F5F1EA] hover:text-[#D98880] underline underline-offset-4 transition-colors"
              >
                Sign in as customer
              </Link>
            </p>
          </div>

          {/* Back link */}
          <p className="text-xs text-[#8A6A52] text-center mt-6">
            <Link href="/" className="hover:text-[#F5F1EA] transition-colors">
              Back to ELEOKA
            </Link>
          </p>
        </motion.div>
      </main>

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
