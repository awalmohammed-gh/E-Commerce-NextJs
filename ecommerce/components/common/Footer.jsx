"use client";

import Link from "next/link";
import { Heart, Shield, CreditCard, Truck, Clock } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaApplePay,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-2xl sm:text-3xl font-bold inline-block"
            >
              <span className="text-white">ELE</span>
              <span className="text-[#D98880]">OKA</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Women&apos;s dresses made with care. Timeless silhouettes,
              thoughtful fabrics, and pieces that make you feel like the best
              version of yourself.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label="YouTube"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-6"
                aria-label="TikTok"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Shop All Dresses
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Style Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Payment &amp; Security
            </h3>

            {/* Payment Methods */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3">We accept:</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <FaCcVisa className="w-8 h-6 text-white" />
                </span>
                <span className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <FaCcMastercard className="w-8 h-6 text-white" />
                </span>
                <span className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <FaPaypal className="w-8 h-6 text-white" />
                </span>
                <span className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <FaApplePay className="w-8 h-6 text-white" />
                </span>
              </div>
            </div>

            {/* Security Badges */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-gray-400 text-sm mb-3">Secure shopping:</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>SSL Secure Connection</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>24/7 Customer Support</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Truck className="w-4 h-4 text-orange-400" />
                  <span>Free delivery in Accra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              &copy; {currentYear} ELEOKA. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>by ELEOKA Team</span>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/sitemap"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
