"use client";

import { motion } from "framer-motion";
import { Send, Mail } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section className="bg-[#0F172A] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-3 rounded-full">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Subscribe to Our Newsletter
          </h2>

          {/* Description */}
          <p className="text-white/70 text-sm sm:text-base mb-6 max-w-md mx-auto">
            Get the latest updates on new products and upcoming sales
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 transition-colors duration-200"
              required
            />
            <button
              type="submit"
              className="bg-white text-[#0F172A] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap hover:scale-105"
            >
              Subscribe
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Success Message */}
          {isSubmitted && (
            <motion.p
              className="text-green-400 text-sm mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Successfully subscribed!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
