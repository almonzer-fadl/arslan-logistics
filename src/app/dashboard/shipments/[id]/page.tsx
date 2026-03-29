"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Shipment } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function ShipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [shipment, setShipment] = useState<(Shipment & { forwarders?: { name: string } }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("shipments")
        .select("*, forwarders(name)")
        .eq("id", id)
        .single();
      if (!error && data) setShipment(data as Shipment & { forwarders?: { name: string } });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block">error</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Shipment Not Found</h2>
        <Link href="/dashboard/shipments" className="text-[#137fec] hover:underline">Back to Shipments</Link>
      </div>
    );
  }

  const trackingSteps = [
    { label: "Booked", status: "booked", icon: "event_available" },
    { label: "In Transit", status: "in_transit", icon: "local_shipping" },
    { label: "On Vessel", status: "on_vessel", icon: "directions_boat" },
    { label: "Port Arrival", status: "port_arrival", icon: "warehouse" },
    { label: "Customs", status: "customs", icon: "verified_user" },
    { label: "Delivered", status: "delivered", icon: "task_alt" },
  ];
  const statusOrder = trackingSteps.map((s) => s.status);
  const currentIdx = statusOrder.indexOf(shipment.status);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/shipments" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-[#137fec] mb-6">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Shipments
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {shipment.booking_reference || shipment.id.substring(0, 11).toUpperCase()}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            {shipment.forwarders?.name || shipment.forwarder_name} · {shipment.container_type || "40ft HC"}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6 mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Tracking Timeline</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
          <div className="absolute top-5 left-0 h-0.5 bg-[#137fec] transition-all" style={{ width: `${Math.max(0, (currentIdx / (trackingSteps.length - 1)) * 100)}%` }} />
          {trackingSteps.map((step, i) => {
            const done = i <= currentIdx;
            const current = i === currentIdx;
            return (
              <div key={step.status} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-[#137fec] text-white" : "bg-slate-100 dark:bg-dark-elevated text-slate-400 dark:text-slate-500"} ${current ? "ring-4 ring-[#137fec]/20" : ""}`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
                <span className={`text-xs mt-2 font-medium ${done ? "text-[#137fec]" : "text-slate-400 dark:text-slate-500"}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">route</span>
            Route Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Origin</p>
                <p className="font-semibold text-slate-900 dark:text-white">{shipment.origin_port}</p>
                {shipment.departure_date && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Departed: {new Date(shipment.departure_date).toLocaleDateString()}</p>}
              </div>
              <span className="material-symbols-outlined text-slate-300 self-center">arrow_forward</span>
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Destination</p>
                <p className="font-semibold text-slate-900 dark:text-white">{shipment.destination_port}</p>
                {shipment.arrival_date && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">ETA: {new Date(shipment.arrival_date).toLocaleDateString()}</p>}
              </div>
            </div>
            {shipment.vessel_name && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vessel</p>
                <p className="font-semibold text-slate-900 dark:text-white">{shipment.vessel_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cargo & Cost */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Cargo & Cost
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Container</p>
              <p className="font-semibold text-slate-900 dark:text-white">{shipment.container_type || "40ft HC"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</p>
              <p className="text-sm text-slate-700">{shipment.cargo_description || "—"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Cost</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">${shipment.cost_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {shipment.notes && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6 mt-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Notes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{shipment.notes}</p>
        </div>
      )}
    </div>
  );
}
