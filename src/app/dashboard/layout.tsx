import TopBar from "@/components/layout/TopBar";
import AuthGuard from "@/components/auth/AuthGuard";
import { UserProvider } from "@/contexts/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserProvider>
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-dark-bg">
          <TopBar />
          <main>{children}</main>
        </div>
      </UserProvider>
    </AuthGuard>
  );
}
