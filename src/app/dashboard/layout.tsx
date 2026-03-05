import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <Sidebar />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
