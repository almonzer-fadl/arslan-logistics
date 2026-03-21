"use client";

import { useEffect, useState } from "react";
import { getShipments, getQuotes } from "@/lib/supabase/api";
import type { Shipment, Quote } from "@/lib/types";
import { AnalyticsSkeleton } from "@/components/ui/Skeleton";

export default function AnalyticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, q] = await Promise.all([getShipments(), getQuotes()]);
        setShipments(s);
        setQuotes(q);
      } catch (e) {
        console.error("Error loading analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Real data calculations
  const totalSpend = shipments.reduce((sum, s) => sum + s.cost_usd, 0);
  const totalRevenue = shipments.reduce((sum, s) => sum + s.cost_usd, 0); // Same as spend for now
  const avgCost = shipments.length > 0 ? totalSpend / shipments.length : 0;
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter((q) => q.status === "pending").length;
  const acceptedQuotes = quotes.filter((q) => q.status === "accepted").length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const inTransitCount = shipments.filter((s) => ["in_transit", "on_vessel"].includes(s.status)).length;

  // Group spending by carrier
  const carrierSpend: Record<string, number> = {};
  shipments.forEach((s) => {
    const name = s.forwarder_name || "Unknown";
    carrierSpend[name] = (carrierSpend[name] || 0) + s.cost_usd;
  });
  const topCarriers = Object.entries(carrierSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCarrierSpend = topCarriers[0]?.[1] || 1;

  // Group by month
  const monthlySpend: Record<string, number> = {};
  shipments.forEach((s) => {
    const month = s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Unknown";
    monthlySpend[month] = (monthlySpend[month] || 0) + s.cost_usd;
  });

  // Route frequency
  const routeFreq: Record<string, number> = {};
  shipments.forEach((s) => {
    const route = `${s.origin_port} → ${s.destination_port}`;
    routeFreq[route] = (routeFreq[route] || 0) + 1;
  });
  const topRoutes = Object.entries(routeFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Freight spend analysis, carrier performance, and route insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Freight Spend", value: `$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "payments", color: "blue" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "account_balance", color: "green" },
          { label: "Pending Quotes", value: pendingQuotes.toString(), icon: "pending", color: "amber" },
          { label: "Quote Acceptance", value: totalQuotes > 0 ? `${Math.round((acceptedQuotes / totalQuotes) * 100)}%` : "0%", icon: "thumb_up", color: "purple" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color === "blue" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : kpi.color === "green" ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : kpi.color === "amber" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}>
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier Spend Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Spend by Carrier</h3>
          {topCarriers.length > 0 ? (
            <div className="space-y-4">
              {topCarriers.map(([name, amount]) => (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">${amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-[#137fec] h-2 rounded-full transition-all" style={{ width: `${(amount / maxCarrierSpend) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No shipment data yet</p>
          )}
        </div>

        {/* Top Routes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Routes</h3>
          {topRoutes.length > 0 ? (
            <div className="space-y-3">
              {topRoutes.map(([route, count], i) => (
                <div key={route} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <span className="text-lg font-black text-[#137fec] w-8 text-center">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{route}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{count} shipment{count > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No route data yet</p>
          )}
        </div>

        {/* Monthly Spend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Monthly Spend</h3>
          {Object.keys(monthlySpend).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(monthlySpend).map(([month, amount]) => (
                <div key={month} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{month}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No data yet</p>
          )}
        </div>

        {/* Shipment Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Shipment Status</h3>
          <div className="space-y-3">
            {[
              { label: "Delivered", count: deliveredCount, color: "bg-green-500" },
              { label: "In Transit", count: inTransitCount, color: "bg-blue-500" },
              { label: "Booked", count: shipments.filter((s) => s.status === "booked").length, color: "bg-slate-400" },
              { label: "At Port", count: shipments.filter((s) => ["port_arrival", "customs"].includes(s.status)).length, color: "bg-amber-500" },
              { label: "Cancelled", count: shipments.filter((s) => s.status === "cancelled").length, color: "bg-red-500" },
            ].filter((s) => s.count > 0).map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${stat.color}`} />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.count}</span>
              </div>
            ))}
            {shipments.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No shipments yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
