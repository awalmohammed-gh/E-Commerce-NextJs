"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Check,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";

/* ------------------------------------------------------------------
   Location constants - update once, used everywhere
------------------------------------------------------------------ */
const ADDRESS_LINE_1 = "Spintex Road, Flower Pot";
const ADDRESS_LINE_2 = "Near Assemblies of God Church, Accra";

const GOOGLE_MAPS_QUERY =
  "Flower+Pot+Spintex+Road+Assemblies+of+God+Church+Accra";

const GOOGLE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${GOOGLE_MAPS_QUERY}`;

const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`;

/* ------------------------------------------------------------------
   Shared animation variant
------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Replace with your API / Formspree / Resend call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    }, 900);
  };

  const contactDetails = [
    {
      icon: Mail,
      label: "Email us",
      value: "hello@eleoka.com",
      href: "mailto:hello@eleoka.com",
    },
    {
      icon: Phone,
      label: "Call us",
      value: "+233 55 123 4567",
      href: "tel:+233551234567",
    },
    {
      icon: MapPin,
      label: "Visit us",
      value: `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`,
      href: GOOGLE_MAPS_LINK,
    },
    {
      icon: Clock,
      label: "Open hours",
      value: "Mon - Sat, 9am - 7pm",
      href: null,
    },
  ];

  // Social icons from react-icons
  const socials = [
    {
      Icon: FaInstagram,
      label: "Instagram",
      href: "https://instagram.com",
    },
    {
      Icon: FaFacebookF,
      label: "Facebook",
      href: "https://facebook.com",
    },
    {
      Icon: FaTwitter,
      label: "Twitter",
      href: "https://twitter.com",
    },
    {
      Icon: FaTiktok,
      label: "TikTok",
      href: "https://tiktok.com",
    },
  ];

  const quickHelp = [
    {
      icon: HelpCircle,
      title: "Order and delivery",
      text: "Track your order, delivery times, or shipping fees.",
      href: "/faq",
    },
    {
      icon: MessageCircle,
      title: "Size and fit",
      text: "Not sure which size? Our guide helps you choose right.",
      href: "/size-guide",
    },
    {
      icon: ArrowRight,
      title: "Returns and exchanges",
      text: "Easy 14-day returns - see our policy for details.",
      href: "/returns",
    },
  ];

  return (
    <main className="bg-[#F5F1EA] text-[#1C1A17] overflow-hidden">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap");
        .font-editorial {
          font-family: "Cormorant Garamond", serif;
        }
        .font-utility {
          font-family: "Work Sans", sans-serif;
        }
      `}</style>

      {/* Hero */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="inline-block text-[#8A6A52] font-utility text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Get in touch
            </span>

            <h1 className="font-editorial font-semibold text-[#1C1A17] text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              We&apos;d love to
              <span className="text-[#D98880]"> hear from you.</span>
            </h1>

            <p className="font-utility text-[#4A463F] text-base sm:text-lg leading-relaxed mt-6 max-w-xl mx-auto">
              Whether you have a question about sizing, an order, or just want
              to say hello - our team replies within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form and details */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12">
            {/* Form */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm"
            >
              <h2 className="font-editorial font-semibold text-2xl sm:text-3xl text-[#1C1A17] mb-2">
                Send us a message
              </h2>
              <p className="font-utility text-sm text-[#8A6A52] mb-8">
                Fill in the form and we&apos;ll get back to you shortly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                    >
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Eleoka"
                      className="w-full font-utility text-sm text-[#1C1A17] bg-[#F5F1EA]/60 border border-transparent focus:border-[#1C1A17] rounded-xl px-4 py-3 outline-none placeholder:text-[#8A6A52]/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="eleoka@example.com"
                      className="w-full font-utility text-sm text-[#1C1A17] bg-[#F5F1EA]/60 border border-transparent focus:border-[#1C1A17] rounded-xl px-4 py-3 outline-none placeholder:text-[#8A6A52]/60 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Order enquiry, sizing help, collaboration"
                    className="w-full font-utility text-sm text-[#1C1A17] bg-[#F5F1EA]/60 border border-transparent focus:border-[#1C1A17] rounded-xl px-4 py-3 outline-none placeholder:text-[#8A6A52]/60 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block font-utility text-xs font-semibold text-[#1C1A17] uppercase tracking-wide mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us a little about what you need"
                    className="w-full font-utility text-sm text-[#1C1A17] bg-[#F5F1EA]/60 border border-transparent focus:border-[#1C1A17] rounded-xl px-4 py-3 outline-none placeholder:text-[#8A6A52]/60 transition-colors resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-7 py-3.5 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitted ? (
                    <>
                      <Check className="w-4 h-4" />
                      Message sent
                    </>
                  ) : loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Details */}
            <div className="space-y-6">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                <h3 className="font-editorial font-semibold text-xl text-[#1C1A17] mb-6">
                  Contact details
                </h3>

                <ul className="space-y-5">
                  {contactDetails.map((item) => {
                    const Icon = item.icon;
                    const content = (
                      <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-[#D98880]/15 flex items-center justify-center shrink-0 group-hover:bg-[#D98880]/25 transition-colors">
                          <Icon className="w-4 h-4 text-[#D98880]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-utility text-xs text-[#8A6A52] uppercase tracking-wide mb-0.5">
                            {item.label}
                          </p>
                          <p className="font-utility text-sm text-[#1C1A17] font-medium">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );

                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={
                              item.href.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              item.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="block"
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Socials */}
                <div className="mt-8 pt-6 border-t border-[#1C1A17]/10">
                  <p className="font-utility text-xs text-[#8A6A52] uppercase tracking-wide mb-3">
                    Follow us
                  </p>
                  <div className="flex items-center gap-3">
                    {socials.map(({ Icon, label, href }) => (
                      <motion.a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-[#F5F1EA] hover:bg-[#D98880]/15 flex items-center justify-center text-[#1C1A17] hover:text-[#D98880] transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* WhatsApp quick chat */}
                <div className="mt-6">
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-utility text-sm font-medium text-[#1C1A17] hover:text-[#25D366] transition-colors"
                  >
                    <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                    Chat with us on WhatsApp
                  </a>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={2}
                className="bg-[#1C1A17] text-[#F5F1EA] rounded-3xl p-6 sm:p-8"
              >
                <h3 className="font-editorial font-semibold text-xl mb-6">
                  Looking for something specific?
                </h3>

                <ul className="space-y-4">
                  {quickHelp.map((help) => {
                    const Icon = help.icon;
                    return (
                      <li key={help.title}>
                        <Link
                          href={help.href}
                          className="flex items-start gap-4 group"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#D98880]/20 flex items-center justify-center shrink-0 group-hover:bg-[#D98880]/30 transition-colors">
                            <Icon className="w-4 h-4 text-[#D98880]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-utility text-sm font-medium text-[#F5F1EA] group-hover:text-[#D98880] transition-colors">
                              {help.title}
                            </p>
                            <p className="font-utility text-xs text-[#F5F1EA]/60 mt-0.5">
                              {help.text}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Visit strip and map */}
      <section className="pb-20 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden bg-white shadow-sm"
          >
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#C89B3C]/15 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#C89B3C]" />
                </div>
                <div>
                  <p className="font-editorial text-xl text-[#1C1A17]">
                    Come see us
                  </p>
                  <p className="font-utility text-sm text-[#8A6A52]">
                    {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
                  </p>
                </div>
              </div>

              <div className="hidden lg:block w-[1px] h-12 bg-[#1C1A17]/10" />

              <div className="flex-1 text-center lg:text-left">
                <p className="font-utility text-sm sm:text-base text-[#4A463F] leading-relaxed">
                  Prefer to try pieces on in person?{" "}
                  <span className="font-semibold text-[#1C1A17]">
                    Visit our boutique
                  </span>{" "}
                  - our stylists will help you find your perfect fit.
                </p>
              </div>

              <motion.a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-[#1C1A17] text-[#F5F1EA] px-6 py-3 rounded-full font-utility font-medium text-sm hover:bg-[#332F29] transition-colors shrink-0"
              >
                Get directions
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>

            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[450px] border-t border-[#1C1A17]/5">
              <iframe
                title="ELEOKA Boutique Location"
                src={GOOGLE_MAPS_EMBED}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
