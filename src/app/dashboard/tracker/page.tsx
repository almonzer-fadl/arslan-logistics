"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getShipments } from "@/lib/supabase/api";
import type { Shipment } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/components/ui/ThemeProvider";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCarrierTrackingUrl, getVesselSearchUrl } from "@/lib/tracking-urls";

const ShipmentMap = dynamic(() => import("@/components/map/ShipmentMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-slate-100 dark:bg-dark-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
    </div>
  ),
});

type ShipmentWithForwarder = Shipment & { forwarders?: { name: string } };

export default function TrackerPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [shipments, setShipments] = useState<ShipmentWithForwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "at_sea" | "delayed">("all");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithForwarder | null>(null);

  const handleSelectShipment = useCallback((s: ShipmentWithForwarder) => {
    setSelectedShipment(s);
  }, []);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const data = await getShipments();
      setShipments(data);
      if (data.length > 0) setSelectedShipment(data[0]);
    } catch (e) {
      console.error("Failed to load shipments:", e);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const headers = ["Container ID", "Vessel", "Origin", "Destination", "Status", "ETA"];
    const rows = filteredShipments.map((s) => [
      s.booking_reference || s.container_id || s.id.substring(0, 11),
      s.vessel_name || "—",
      s.origin_port,
      s.destination_port,
      s.status,
      s.arrival_date || "TBD",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracking-data.csv";
    a.click();
  };

  const filteredShipments = shipments.filter((s) => {
    if (filter === "at_sea") {
      return ["in_transit", "on_vessel"].includes(s.status);
    }
    if (filter === "delayed") {
      return s.status === "cancelled";
    }
    return true;
  });

  const atSeaCount = shipments.filter((s) => ["in_transit", "on_vessel"].includes(s.status)).length;
  const delayedCount = shipments.filter((s) => s.status === "cancelled").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f7f8] dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#f6f7f8] dark:bg-dark-bg">
      {/* Sidebar: Live Shipments */}
      <aside className="w-80 lg:w-96 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col z-40">
        <div className="p-4 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t.tracker.liveShipments}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.tracker.tracking} {shipments.length} {t.tracker.containersGlobally}
              </p>
            </div>
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-[#137fec] dark:hover:text-[#137fec] transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-dark-elevated">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex gap-2">
            {(["all", "at_sea", "delayed"] as const).map((f) => {
              const label = f === "all" ? t.common.all : f === "at_sea" ? `${t.tracker.atSea} (${atSeaCount})` : `${t.tracker.delayed} (${delayedCount})`;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filter === f
                      ? "bg-[#137fec] text-white"
                      : "bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shipment Cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {filteredShipments.length > 0 ? (
            filteredShipments.map((s) => {
              const isActive = selectedShipment?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedShipment(s)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "border-2 border-[#137fec] bg-[#137fec]/5 dark:bg-[#137fec]/10"
                      : "border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isActive
                          ? "text-[#137fec] bg-[#137fec]/10"
                          : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-dark-elevated"
                      }`}
                    >
                      {s.booking_reference || s.container_id || s.id.substring(0, 11).toUpperCase()}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {s.vessel_name || s.forwarders?.name || "Unknown Vessel"}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col">
                      <span className="uppercase font-medium text-[9px] text-slate-400 dark:text-slate-500">{t.quotes.origin}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.origin_port}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">trending_flat</span>
                    <div className="flex flex-col text-right">
                      <span className="uppercase font-medium text-[9px] text-slate-400 dark:text-slate-500">{t.quotes.destination}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.destination_port}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border flex justify-between items-end">
                    <div className="text-[10px]">
                      <p className="text-slate-400 dark:text-slate-500 uppercase">{t.tracker.estArrival}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">
                        {s.arrival_date ? new Date(s.arrival_date).toLocaleDateString() : "TBD"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {s.vessel_name && (
                        <a
                          href={getVesselSearchUrl(s.vessel_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                          title={`Track ${s.vessel_name} on MarineTraffic`}
                        >
                          <span className="material-symbols-outlined text-[16px]">sailing</span>
                        </a>
                      )}
                      {s.booking_reference && s.forwarders?.name && getCarrierTrackingUrl(s.forwarders.name, s.booking_reference) && (
                        <a
                          href={getCarrierTrackingUrl(s.forwarders.name, s.booking_reference)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                          title="Track container"
                        >
                          <span className="material-symbols-outlined text-[16px]">package_2</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4 block">sailing</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.empty.noResults}</h4>
              <p className="text-slate-500 dark:text-slate-400">{t.empty.tryAdjustingFilters}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-dark-elevated border-t border-slate-200 dark:border-dark-border">
          <button
            onClick={exportData}
            className="w-full py-3 bg-[#137fec] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            {t.tracker.exportTrackingData}
          </button>
        </div>
      </aside>

      {/* Main Content: Map View */}
      <section className="flex-1 relative bg-slate-100 dark:bg-dark-bg">
        <ShipmentMap
          shipments={filteredShipments}
          selectedShipment={selectedShipment}
          onSelectShipment={handleSelectShipment}
          darkMode={theme === "dark"}
        />

        {/* Shipment Info Panel (top-left overlay) */}
        {selectedShipment && (
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-slate-200 dark:border-dark-border w-80 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#137fec]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#137fec] text-lg">directions_boat</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedShipment.vessel_name ||
                        selectedShipment.booking_reference ||
                        selectedShipment.id.substring(0, 11).toUpperCase()}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedShipment.origin_port} → {selectedShipment.destination_port}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-semibold">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedShipment.status} /></div>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-semibold">{t.tracker.estArrival}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {selectedShipment.arrival_date
                      ? new Date(selectedShipment.arrival_date).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-semibold">{t.quotes.containerType}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {selectedShipment.container_type || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-semibold">Cost</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    ${selectedShipment.cost_usd?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>

              {selectedShipment.cargo_description && (
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg mb-3">
                  <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-semibold mb-1">Cargo</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{selectedShipment.cargo_description}</p>
                </div>
              )}

              {/* Tracking Links */}
              <div className="flex gap-2">
                {selectedShipment.vessel_name && (
                  <a
                    href={getVesselSearchUrl(selectedShipment.vessel_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-[#137fec] rounded-lg text-xs font-semibold text-white hover:bg-[#137fec]/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">sailing</span>
                    Live Vessel
                  </a>
                )}
                {selectedShipment.booking_reference && selectedShipment.forwarder_name && getCarrierTrackingUrl(selectedShipment.forwarder_name, selectedShipment.booking_reference) && (
                  <a
                    href={getCarrierTrackingUrl(selectedShipment.forwarder_name, selectedShipment.booking_reference)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 border border-[#137fec] rounded-lg text-xs font-semibold text-[#137fec] hover:bg-[#137fec]/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">package_2</span>
                    Track Container
                  </a>
                )}
                {selectedShipment.tracking_url && (
                  <a
                    href={selectedShipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Carrier Portal
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Route Legend */}
        <div className="absolute right-16 bottom-6 p-3 bg-white/90 dark:bg-dark-card/90 backdrop-blur rounded-xl border border-slate-200 dark:border-dark-border shadow-xl">
          <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
            Route Status
          </h5>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 rounded bg-[#137fec]" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">In Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 rounded bg-amber-500" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">At Port / Customs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 rounded bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#137fec]" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Vessel Position</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        :is(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
        }
      `}</style>
    </div>
  );
}
