"use client";

import { useEffect, useState } from "react";
import { getForwarders, upsertForwarder, updateForwarder, deleteForwarder } from "@/lib/supabase/api";
import type { Forwarder } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import CarrierCard from "@/components/ui/CarrierCard";
import CarrierDetailModal from "@/components/carriers/CarrierDetailModal";
import AddCarrierModal from "@/components/carriers/AddCarrierModal";
import EditCarrierModal from "@/components/carriers/EditCarrierModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { decryptCredentials } from "@/lib/encryption";
import { getMonogram, getInitials, getCategoryIcon, getCategoryLabel } from "@/lib/carrier-utils";
import { useUser } from "@/contexts/UserContext";
import { CarriersSkeleton } from "@/components/ui/Skeleton";

export default function CarriersPage() {
  const { canEdit } = useUser();
  const [carriers, setCarriers] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Forwarder | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [detailCarrier, setDetailCarrier] = useState<Forwarder | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "global" | "regional" | "africa" | "roro">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

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
    await upsertForwarder(carrierData as Partial<Forwarder>);
    await loadCarriers();
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
    await updateForwarder(id, updates);
    await loadCarriers();
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteForwarder(deleteTarget);
      setDetailCarrier(null);
      toast.success("Carrier deleted successfully.");
      await loadCarriers();
    } catch (error) {
      console.error("Error deleting carrier:", error);
      toast.error("Failed to delete carrier.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const isLinked = (c: Forwarder) => ["active", "approved"].includes(c.status);

  const statusOrder: Record<string, number> = {
    active: 0, approved: 0,
    pending: 1,
    not_contacted: 2,
    inactive: 3,
  };

  const filtered = carriers
    .filter((c) => {
      if (filter === "active" && !isLinked(c)) return false;
      if (filter === "pending" && c.status !== "pending") return false;
      if (filter === "inactive" && !["not_contacted", "inactive"].includes(c.status)) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
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
    })
    .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

  const stats = {
    total: carriers.length,
    active: carriers.filter((c) => isLinked(c)).length,
    pending: carriers.filter((c) => c.status === "pending").length,
    sudan: carriers.filter((c) => c.sudan_available).length,
  };

  if (loading) {
    return <CarriersSkeleton />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carrier Directory</h1>
          <p className="text-slate-500 mt-1">Manage carrier portals, credentials, and account representatives.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Carrier
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Carriers", count: stats.total, icon: "corporate_fare", color: "bg-slate-50 text-slate-600" },
          { label: "Authenticated", count: stats.active, icon: "verified", color: "bg-emerald-50 text-emerald-600" },
          { label: "Pending Setup", count: stats.pending, icon: "hourglass_top", color: "bg-amber-50 text-amber-600" },
          { label: "Sudan Ready", count: stats.sudan, icon: "flag", color: "bg-blue-50 text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.count}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm"
              placeholder="Search by name, website, or coverage area..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(["all", "active", "pending", "inactive"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                    filter === f
                      ? "bg-white text-[#137fec] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-[#137fec] focus:border-[#137fec]"
            >
              <option value="all">All Categories</option>
              <option value="global">Global</option>
              <option value="regional">Regional</option>
              <option value="africa">Africa</option>
              <option value="roro">RORO</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#137fec] shadow-sm" : "text-slate-400"}`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#137fec] shadow-sm" : "text-slate-400"}`}
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrier Grid */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((carrier) => (
              <CarrierCard
                key={carrier.id}
                carrier={carrier}
                onClick={() => setDetailCarrier(carrier)}
                onEditClick={canEdit ? () => handleEditClick(carrier) : undefined}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filtered.map((carrier) => {
              const mono = getMonogram(carrier.name);
              let hasCreds = false;
              if (carrier.encrypted_credentials) { try { decryptCredentials(carrier.encrypted_credentials); hasCreds = true; } catch {} }

              return (
                <div
                  key={carrier.id}
                  onClick={() => setDetailCarrier(carrier)}
                  className="flex items-center gap-5 p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-lg ${mono.bg} ${mono.text} flex items-center justify-center font-black text-sm shadow-sm shrink-0`}>
                    {getInitials(carrier.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-slate-900 group-hover:text-[#137fec] transition-colors">{carrier.name}</h4>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-semibold">{getCategoryLabel(carrier.category)}</span>
                      {carrier.sudan_available && (
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-semibold">🇸🇩 Sudan</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="truncate max-w-[200px]">{carrier.website?.replace(/https?:\/\/(www\.)?/, "")}</span>
                      {carrier.coverage && carrier.coverage.length > 0 && (
                        <span className="hidden md:inline">· {carrier.coverage.slice(0, 3).join(", ")}{carrier.coverage.length > 3 ? ` +${carrier.coverage.length - 3}` : ""}</span>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    {hasCreds ? (
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]" title="Credentials stored">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-[18px]" title="No credentials">lock_open</span>
                    )}
                  </div>

                  <StatusBadge status={carrier.status} />

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {carrier.dashboard_url && (
                      <a
                        href={carrier.dashboard_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                        title="Open Portal"
                      >
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                      </a>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleEditClick(carrier)}
                        className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    )}
                  </div>

                  <span className="material-symbols-outlined text-slate-300 group-hover:text-[#137fec] transition-colors">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center shadow-sm">
          <span className="material-symbols-outlined text-slate-200 text-7xl mb-4 block">corporate_fare</span>
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            {searchQuery || filter !== "all" || categoryFilter !== "all" ? "No carriers match your filters" : "No carriers yet"}
          </h4>
          <p className="text-slate-500 mb-6">
            {searchQuery || filter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first carrier to start managing your logistics network"}
          </p>
          {!searchQuery && filter === "all" && categoryFilter === "all" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#137fec] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Add Carrier
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <CarrierDetailModal
        carrier={detailCarrier}
        onClose={() => setDetailCarrier(null)}
        onEdit={canEdit ? () => { const c = detailCarrier; setDetailCarrier(null); if (c) handleEditClick(c); } : undefined}
        onDelete={canEdit ? () => { if (detailCarrier) handleDeleteRequest(detailCarrier.id); } : undefined}
      />

      {/* Add/Edit Modals */}
      <AddCarrierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCarrier} />
      <EditCarrierModal
        isOpen={!!editingCarrier}
        onClose={() => setEditingCarrier(null)}
        onSave={handleSaveEdit}
        carrier={editingCarrier}
        decryptedUsername={editUsername}
        decryptedPassword={editPassword}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Carrier"
        message="This will permanently delete this carrier and all associated credentials. This action cannot be undone."
        confirmLabel="Delete Carrier"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
