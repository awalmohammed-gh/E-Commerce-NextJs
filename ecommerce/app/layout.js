import { Cormorant_Garamond, Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { EcommerceContextProvider } from "@/context/EcommerceContextProvider";
import MotionProvider from "@/components/common/MotionProvider";

// Admin dashboard font (the body default)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Storefront fonts, applied through the .storefront class
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: {
    default: "ELEOKA Women's Dresses, Made with Care",
    template: "%s | ELEOKA",
  },

  description:
    "ELEOKA is a women's fashion boutique born in Accra. Dresses, tops, sets and accessories chosen for real women, delivered across Ghana.",

  keywords: [
    "ELEOKA",
    "women's dresses",
    "dress boutique Accra",
    "Ghana fashion",
    "elegant dresses",
    "online dress shop",
  ],

  authors: [{ name: "ELEOKA" }],
  creator: "ELEOKA",
  publisher: "ELEOKA",

  openGraph: {
    type: "website",
    siteName: "ELEOKA",
    locale: "en_GH",
    title: "ELEOKA Women's Dresses, Made with Care",
    description:
      "A women's dress boutique born in Accra, made for women everywhere.",
  },

  twitter: {
    card: "summary_large_image",
    title: "ELEOKA Women's Dresses, Made with Care",
    description:
      "A women's dress boutique born in Accra, made for women everywhere.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#1C1A17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cormorant.variable} ${manrope.variable}`}
      // Browser extensions (e.g. Grammarly) add attributes to <html>/<body>
      // before React loads. This ignores attribute differences on these two
      // elements only; mismatches inside the page are still reported.
      suppressHydrationWarning
    >
      <body className={poppins.className} suppressHydrationWarning>
        <MotionProvider>
          <EcommerceContextProvider>{children}</EcommerceContextProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
