import { Poppins } from "next/font/google";
import "./globals.css";
import { EcommerceContextProvider } from "@/context/EcommerceContextProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: {
    default: "ELEOKA — Women's Dresses, Made with Care",
    template: "%s | ELEOKA",
  },

  description:
    "ELEOKA is a women's dress boutique born in Accra. Elegant, timeless dresses made for real women. Free delivery in Accra.",

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
    title: "ELEOKA — Women's Dresses, Made with Care",
    description:
      "A women's dress boutique born in Accra, made for women everywhere.",
  },

  twitter: {
    card: "summary_large_image",
    title: "ELEOKA — Women's Dresses, Made with Care",
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
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <EcommerceContextProvider>{children}</EcommerceContextProvider>
      </body>
    </html>
  );
}
