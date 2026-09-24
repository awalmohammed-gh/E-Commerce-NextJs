import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import AnnouncementBar from "@/components/common/AnnouncementBar";

export default function StoreLayout({ children }) {
  return (
    <div className="storefront flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-500 focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
