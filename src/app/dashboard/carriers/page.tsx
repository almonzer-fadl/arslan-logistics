"use client";

import { useEffect, useState } from "react";
import { getForwarders, upsertForwarder, updateForwarder, deleteForwarder } from "@/lib/supabase/api";
import type { Forwarder } from "@/lib/types";
import CarrierAccordion from "@/components/carriers/CarrierAccordion";
import AddCarrierModal from "@/components/carriers/AddCarrierModal";
import EditCarrierModal from "@/components/carriers/EditCarrierModal";

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Forwarder | null>(null);
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

  const filteredCarriers = carriers.filter((c) => {
    // Status filter
    if (filter === "active" && !["active", "approved"].includes(c.status)) return false;
    if (filter === "inactive" && !["inactive", "pending", "not_contacted"].includes(c.status)) return false;
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q) ||
        c.sales_rep_name?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.coverage || []).some((cov) => cov.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddCarrier = async (carrierData: Record<string, unknown>) => {
    try {
      await upsertForwarder(carrierData as Partial<Forwarder>);
      await loadCarriers();
    } catch (error) {
      console.error("Error adding carrier:", error);
      alert("Failed to add carrier.");
    }
  };

  const handleEditSave = async (id: string, updates: Partial<Forwarder>) => {
    try {
      await updateForwarder(id, updates);
      await loadCarriers();
    } catch (error) {
      console.error("Error updating carrier:", error);
      alert("Failed to update carrier.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteForwarder(id);
      await loadCarriers();
    } catch (error) {
      console.error("Error deleting carrier:", error);
      alert("Failed to delete carrier.");
    }
  };

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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Search by carrier name, coverage, or contact..." />
            </div>
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors uppercase ${filter === f ? "bg-[#137fec] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carrier Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{filteredCarriers.length} carrier{filteredCarriers.length !== 1 ? "s" : ""}</p>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> {carriers.filter((c) => ["active", "approved"].includes(c.status)).length} active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {carriers.filter((c) => c.status === "pending").length} pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> {carriers.filter((c) => c.status === "not_contacted").length} not contacted</span>
        </div>
      </div>

      {/* Carrier List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
        </div>
      ) : filteredCarriers.length > 0 ? (
        <div className="space-y-3">
          {filteredCarriers.map((carrier) => (
            <CarrierAccordion
              key={carrier.id}
              carrier={carrier}
              onEdit={() => setEditingCarrier(carrier)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block">corporate_fare</span>
          <h4 className="text-lg font-bold text-slate-900 mb-2">{searchQuery || filter !== "all" ? "No carriers found" : "No carriers yet"}</h4>
          <p className="text-slate-500 mb-4">{searchQuery || filter !== "all" ? "Try adjusting your filters" : "Add your first carrier"}</p>
        </div>
      )}

      {/* Modals */}
      <AddCarrierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCarrier} />
      <EditCarrierModal isOpen={!!editingCarrier} onClose={() => setEditingCarrier(null)} onSave={handleEditSave} onDelete={handleDelete} carrier={editingCarrier} />
    </div>
  );
}
