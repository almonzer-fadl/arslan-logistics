"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getShipments, getForwarders, upsertShipment } from "@/lib/supabase/api";
import type { Shipment, Forwarder } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import FieldError from "@/components/ui/FieldError";
import { validateShipmentForm, type FieldErrors } from "@/lib/validation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { ShipmentsSkeleton } from "@/components/ui/Skeleton";

export default function ShipmentsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" /></div>}>
      <ShipmentsPage />
    </Suspense>
  );
}

function ShipmentsPage() {
  const { t } = useTranslation();
  const { canEdit } = useUser();
  const searchParams = useSearchParams();
  const [shipments, setShipments] = useState<(Shipment & { forwarders?: { name: string } })[]>([]);
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "shipped" | "to_ship">("all");
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newShipment, setNewShipment] = useState({
    forwarder_id: "",
    booking_reference: "",
    container_id: "",
    container_type: "40ft HC",
    origin_port: "",
    destination_port: "",
    cargo_description: "",
    vessel_name: "",
    departure_date: "",
    arrival_date: "",
    cost_usd: 0,
    status: "booked" as Shipment["status"],
  });
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") setShowNewModal(true);
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [s, f] = await Promise.all([getShipments(), getForwarders()]);
      setShipments(s);
      setForwarders(f);
    } catch (e) {
      console.error("Failed to load shipments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateShipmentForm({
      forwarder_id: newShipment.forwarder_id,
      origin_port: newShipment.origin_port,
      destination_port: newShipment.destination_port,
      cargo_description: newShipment.cargo_description,
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await upsertShipment({
        forwarder_id: newShipment.forwarder_id,
        booking_reference: newShipment.booking_reference,
        container_id: newShipment.container_id,
        container_type: newShipment.container_type,
        origin_port: newShipment.origin_port,
        destination_port: newShipment.destination_port,
        cargo_description: newShipment.cargo_description,
        vessel_name: newShipment.vessel_name,
        departure_date: newShipment.departure_date || undefined,
        arrival_date: newShipment.arrival_date || undefined,
        cost_usd: newShipment.cost_usd,
        status: newShipment.status,
      });
      setShowNewModal(false);
      toast.success("Shipment created successfully.");
      await loadData();
    } catch (e) {
      console.error("Failed to create shipment:", e);
      toast.error("Failed to create shipment. Check console for details.");
    }
  };

  const exportCSV = () => {
    const headers = ["Tracking", "Carrier", "Origin", "Destination", "Status", "ETA", "Cost"];
    const rows = filtered.map((s) => [
      s.booking_reference || s.id.substring(0, 11),
      s.forwarders?.name || s.forwarder_name || "",
      s.origin_port,
      s.destination_port,
      s.status,
      s.arrival_date || "",
      s.cost_usd.toString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shipments.csv";
    a.click();
  };

  const filtered = shipments.filter((s) => {
    if (filter === "shipped" && !["in_transit", "on_vessel", "port_arrival", "delivered", "arrived"].includes(s.status)) return false;
    if (filter === "to_ship" && s.status !== "booked") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (s.booking_reference?.toLowerCase().includes(q)) ||
        s.origin_port.toLowerCase().includes(q) ||
        s.destination_port.toLowerCase().includes(q) ||
        (s.forwarders?.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return <ShipmentsSkeleton />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.shipments.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t.shipments.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-dark-elevated">
            <span className="material-symbols-outlined text-xl">download</span>
            {t.shipments.exportReport}
          </button>
          {canEdit && (
            <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#137fec]/90">
              <span className="material-symbols-outlined text-xl">add</span>
              {t.shipments.newShipment}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-dark-elevated border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm"
                placeholder={t.shipments.searchShipments}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.shipments.filterBy}</span>
            <div className="flex bg-slate-100 dark:bg-dark-elevated p-1 rounded-lg">
              {(["all", "shipped", "to_ship"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? "bg-white dark:bg-dark-card text-[#137fec] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {f === "all" ? t.shipments.all : f === "shipped" ? t.shipments.shipped : t.shipments.toShip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex flex-wrap gap-6 mb-6">
        {[
          { icon: "directions_boat", color: "blue", count: shipments.filter((s) => ["in_transit", "on_vessel"].includes(s.status)).length, label: t.shipments.inTransit },
          { icon: "warehouse", color: "amber", count: shipments.filter((s) => ["port_arrival", "customs"].includes(s.status)).length, label: t.shipments.atPort },
          { icon: "task_alt", color: "green", count: shipments.filter((s) => s.status === "delivered").length, label: t.shipments.delivered },
          { icon: "error", color: "red", count: shipments.filter((s) => s.status === "cancelled").length, label: t.shipments.cancelled },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 dark:text-white">{stat.count}</span>
              <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.shipments.containerId}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.shipments.carrier}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.shipments.route}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.common.status}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.shipments.eta}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.shipments.cost}</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-dark-elevated transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-[#137fec]">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/shipments/${s.id}`} className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{s.booking_reference || s.id.substring(0, 11).toUpperCase()}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-400">{s.container_type || "40&apos; HC"}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{s.forwarders?.name || s.forwarder_name || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{s.origin_port}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          {s.destination_port}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{s.arrival_date ? new Date(s.arrival_date).toLocaleDateString() : t.shipments.tbd}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">${s.cost_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#137fec] transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4 block">inventory_2</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.shipments.emptyStateTitle}</h4>
              <p className="text-slate-500 dark:text-slate-400">{t.shipments.emptyStateMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* New Shipment Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title={t.shipments.newShipment} maxWidth="xl">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.carrierLabel}</span>
              <select required value={newShipment.forwarder_id} onChange={(e) => setNewShipment({ ...newShipment, forwarder_id: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option value="">{t.shipments.selectCarrier}</option>
                {forwarders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.bookingReference}</span>
              <input type="text" value={newShipment.booking_reference} onChange={(e) => setNewShipment({ ...newShipment, booking_reference: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., MEDU6102831" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.originPortRequired}</span>
              <input type="text" required value={newShipment.origin_port} onChange={(e) => setNewShipment({ ...newShipment, origin_port: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., Shanghai (CNSHA)" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.destinationPortRequired}</span>
              <input type="text" required value={newShipment.destination_port} onChange={(e) => setNewShipment({ ...newShipment, destination_port: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., Port Sudan (SDPZU)" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.containerType}</span>
              <select value={newShipment.container_type} onChange={(e) => setNewShipment({ ...newShipment, container_type: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option>20ft Standard</option>
                <option>40ft Standard</option>
                <option>40ft HC</option>
                <option>40ft Reefer</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.vesselName}</span>
              <input type="text" value={newShipment.vessel_name} onChange={(e) => setNewShipment({ ...newShipment, vessel_name: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., MSC LORETO" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.departureDate}</span>
              <input type="date" value={newShipment.departure_date} onChange={(e) => setNewShipment({ ...newShipment, departure_date: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.eta}</span>
              <input type="date" value={newShipment.arrival_date} onChange={(e) => setNewShipment({ ...newShipment, arrival_date: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.costUsd}</span>
              <input type="number" required step="0.01" value={newShipment.cost_usd} onChange={(e) => setNewShipment({ ...newShipment, cost_usd: parseFloat(e.target.value) || 0 })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.common.status}</span>
              <select value={newShipment.status} onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value as Shipment["status"] })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option value="booked">{t.shipments.booked}</option>
                <option value="in_transit">{t.shipments.inTransit}</option>
                <option value="on_vessel">{t.shipments.onVessel}</option>
                <option value="port_arrival">{t.shipments.portArrival}</option>
                <option value="delivered">{t.shipments.delivered}</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.shipments.cargoDescriptionRequired}</span>
            <textarea required rows={3} value={newShipment.cargo_description} onChange={(e) => setNewShipment({ ...newShipment, cargo_description: e.target.value })} className="px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder={t.shipments.cargoPlaceholder} />
          </label>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-dark-border">
            <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-elevated rounded-lg font-semibold">{t.common.cancel}</button>
            <button type="submit" className="px-4 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90">{t.shipments.createShipment}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
