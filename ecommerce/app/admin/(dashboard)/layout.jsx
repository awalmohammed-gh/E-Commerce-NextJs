import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#1C1A17] lg:flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0 min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
