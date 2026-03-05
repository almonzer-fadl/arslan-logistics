import TopBar from "@/components/layout/TopBar";

export default function ShipmentsPage() {
  return (
    <>
      <TopBar
        title="Shipments"
        subtitle="Track and manage your shipments."
      />
      <main className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            Shipment tracking coming in Phase 4.
          </p>
        </div>
      </main>
    </>
  );
}
