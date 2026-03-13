"use client";

import { useEffect, useState } from "react";
import { getForwarders, upsertForwarder, updateForwarder, deleteForwarder } from "@/lib/supabase/api";
import type { Forwarder } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import AddCarrierModal from "@/components/carriers/AddCarrierModal";
import EditCarrierModal from "@/components/carriers/EditCarrierModal";
import { decryptCredentials } from "@/lib/encryption";

// Monogram colors per carrier (consistent brand feel)
const monogramColors: Record<string, { bg: string; text: string }> = {
  "Maersk": { bg: "bg-[#004B87]", text: "text-white" },
  "MSC": { bg: "bg-[#00843D]", text: "text-white" },
  "CMA CGM": { bg: "bg-[#003DA5]", text: "text-white" },
  "Hapag-Lloyd": { bg: "bg-[#FF6600]", text: "text-white" },
  "DB Schenker": { bg: "bg-[#E60028]", text: "text-white" },
  "Kuehne+Nagel": { bg: "bg-[#001F5B]", text: "text-white" },
  "DHL": { bg: "bg-[#FFCC00]", text: "text-[#CC0000]" },
  "Sallaum": { bg: "bg-[#1B3A5C]", text: "text-white" },
  "EUKOR": { bg: "bg-[#002B5C]", text: "text-white" },
};

function getMonogram(name: string) {
  const match = Object.keys(monogramColors).find((k) => name.includes(k));
  if (match) return monogramColors[match];
  // Generate a deterministic color from name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return { bg: `bg-slate-700`, text: "text-white" };
}

function getInitials(name: string): string {
  // Special cases
  if (name.includes("MSC")) return "MSC";
  if (name.includes("CMA")) return "CMA";
  if (name.includes("DHL")) return "DHL";
  // Default: first letter of first 2 words
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "roro": return "directions_car";
    case "africa": return "public";
    case "regional": return "flag";
    default: return "directions_boat";
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "global": return "Global Carrier";
    case "regional": return "Turkey Regional";
    case "africa": return "Africa Specialist";
    case "roro": return "RORO Vehicle";
    default: return category;
  }
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Forwarder | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [detailCarrier, setDetailCarrier] = useState<Forwarder | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "global" | "regional" | "africa" | "roro">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this carrier? This cannot be undone.")) return;
    try {
      await deleteForwarder(id);
      setDetailCarrier(null);
      await loadCarriers();
    } catch (error) {
      console.error("Error deleting carrier:", error);
      alert("Failed to delete carrier.");
    }
  };

  const getCredentials = (carrier: Forwarder) => {
    if (!carrier.encrypted_credentials) return null;
    try {
      return decryptCredentials(carrier.encrypted_credentials);
    } catch {
      return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carrier Directory</h1>
          <p className="text-slate-500 mt-1">Manage carrier portals, credentials, and account representatives.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Carrier
        </button>
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
            {filtered.map((carrier) => {
              const mono = getMonogram(carrier.name);
              const linked = isLinked(carrier);
              const creds = getCredentials(carrier);

              return (
                <div
                  key={carrier.id}
                  onClick={() => { setDetailCarrier(carrier); setShowCredentials(false); }}
                  className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                    !linked ? "opacity-90" : ""
                  }`}
                >
                  {/* Top accent bar */}
                  <div className={`h-1 w-full ${linked ? "bg-emerald-500" : carrier.status === "pending" ? "bg-amber-400" : "bg-slate-300"}`} />

                  <div className="p-5">
                    {/* Logo + Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-lg ${mono.bg} ${mono.text} flex items-center justify-center font-black text-sm shadow-sm`}>
                        {getInitials(carrier.name)}
                      </div>
                      <StatusBadge status={carrier.status} />
                    </div>

                    {/* Name + Category */}
                    <h4 className="font-bold text-slate-900 mb-0.5 group-hover:text-[#137fec] transition-colors">{carrier.name}</h4>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="material-symbols-outlined text-slate-400 text-[14px]">{getCategoryIcon(carrier.category)}</span>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{getCategoryLabel(carrier.category)}</p>
                    </div>

                    {/* Coverage Tags */}
                    <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
                      {carrier.coverage?.slice(0, 3).map((area) => (
                        <span key={area} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {area}
                        </span>
                      ))}
                      {(carrier.coverage?.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">
                          +{carrier.coverage!.length - 3}
                        </span>
                      )}
                      {carrier.sudan_available && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                          🇸🇩 Sudan
                        </span>
                      )}
                    </div>

                    {/* Credential indicator + Quick Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        {creds ? (
                          <>
                            <span className="material-symbols-outlined text-emerald-500 text-[16px]">lock</span>
                            <span className="text-[10px] text-emerald-600 font-semibold uppercase">Credentials Stored</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-slate-300 text-[16px]">lock_open</span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">No Credentials</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {carrier.dashboard_url && (
                          <a
                            href={carrier.dashboard_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                            title="Open Portal"
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleEditClick(carrier)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {filtered.map((carrier) => {
              const mono = getMonogram(carrier.name);
              const linked = isLinked(carrier);
              const creds = getCredentials(carrier);

              return (
                <div
                  key={carrier.id}
                  onClick={() => { setDetailCarrier(carrier); setShowCredentials(false); }}
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
                    {creds ? (
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
                    <button
                      onClick={() => handleEditClick(carrier)}
                      className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
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
      {detailCarrier && (
        <Modal
          isOpen={!!detailCarrier}
          onClose={() => setDetailCarrier(null)}
          title=""
          maxWidth="2xl"
        >
          <DetailView
            carrier={detailCarrier}
            onEdit={() => { setDetailCarrier(null); handleEditClick(detailCarrier); }}
            onDelete={() => handleDelete(detailCarrier.id)}
            showCredentials={showCredentials}
            setShowCredentials={setShowCredentials}
            copyToClipboard={copyToClipboard}
          />
        </Modal>
      )}

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
    </div>
  );
}

/* ─── Detail View (inside modal) ─── */

function DetailView({
  carrier,
  onEdit,
  onDelete,
  showCredentials,
  setShowCredentials,
  copyToClipboard,
}: {
  carrier: Forwarder;
  onEdit: () => void;
  onDelete: () => void;
  showCredentials: boolean;
  setShowCredentials: (v: boolean) => void;
  copyToClipboard: (t: string) => void;
}) {
  const mono = getMonogram(carrier.name);
  const linked = ["active", "approved"].includes(carrier.status);
  const [showPw, setShowPw] = useState(false);

  let creds: { username?: string; password?: string } | null = null;
  if (carrier.encrypted_credentials) {
    try {
      creds = decryptCredentials(carrier.encrypted_credentials);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-xl ${mono.bg} ${mono.text} flex items-center justify-center font-black text-xl shadow-md`}>
          {getInitials(carrier.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-black text-slate-900">{carrier.name}</h2>
            <StatusBadge status={carrier.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(carrier.category)}</span>
            <span>{getCategoryLabel(carrier.category)}</span>
            {carrier.sudan_available && (
              <span className="text-green-600 font-semibold ml-2">🇸🇩 Sudan Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        {carrier.website && (
          <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[16px]">language</span>
            Website
          </a>
        )}
        {carrier.dashboard_url && (
          <a href={carrier.dashboard_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#137fec]/10 text-[#137fec] rounded-lg text-sm font-bold hover:bg-[#137fec]/20 transition-colors">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Open Portal
          </a>
        )}
        {carrier.contact_form_url && (
          <a href={carrier.contact_form_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
            <span className="material-symbols-outlined text-[16px]">request_quote</span>
            Request Quote
          </a>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal Credentials */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              Portal Credentials
            </h5>
            {creds && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">AES-256</span>
            )}
          </div>

          {creds ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Username</label>
                <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-900 flex-1 font-mono">{showCredentials ? creds.username : "••••••••••••"}</span>
                  <button onClick={() => copyToClipboard(creds!.username || "")} className="text-slate-400 hover:text-[#137fec] transition-colors" title="Copy">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Password</label>
                <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-900 flex-1 font-mono">
                    {showCredentials && showPw ? creds.password : "••••••••••••"}
                  </span>
                  <button onClick={() => { setShowCredentials(true); setShowPw(!showPw); }} className="text-slate-400 hover:text-[#137fec] transition-colors" title={showPw ? "Hide" : "Show"}>
                    <span className="material-symbols-outlined text-[18px]">{showCredentials && showPw ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button onClick={() => copyToClipboard(creds!.password || "")} className="text-slate-400 hover:text-[#137fec] transition-colors" title="Copy">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>
              {!showCredentials && (
                <button
                  onClick={() => setShowCredentials(true)}
                  className="w-full mt-1 text-sm font-semibold text-[#137fec] hover:bg-[#137fec]/5 py-2 rounded-lg transition-colors"
                >
                  Reveal Credentials
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-slate-300 text-3xl mb-2 block">lock_open</span>
              <p className="text-sm text-slate-400">No credentials stored</p>
              <button onClick={onEdit} className="text-sm font-semibold text-[#137fec] mt-2 hover:underline">Add credentials</button>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Primary Contact
          </h5>

          {(carrier.sales_rep_name || carrier.contact_email || carrier.contact_phone) ? (
            <div className="space-y-3">
              {carrier.sales_rep_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#137fec]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#137fec] text-[20px]">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{carrier.sales_rep_name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Account Manager</p>
                  </div>
                </div>
              )}
              <div className="space-y-2 mt-2">
                {(carrier.contact_email || carrier.sales_rep_email) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">mail</span>
                    <a href={`mailto:${carrier.contact_email || carrier.sales_rep_email}`} className="text-[#137fec] hover:underline">
                      {carrier.contact_email || carrier.sales_rep_email}
                    </a>
                  </div>
                )}
                {carrier.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">call</span>
                    <a href={`tel:${carrier.contact_phone}`} className="text-[#137fec] hover:underline">{carrier.contact_phone}</a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-slate-300 text-3xl mb-2 block">person_off</span>
              <p className="text-sm text-slate-400">No contact info yet</p>
              <button onClick={onEdit} className="text-sm font-semibold text-[#137fec] mt-2 hover:underline">Add contact</button>
            </div>
          )}
        </div>
      </div>

      {/* Coverage Areas */}
      {carrier.coverage && carrier.coverage.length > 0 && (
        <div>
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Coverage Areas</h5>
          <div className="flex flex-wrap gap-2">
            {carrier.coverage.map((area) => (
              <span key={area} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {carrier.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h5 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">sticky_note_2</span>
            Notes
          </h5>
          <p className="text-sm text-slate-700 leading-relaxed">{carrier.notes}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex gap-2 text-[11px] text-slate-400">
          <span>Added {new Date(carrier.created_at).toLocaleDateString()}</span>
          <span>·</span>
          <span>Updated {new Date(carrier.updated_at).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-1.5 text-sm bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
