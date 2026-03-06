"use client";

import { useEffect, useState } from "react";
import { getForwarders, upsertForwarder } from "@/lib/supabase/api";
import type { Forwarder } from "@/lib/types";
import CarrierAccordion from "@/components/carriers/CarrierAccordion";
import AddCarrierModal from "@/components/carriers/AddCarrierModal";

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Forwarder[]>([]);
  const [filteredCarriers, setFilteredCarriers] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCarriers();
  }, []);

  useEffect(() => {
    filterCarriers();
  }, [carriers, filter, searchQuery]);

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

  const filterCarriers = () => {
    let filtered = carriers;

    // Filter by status
    if (filter === "active") {
      filtered = filtered.filter((c) => c.status === "active" || c.status === "approved");
    } else if (filter === "inactive") {
      filtered = filtered.filter((c) => c.status === "inactive" || c.status === "pending" || c.status === "not_contacted");
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.website?.toLowerCase().includes(query) ||
          c.sales_rep_name?.toLowerCase().includes(query)
      );
    }

    setFilteredCarriers(filtered);
  };

  const handleAddCarrier = async (carrierData: any) => {
    try {
      const newCarrier: Partial<Forwarder> = {
        name: carrierData.name,
        website: carrierData.website || "",
        dashboard_url: carrierData.dashboard_url,
        encrypted_credentials: carrierData.encrypted_credentials,
        contact_email: carrierData.contact_email,
        contact_phone: carrierData.contact_phone,
        sales_rep_name: carrierData.sales_rep_name,
        status: carrierData.status as any,
        category: "global", // default
        coverage: [],
        sudan_available: false,
      };

      await upsertForwarder(newCarrier);
      await loadCarriers();
    } catch (error) {
      console.error("Error adding carrier:", error);
      alert("Failed to add carrier. Please try again.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Carrier Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage carrier credentials and portal access (AES-256 encrypted)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Carrier
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm"
                placeholder="Search by carrier name, website, or contact..."
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === "all"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === "active"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ACTIVE
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === "inactive"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              INACTIVE
            </button>
          </div>
        </div>
      </div>

      {/* Carrier List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
        </div>
      ) : filteredCarriers.length > 0 ? (
        <div className="space-y-3">
          {filteredCarriers.map((carrier) => (
            <CarrierAccordion
              key={carrier.id}
              id={carrier.id}
              name={carrier.name}
              scacCode={carrier.name.substring(0, 4).toUpperCase()}
              status={carrier.status}
              lastQuoteDate={carrier.updated_at ? new Date(carrier.updated_at).toLocaleDateString() : undefined}
              encryptedCredentials={carrier.encrypted_credentials}
              contactName={carrier.sales_rep_name}
              contactEmail={carrier.contact_email}
              contactPhone={carrier.contact_phone}
              portalUrl={carrier.dashboard_url}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block">
            corporate_fare
          </span>
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            {searchQuery || filter !== "all" ? "No carriers found" : "No carriers yet"}
          </h4>
          <p className="text-slate-500 mb-4">
            {searchQuery || filter !== "all"
              ? "Try adjusting your filters or search query"
              : "Add your first carrier to start managing credentials"}
          </p>
          {!searchQuery && filter === "all" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#137fec] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#137fec]/90"
            >
              <span className="material-symbols-outlined">add</span>
              Add Carrier
            </button>
          )}
        </div>
      )}

      {/* Add Carrier Modal */}
      <AddCarrierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCarrier}
      />
    </div>
  );
}
