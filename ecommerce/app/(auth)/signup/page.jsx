"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/ui/LoadingSpinner";
import Toast from "@/ui/Toast";
import { useEcommerce } from "@/context/EcommerceContextProvider";

export default function MySignUp() {
  const router = useRouter();

  const [signup, setSignup] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {setIsLoggedIn} = useEcommerce()

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
    setSignup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!signup.fullName.trim()) {
      showError("Please enter your full name");
      return false;
    }

    if (!signup.email.trim()) {
      showError("Please enter your email");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email)) {
      showError("Please enter a valid email");
      return false;
    }

    if (!signup.password) {
      showError("Please enter a password");
      return false;
    }

    if (signup.password.length < 6) {
      showError("Password must be at least 6 characters");
      return false;
    }

    if (!signup.confirmPassword) {
      showError("Please confirm your password");
      return false;
    }

    if (signup.confirmPassword !== signup.password) {
      showError("Passwords do not match");
      return false;
    }

    if (!agreeTerms) {
      showError("You must agree to the terms");
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

      formData.append("fullName", signup.fullName);
      formData.append("email", signup.email);
      formData.append("password", signup.password);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Something went wrong");
        return;
      }
      
      setIsLoggedIn(true)
      setSubmitted(true);
      showSuccess("Account created successfully.");

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error) {
      console.error("Signup error:", error);
      showError("Something went wrong. Please try again.");
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
                Create your account
              </h1>
              <p className="text-sm text-[#8A6A52] mt-2">
                Join ELEOKA and discover dresses made for you.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                >
                  Full name
                </label>
                <div className="flex items-center gap-3 bg-[#F5F1EA]/60 border border-transparent focus-within:border-[#1C1A17] rounded-xl px-4 py-3 transition-colors">
                  <User className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={signup.fullName}
                    onChange={handleChange}
                    placeholder="Eleoka Enterprise"
                    className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                  />
                </div>
              </div>

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
                    value={signup.email}
                    onChange={handleChange}
                    placeholder="eleoka@example.com"
                    className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                >
                  Password
                </label>
                <div className="flex items-center gap-3 bg-[#F5F1EA]/60 border border-transparent focus-within:border-[#1C1A17] rounded-xl px-4 py-3 transition-colors">
                  <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={signup.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
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

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                >
                  Confirm password
                </label>
                <div className="flex items-center gap-3 bg-[#F5F1EA]/60 border border-transparent focus-within:border-[#1C1A17] rounded-xl px-4 py-3 transition-colors">
                  <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={signup.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent outline-none text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-[#8A6A52] hover:text-[#1C1A17] transition-colors shrink-0"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <span className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        agreeTerms
                          ? "bg-[#1C1A17] border-[#1C1A17]"
                          : "border-[#1C1A17]/30 bg-white"
                      }`}
                    >
                      {agreeTerms && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                  <span className="text-xs text-[#4A463F] leading-relaxed">
                    I agree to ELEOKA&apos;s{" "}
                    <Link
                      href="/terms"
                      className="text-[#1C1A17] underline underline-offset-2 hover:text-[#D98880] transition-colors"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#1C1A17] underline underline-offset-2 hover:text-[#D98880] transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </span>
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
                    Account created
                  </>
                ) : loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign in link */}
            <p className="text-sm text-[#4A463F] text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-[#1C1A17] hover:text-[#D98880] transition-colors underline underline-offset-4"
              >
                Sign in
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
