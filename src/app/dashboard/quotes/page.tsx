import TopBar from "@/components/layout/TopBar";

export default function QuotesPage() {
  return (
    <>
      <TopBar
        title="Quotes"
        subtitle="Request and manage freight quotes."
      />
      <main className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            Quotes coming in Phase 5.
          </p>
        </div>
      </main>
    </>
  );
}
