import AdminShell from "@/components/admin/layout/AdminShell";
import { ToastProvider } from "@/components/admin/ui/Toast";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
