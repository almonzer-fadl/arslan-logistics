import TopBar from "@/components/layout/TopBar";

export default function CarriersPage() {
  return (
    <>
      <TopBar
        title="Carrier Hub"
        subtitle="Manage carrier credentials and connections."
      />
      <main className="p-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-600 dark:text-slate-400">
            Carrier directory coming in Phase 3.
          </p>
        </div>
      </main>
    </>
  );
}
