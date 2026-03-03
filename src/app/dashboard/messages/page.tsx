import TopBar from "@/components/layout/TopBar";

export default function MessagesPage() {
  return (
    <>
      <TopBar
        title="Messages"
        subtitle="View and respond to carrier messages."
      />
      <main className="p-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-600 dark:text-slate-400">
            Messages coming in Phase 8.
          </p>
        </div>
      </main>
    </>
  );
}
