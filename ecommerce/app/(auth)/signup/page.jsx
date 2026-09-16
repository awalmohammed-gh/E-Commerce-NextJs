"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowRight } from "lucide-react";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignup((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear that field's error as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!signup.fullName.trim()) {
      next.fullName = "Please enter your full name";
    }

    if (!signup.email.trim()) {
      next.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email)) {
      next.email = "Please enter a valid email";
    }

    if (!signup.password) {
      next.password = "Please enter a password";
    } else if (signup.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    if (!signup.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (signup.confirmPassword !== signup.password) {
      next.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      next.agreeTerms = "You must agree to the terms";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // TODO: replace with real signup API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/signin");
      }, 1200);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-[#F5F1EA] text-[#1C1A17] flex items-center justify-center px-4 py-12 sm:py-16">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

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
          <div className="text-center mb-8">
            <h1 className="font-editorial font-semibold text-3xl sm:text-4xl text-[#1C1A17] leading-tight">
              Create your account
            </h1>
            <p className="font-utility text-sm text-[#8A6A52] mt-2">
              Join ELEOKA and discover dresses made for you.
            </p>
          </div>

          {/* Social signup */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-[#1C1A17]/10 rounded-xl py-3 hover:bg-[#F5F1EA] transition-colors"
              aria-label="Sign up with Google"
            >
              <FaGoogle className="w-4 h-4 text-[#DB4437]" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-[#1C1A17]/10 rounded-xl py-3 hover:bg-[#F5F1EA] transition-colors"
              aria-label="Sign up with Facebook"
            >
              <FaFacebookF className="w-4 h-4 text-[#1877F2]" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-[#1C1A17]/10 rounded-xl py-3 hover:bg-[#F5F1EA] transition-colors"
              aria-label="Sign up with Apple"
            >
              <FaApple className="w-4 h-4 text-[#1C1A17]" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-[#1C1A17]/10" />
            <span className="font-utility text-xs text-[#8A6A52] uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-[1px] bg-[#1C1A17]/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
              >
                Full name
              </label>
              <div
                className={`flex items-center gap-3 bg-[#F5F1EA]/60 border rounded-xl px-4 py-3 transition-colors ${
                  errors.fullName
                    ? "border-red-400"
                    : "border-transparent focus-within:border-[#1C1A17]"
                }`}
              >
                <User className="w-4 h-4 text-[#8A6A52] shrink-0" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={signup.fullName}
                  onChange={handleChange}
                  placeholder="Eleoka Enterprise"
                  className="w-full bg-transparent outline-none font-utility text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                />
              </div>
              {errors.fullName && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
              >
                Email address
              </label>
              <div
                className={`flex items-center gap-3 bg-[#F5F1EA]/60 border rounded-xl px-4 py-3 transition-colors ${
                  errors.email
                    ? "border-red-400"
                    : "border-transparent focus-within:border-[#1C1A17]"
                }`}
              >
                <Mail className="w-4 h-4 text-[#8A6A52] shrink-0" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={signup.email}
                  onChange={handleChange}
                  placeholder="eleoka@example.com"
                  className="w-full bg-transparent outline-none font-utility text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                />
              </div>
              {errors.email && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
              >
                Password
              </label>
              <div
                className={`flex items-center gap-3 bg-[#F5F1EA]/60 border rounded-xl px-4 py-3 transition-colors ${
                  errors.password
                    ? "border-red-400"
                    : "border-transparent focus-within:border-[#1C1A17]"
                }`}
              >
                <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={signup.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent outline-none font-utility text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[#8A6A52] hover:text-[#1C1A17] transition-colors shrink-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
              >
                Confirm password
              </label>
              <div
                className={`flex items-center gap-3 bg-[#F5F1EA]/60 border rounded-xl px-4 py-3 transition-colors ${
                  errors.confirmPassword
                    ? "border-red-400"
                    : "border-transparent focus-within:border-[#1C1A17]"
                }`}
              >
                <Lock className="w-4 h-4 text-[#8A6A52] shrink-0" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={signup.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full bg-transparent outline-none font-utility text-sm text-[#1C1A17] placeholder:text-[#8A6A52]/60"
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
              {errors.confirmPassword && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <span className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) {
                        setErrors((prev) => ({ ...prev, agreeTerms: "" }));
                      }
                    }}
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
                <span className="font-utility text-xs text-[#4A463F] leading-relaxed">
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
              {errors.agreeTerms && (
                <p className="font-utility text-xs text-red-500 mt-1.5">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-[#1C1A17] text-[#F5F1EA] py-3.5 rounded-full font-utility font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#332F29] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
          <p className="font-utility text-sm text-[#4A463F] text-center mt-6">
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
        <p className="font-utility text-xs text-[#8A6A52] text-center mt-6">
          <Link href="/" className="hover:text-[#1C1A17] transition-colors">
            Back to ELEOKA
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
