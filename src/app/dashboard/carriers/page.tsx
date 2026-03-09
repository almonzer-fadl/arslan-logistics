"use client";

import { useEffect, useState } from "react";
import { getForwarders, upsertForwarder, updateForwarder, deleteForwarder } from "@/lib/supabase/api";
import type { Forwarder } from "@/lib/types";
import CarrierAccordion from "@/components/carriers/CarrierAccordion";
import AddCarrierModal from "@/components/carriers/AddCarrierModal";
import EditCarrierModal from "@/components/carriers/EditCarrierModal";
import { decryptCredentials } from "@/lib/encryption";

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Forwarder | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      const data = await getForwarders();
      setCarriers(data);
    } catch (error) {
      console.error("Error loading carriers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarrier = async (carrierData: Record<string, unknown>) => {
    try {
      await upsertForwarder(carrierData as Partial<Forwarder>);
      await loadCarriers();
    } catch (error) {
      console.error("Error adding carrier:", error);
      alert("Failed to add carrier.");
    }
  };

  const handleEditClick = (carrier: Forwarder) => {
    let username = "";
    let password = "";
    if (carrier.encrypted_credentials) {
      try {
        const creds = decryptCredentials(carrier.encrypted_credentials);
        username = creds.username || "";
        password = creds.password || "";
      } catch {}
    }
    setEditUsername(username);
    setEditPassword(password);
    setEditingCarrier(carrier);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Forwarder>) => {
    try {
      await updateForwarder(id, updates);
      await loadCarriers();
    } catch (error) {
      console.error("Error updating carrier:", error);
      alert("Failed to update carrier.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carrier? This cannot be undone.")) return;
    try {
      await deleteForwarder(id);
      await loadCarriers();
    } catch (error) {
      console.error("Error deleting carrier:", error);
      alert("Failed to delete carrier.");
    }
  };

  const filtered = carriers.filter((c) => {
    if (filter === "active" && !["active", "approved"].includes(c.status)) return false;
    if (filter === "inactive" && ["active", "approved"].includes(c.status)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q) ||
        c.sales_rep_name?.toLowerCase().includes(q) ||
        c.coverage?.some((area) => area.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carrier Directory</h1>
          <p className="text-slate-500 mt-1">Manage carrier credentials and portal access (AES-256 encrypted)</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20">
          <span className="material-symbols-outlined">add</span>
          Add New Carrier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", count: carriers.length, icon: "corporate_fare", color: "slate" },
          { label: "Active", count: carriers.filter((c) => ["active", "approved"].includes(c.status)).length, icon: "check_circle", color: "green" },
          { label: "Pending", count: carriers.filter((c) => c.status === "pending").length, icon: "hourglass_top", color: "amber" },
          { label: "Sudan Ready", count: carriers.filter((c) => c.sudan_available).length, icon: "public", color: "blue" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color === "green" ? "bg-green-50 text-green-600" : s.color === "amber" ? "bg-amber-50 text-amber-600" : s.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{s.count}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Search by name, website, contact, or coverage area..." />
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${filter === f ? "bg-white text-[#137fec] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carrier List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((carrier) => (
            <CarrierAccordion
              key={carrier.id}
              carrier={carrier}
              onEdit={() => handleEditClick(carrier)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block">corporate_fare</span>
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            {searchQuery || filter !== "all" ? "No carriers found" : "No carriers yet"}
          </h4>
          <p className="text-slate-500 mb-4">
            {searchQuery || filter !== "all" ? "Try adjusting your filters" : "Add your first carrier to start"}
          </p>
        </div>
      )}

      {/* Modals */}
      <AddCarrierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCarrier} />
      <EditCarrierModal
        isOpen={!!editingCarrier}
        onClose={() => setEditingCarrier(null)}
        onSave={handleSaveEdit}
        carrier={editingCarrier}
        decryptedUsername={editUsername}
        decryptedPassword={editPassword}
      />
    </div>
  );
}
