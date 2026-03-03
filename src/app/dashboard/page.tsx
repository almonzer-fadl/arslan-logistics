import TopBar from "@/components/layout/TopBar";

export default function DashboardPage() {
  return (
    <>
      <TopBar
        title="Main Dashboard Overview"
        subtitle="Manage your carrier links, quotes, and container shipments."
      />
      <main className="p-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Dashboard Content Coming Soon
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            This is where the main dashboard stats, carrier hub, and shipment tables will go.
          </p>
        </div>
      </main>
    </>
  );
}
