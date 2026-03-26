"use client";

import { useEffect, useState } from "react";
import { getForwarders, getShipments } from "@/lib/supabase/api";
import type { Forwarder, Shipment } from "@/lib/types";
import CarrierCard from "@/components/ui/CarrierCard";
import CarrierDetailModal from "@/components/carriers/CarrierDetailModal";
import ShipmentRow from "@/components/ui/ShipmentRow";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [shipments, setShipments] = useState<(Shipment & { forwarders?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailCarrier, setDetailCarrier] = useState<Forwarder | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [f, s] = await Promise.all([getForwarders(), getShipments()]);
        setForwarders(f);
        setShipments(s);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topCarriers = forwarders
    .filter((f) => ["active", "approved"].includes(f.status))
    .slice(0, 4);
  const activeShipments = shipments
    .filter((s) => !["cancelled", "delivered"].includes(s.status))
    .slice(0, 10);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Main Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your carrier links, quotes, and container shipments.</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link
          href="/dashboard/quotes/new"
          className="bg-[#137fec] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#137fec]/90 transition-all shadow-lg shadow-[#137fec]/20"
        >
          <span className="material-symbols-outlined">add</span>
          Get New Quote
        </Link>
        <Link
          href="/dashboard/shipments?action=new"
          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <span className="material-symbols-outlined">package_2</span>
          Add Shipment
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Carrier Hub Grid */}
        <section className="col-span-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Carrier Hub</h3>
            <Link href="/dashboard/carriers" className="text-[#137fec] text-sm font-semibold hover:underline">
              View All Carriers
            </Link>
          </div>

          {topCarriers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCarriers.map((carrier) => (
                <CarrierCard
                  key={carrier.id}
                  carrier={carrier}
                  onClick={() => setDetailCarrier(carrier)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4 block">hub</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Carriers Yet</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Add your first carrier to start managing quotes and shipments</p>
              <Link href="/dashboard/carriers" className="inline-flex items-center gap-2 bg-[#137fec] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#137fec]/90">
                <span className="material-symbols-outlined">add</span>
                Add Carrier
              </Link>
            </div>
          )}
        </section>

        {/* Active Shipments Table */}
        <section className="col-span-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Shipments</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filter
              </button>
              <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto">
            {activeShipments.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracking Number</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ETA</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {activeShipments.map((shipment) => (
                    <ShipmentRow
                      key={shipment.id}
                      id={shipment.id}
                      trackingNumber={shipment.booking_reference || shipment.id.substring(0, 11).toUpperCase()}
                      carrier={shipment.forwarders?.name || shipment.forwarder_name || "Unknown"}
                      originPort={shipment.origin_port}
                      destinationPort={shipment.destination_port}
                      status={shipment.status}
                      eta={shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString() : undefined}
                      cost={shipment.cost_usd}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl mb-4 block">inventory_2</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Shipments</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first shipment to start tracking</p>
                <Link href="/dashboard/shipments?action=new" className="inline-flex items-center gap-2 bg-[#137fec] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#137fec]/90">
                  <span className="material-symbols-outlined">add</span>
                  Add Shipment
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Carrier Detail Modal */}
      <CarrierDetailModal
        carrier={detailCarrier}
        onClose={() => setDetailCarrier(null)}
      />
    </div>
  );
}
