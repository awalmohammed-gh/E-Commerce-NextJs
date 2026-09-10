import {Poppins } from "next/font/google";
import "./globals.css";
import { EcommerceContextProvider } from "@/context/EcommerceContextProvider";


const poppins = Poppins({
  subsets: ["latin"],
  weight:["300","400","500","600","700","800"]
});

export const metadata = {
  title: "Hood Hub",
  description: "Making shopping ease to shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <EcommerceContextProvider>{children}</EcommerceContextProvider>
      </body>
    </html>
  );
}
