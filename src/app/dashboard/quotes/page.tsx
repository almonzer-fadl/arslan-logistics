"use client";

import { useEffect, useState } from "react";
import { getQuotes, getForwarders, upsertQuote, deleteQuote } from "@/lib/supabase/api";
import type { Quote, Forwarder } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import FieldError from "@/components/ui/FieldError";
import { validateQuoteForm, type FieldErrors } from "@/lib/validation";
import Link from "next/link";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<(Quote & { forwarders?: { name: string } })[]>([]);
  const [forwarders, setForwarders] = useState<Forwarder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "received" | "accepted" | "expired">("all");
  const [form, setForm] = useState({
    forwarder_id: "",
    origin_port: "",
    destination_port: "",
    container_type: "40ft HC",
    cargo_description: "",
    weight_kg: 0,
    incoterms: "FOB",
    special_requirements: "",
    price_usd: 0,
    transit_days: 0,
    insurance_included: false,
    valid_until: "",
    status: "pending" as Quote["status"],
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [q, f] = await Promise.all([getQuotes(), getForwarders()]);
      setQuotes(q);
      setForwarders(f);
    } catch (e) {
      console.error("Error loading quotes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateQuoteForm({
      forwarder_id: form.forwarder_id,
      origin_port: form.origin_port,
      destination_port: form.destination_port,
      cargo_description: form.cargo_description,
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      await upsertQuote({
        forwarder_id: form.forwarder_id,
        origin_port: form.origin_port,
        destination_port: form.destination_port,
        container_type: form.container_type,
        cargo_description: form.cargo_description,
        weight_kg: form.weight_kg || undefined,
        incoterms: form.incoterms,
        special_requirements: form.special_requirements || undefined,
        price_usd: form.price_usd,
        transit_days: form.transit_days,
        insurance_included: form.insurance_included,
        valid_until: form.valid_until || undefined,
        status: form.status,
      });
      setShowForm(false);
      toast.success("Quote request submitted.");
      await loadData();
    } catch (e) {
      console.error("Error creating quote:", e);
      toast.error("Failed to create quote.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteQuote(deleteTarget);
      toast.success("Quote deleted.");
      await loadData();
    } catch (e) {
      console.error("Error deleting quote:", e);
      toast.error("Failed to delete quote.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = quotes.filter((q) => filter === "all" || q.status === filter);

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
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quotation Management</h1>
          <p className="text-slate-500 mt-1">Request, compare, and manage freight quotes from carriers.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-[#137fec] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#137fec]/20 hover:bg-[#137fec]/90">
          <span className="material-symbols-outlined">add</span>
          New Quote Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "received", "accepted", "expired"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${filter === f ? "bg-[#137fec] text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
          >
            {f === "all" ? "All Quotes" : f}
          </button>
        ))}
      </div>

      {/* Quote Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{q.forwarders?.name || q.forwarder_name || "Unknown"}</p>
                  <h4 className="font-bold text-slate-900 mt-1">{q.origin_port} → {q.destination_port}</h4>
                </div>
                <StatusBadge status={q.status} variant="quote" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Container</p>
                  <p className="text-sm font-medium text-slate-900">{q.container_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Transit</p>
                  <p className="text-sm font-medium text-slate-900">{q.transit_days} days</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Price</p>
                  <p className="text-lg font-black text-slate-900">${q.price_usd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Valid Until</p>
                  <p className="text-sm font-medium text-slate-900">{q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
              {q.cargo_description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{q.cargo_description}</p>}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                {q.status === "received" && (
                  <button
                    onClick={async () => { await upsertQuote({ ...q, status: "accepted" }); await loadData(); }}
                    className="flex-1 text-xs py-2 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100"
                  >
                    Accept
                  </button>
                )}
                <button onClick={() => setDeleteTarget(q.id)} className="text-xs py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <span className="material-symbols-outlined text-slate-300 text-6xl mb-4 block">description</span>
          <h4 className="text-lg font-bold text-slate-900 mb-2">No Quotes Yet</h4>
          <p className="text-slate-500 mb-4">Request your first quote from a carrier</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#137fec] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#137fec]/90">
            <span className="material-symbols-outlined">add</span>
            New Quote Request
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Quote"
        message="This will permanently delete this quote request. This action cannot be undone."
        confirmLabel="Delete Quote"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* New Quote Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Quotation Request" maxWidth="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Preferred Carrier *</span>
              <select required value={form.forwarder_id} onChange={(e) => setForm({ ...form, forwarder_id: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option value="">Select carrier...</option>
                {forwarders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Container Type *</span>
              <select value={form.container_type} onChange={(e) => setForm({ ...form, container_type: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option>20ft Standard</option>
                <option>40ft Standard</option>
                <option>40ft HC</option>
                <option>40ft Reefer</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Origin Port *</span>
              <input required type="text" value={form.origin_port} onChange={(e) => setForm({ ...form, origin_port: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., Istanbul (TRIST)" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Destination Port *</span>
              <input required type="text" value={form.destination_port} onChange={(e) => setForm({ ...form, destination_port: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="e.g., Port Sudan (SDPZU)" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Weight (kg)</span>
              <input type="number" value={form.weight_kg || ""} onChange={(e) => setForm({ ...form, weight_kg: parseFloat(e.target.value) || 0 })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="Estimated weight" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Incoterms</span>
              <select value={form.incoterms} onChange={(e) => setForm({ ...form, incoterms: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]">
                <option>FOB</option>
                <option>CIF</option>
                <option>CFR</option>
                <option>EXW</option>
                <option>DDP</option>
                <option>DAP</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Expected Price (USD)</span>
              <input type="number" step="0.01" value={form.price_usd || ""} onChange={(e) => setForm({ ...form, price_usd: parseFloat(e.target.value) || 0 })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Transit Days</span>
              <input type="number" value={form.transit_days || ""} onChange={(e) => setForm({ ...form, transit_days: parseInt(e.target.value) || 0 })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Cargo Description *</span>
            <textarea required rows={3} value={form.cargo_description} onChange={(e) => setForm({ ...form, cargo_description: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="Describe the cargo being shipped..." />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Special Requirements</span>
            <textarea rows={2} value={form.special_requirements} onChange={(e) => setForm({ ...form, special_requirements: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]" placeholder="Temperature control, hazardous materials, oversized cargo..." />
          </label>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="insurance" checked={form.insurance_included} onChange={(e) => setForm({ ...form, insurance_included: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]" />
            <label htmlFor="insurance" className="text-sm text-slate-700">Include cargo insurance</label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90">Submit Quote Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
