import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <TopBar />
      <main>{children}</main>
    </div>
  );
}
