"use client";

import { useEffect, useState } from "react";
import { getShipments } from "@/lib/supabase/api";
import type { Shipment } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import StatusBadge from "@/components/ui/StatusBadge";

type ShipmentWithForwarder = Shipment & { forwarders?: { name: string } };

export default function TrackerPage() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<ShipmentWithForwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "at_sea" | "delayed">("all");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithForwarder | null>(null);

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
      // For demo: consider delayed if status is cancelled or if arrival_date is past
      return s.status === "cancelled";
    }
    return true;
  });

  const atSeaCount = shipments.filter((s) => ["in_transit", "on_vessel"].includes(s.status)).length;
  const delayedCount = shipments.filter((s) => s.status === "cancelled").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
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
            <button className="p-2 text-slate-400 hover:text-[#137fec]">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === "all"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-elevated"
              }`}
            >
              {t.common.all}
            </button>
            <button
              onClick={() => setFilter("at_sea")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === "at_sea"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-elevated"
              }`}
            >
              {t.tracker.atSea} ({atSeaCount})
            </button>
            <button
              onClick={() => setFilter("delayed")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                filter === "delayed"
                  ? "bg-[#137fec] text-white"
                  : "bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-elevated"
              }`}
            >
              {t.tracker.delayed} ({delayedCount})
            </button>
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
                      ? "border-2 border-[#137fec] bg-[#137fec]/5"
                      : "border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isActive
                          ? "text-[#137fec] bg-[#137fec]/10"
                          : "text-slate-600 bg-slate-100"
                      }`}
                    >
                      {s.booking_reference || s.container_id || s.id.substring(0, 11).toUpperCase()}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {s.vessel_name || s.forwarders?.name || "Unknown Vessel"}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex flex-col">
                      <span className="uppercase font-medium text-[9px] text-slate-400">{t.quotes.origin}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">{s.origin_port}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">trending_flat</span>
                    <div className="flex flex-col text-right">
                      <span className="uppercase font-medium text-[9px] text-slate-400">{t.quotes.destination}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">{s.destination_port}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border flex justify-between items-end">
                    <div className="text-[10px]">
                      <p className="text-slate-400 dark:text-slate-500 uppercase">{t.tracker.estArrival}</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200 dark:text-slate-200">
                        {s.arrival_date ? new Date(s.arrival_date).toLocaleDateString() : "TBD"}
                      </p>
                    </div>
                    <div className="text-[10px] text-right">
                      <p className="text-slate-400 dark:text-slate-500 uppercase">{t.tracker.lastUpdate}</p>
                      <p className="text-slate-700 dark:text-slate-200">
                        {Math.floor(Math.random() * 60)} mins ago
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4 block">sailing</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.empty.noResults}</h4>
              <p className="text-slate-500">{t.empty.tryAdjustingFilters}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50">
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
      <section className="flex-1 relative bg-slate-100">
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-slate-300 text-[120px] mb-4 block">map</span>
            <p className="text-slate-400 text-lg font-medium">
              Map integration coming soon
            </p>
            <p className="text-slate-300 text-sm mt-2">
              Mapbox / Leaflet will be integrated here
            </p>
          </div>

          {/* Sample Vessel Icons */}
          {selectedShipment && (
            <>
              <div className="absolute top-[40%] left-[65%] -translate-x-1/2 -translate-y-1/2 group">
                <div className="relative cursor-pointer">
                  <div className="h-10 w-10 bg-white dark:bg-dark-card rounded-lg shadow-xl border-2 border-[#137fec] flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-[#137fec]">directions_boat</span>
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {selectedShipment.vessel_name || "Vessel"}
                  </div>
                </div>
              </div>

              {/* Additional Vessels */}
              <div className="absolute top-[35%] left-[45%] -translate-x-1/2 -translate-y-1/2">
                <div className="h-8 w-8 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-slate-200 dark:border-dark-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600 text-sm">directions_boat</span>
                </div>
              </div>
              <div className="absolute top-[55%] left-[25%] -translate-x-1/2 -translate-y-1/2">
                <div className="h-8 w-8 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-slate-200 dark:border-dark-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-600 text-sm">directions_boat</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Tooltip (Selected Shipment) */}
        {selectedShipment && (
          <div className="absolute top-[40%] left-[65%] mt-12 -translate-x-1/2 z-20">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-slate-200 dark:border-dark-border w-72 p-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#137fec]">info</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedShipment.booking_reference ||
                        selectedShipment.container_id ||
                        selectedShipment.id.substring(0, 11).toUpperCase()}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {t.tracker.inTransitLocation} - {selectedShipment.origin_port}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 font-semibold mb-1">
                    {t.tracker.currentSpeed}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {(Math.random() * 20 + 10).toFixed(1)} kts
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 font-semibold mb-1">
                    {t.tracker.lastSignal}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.floor(Math.random() * 10)}m ago
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 font-semibold mb-1">
                    {t.tracker.course}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.floor(Math.random() * 360)}° W
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-elevated p-2 rounded-lg">
                  <p className="text-[9px] uppercase text-slate-400 font-semibold mb-1">
                    {t.tracker.weather}
                  </p>
                  <p className="text-sm font-bold text-emerald-500">{t.status.clear}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{t.tracker.routeProgress}</span>
                  <span className="font-bold text-[#137fec]">
                    {Math.floor(Math.random() * 40 + 40)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-dark-elevated rounded-full overflow-hidden">
                  <div
                    className="bg-[#137fec] h-full"
                    style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }}
                  />
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors">
                {t.tracker.fullTrackingHistory}
              </button>
            </div>
          </div>
        )}

        {/* Floating Map Controls */}
        <div className="absolute right-6 top-6 flex flex-col gap-3">
          <div className="flex flex-col bg-white dark:bg-dark-card rounded-lg shadow-xl border border-slate-200 dark:border-dark-border overflow-hidden">
            <button className="p-3 hover:bg-slate-50 dark:hover:bg-dark-elevated border-b border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300">$
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="p-3 hover:bg-slate-50 text-slate-600 dark:text-slate-300">$
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button className="p-3 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-slate-200 dark:border-dark-border text-slate-600 hover:text-[#137fec] transition-colors">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="absolute left-6 bottom-6 flex items-center gap-2 p-1 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-slate-200 dark:border-dark-border">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#137fec] text-white rounded-lg text-xs font-bold">
            <span className="material-symbols-outlined text-sm">map</span>
            {t.tracker.standard}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all">
            <span className="material-symbols-outlined text-sm">cloud</span>
            {t.tracker.weatherLayer}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all">
            <span className="material-symbols-outlined text-sm">waves</span>
            {t.tracker.oceanCurrents}
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <button className="p-2 text-slate-600 hover:text-[#137fec]">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Legend */}
        <div className="absolute right-6 bottom-6 p-4 bg-white/90 dark:bg-dark-card/90 backdrop-blur rounded-xl border border-slate-200 shadow-xl">
          <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">
            {t.tracker.carrierFleetLegend}
          </h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#137fec]" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">Maersk Line</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">MSC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-900" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">CMA CGM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 dark:text-slate-200">Hapag-Lloyd</span>
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
      `}</style>
    </div>
  );
}
