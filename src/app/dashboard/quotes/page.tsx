import TopBar from "@/components/layout/TopBar";

export default function QuotesPage() {
  return (
    <>
      <TopBar
        title="Quotes"
        subtitle="Request and manage freight quotes."
      />
      <main className="p-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-600 dark:text-slate-400">
            Quotes coming in Phase 5.
          </p>
        </div>
      </main>
    </>
  );
}
