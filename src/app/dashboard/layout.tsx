import TopBar from "@/components/layout/TopBar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f6f7f8]">
        <TopBar />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
