import TopBar from "@/components/layout/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar
        title="Settings"
        subtitle="Manage your account and preferences."
      />
      <main className="p-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            Settings coming in Phase 8.
          </p>
        </div>
      </main>
    </>
  );
}
