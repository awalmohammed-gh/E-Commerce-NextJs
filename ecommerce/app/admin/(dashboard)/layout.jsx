import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/ui/Toast";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="admin min-h-dvh">
        <AdminSidebar />

        {/* Offset by the fixed sidebar's width (w-60) on desktop */}
        <main id="admin-main" className="min-w-0 lg:pl-60">
          <div className="mx-auto w-full max-w-330 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
