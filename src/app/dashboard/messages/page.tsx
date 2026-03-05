import TopBar from "@/components/layout/TopBar";

export default function MessagesPage() {
  return (
    <>
      <TopBar
        title="Messages"
        subtitle="View and respond to carrier messages."
      />
      <main className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            Messages coming in Phase 8.
          </p>
        </div>
      </main>
    </>
  );
}
