"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Check, ArrowRight } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "@/ui/LoadingSpinner";
import Toast from "@/ui/Toast";
import { useEcommerce } from "@/context/EcommerceContextProvider";

export default function MyLogin() {
  const router = useRouter();

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const {setIsLoggedIn, setUser} = useEcommerce()

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
    setLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!login.email.trim()) {
      showError("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login.email)) {
      showError("Please enter a valid email");
      return false;
    }
    if (!login.password) {
      showError("Please enter your password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", login.email);
      formData.append("password", login.password);

      const { data } = await axios.post("/api/auth/login", formData);

      if (!data.success) {
        showError(data.message || "Invalid email or password");
        return;
      }

      if(data.success){
        setUser(data.user)
          setSubmitted(true);
          showSuccess("Signed in successfully.");

          setTimeout(() => {
            router.push("/");
          }, 1200);
          setIsLoggedIn(true)
      }

     
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <main className="min-h-screen bg-[#F5F1EA] text-[#1C1A17] flex items-center justify-center px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-3xl font-bold tracking-tight inline-block"
            >
              <span className="text-[#1C1A17]">ELE</span>
              <span className="text-[#D98880]">OKA</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-7">
              <h1 className="font-semibold text-2xl text-[#1C1A17] leading-tight">
                Welcome back
              </h1>
              <p className="text-sm text-[#8A6A52] mt-2">
                Sign in to continue to ELEOKA.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                >
                  Email address
                </label>
                <div className="flex items-center gap-3 bg-[#F5F1EA]/60 border border-transparent focus-within:border-[#1C1A17] rounded-xl px-4 py-3 transition-colors">
                  <Mail className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={login.email}
                    onChange={handleChange}
                    placeholder="eleoka@example.com"
                    className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[#1C1A17] uppercase tracking-wide"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#8A6A52] hover:text-[#D98880] transition-colors underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="flex items-center gap-3 bg-[#F5F1EA]/60 border border-transparent focus-within:border-[#1C1A17] rounded-xl px-4 py-3 transition-colors">
                  <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={login.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[#8A6A52] hover:text-[#1C1A17] transition-colors shrink-0"
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

              {/* Remember me */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                  <span className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        rememberMe
                          ? "bg-[#1C1A17] border-[#1C1A17]"
                          : "border-[#1C1A17]/30 bg-white"
                      }`}
                    >
                      {rememberMe && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                  <span className="text-xs text-[#4A463F]">Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-[#1C1A17] text-[#F5F1EA] py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#332F29] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    Signed in
                  </>
                ) : loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign up link */}
            <p className="text-sm text-[#4A463F] text-center mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1C1A17] hover:text-[#D98880] transition-colors underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Back to shop */}
          <p className="text-xs text-[#8A6A52] text-center mt-6">
            <Link href="/" className="hover:text-[#1C1A17] transition-colors">
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
