"use client";

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { encryptCredentials, decryptCredentials } from "@/lib/encryption";
import type { Forwarder } from "@/lib/types";

interface EditCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Forwarder>) => void;
  onDelete: (id: string) => void;
  carrier: Forwarder | null;
}

export default function EditCarrierModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  carrier,
}: EditCarrierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    category: "global" as Forwarder["category"],
    dashboard_url: "",
    username: "",
    password: "",
    contact_email: "",
    contact_phone: "",
    sales_rep_name: "",
    sales_rep_email: "",
    contact_form_url: "",
    status: "active" as Forwarder["status"],
    sudan_available: false,
    coverage: "",
    notes: "",
  });

  useEffect(() => {
    if (carrier) {
      let creds = { username: "", password: "" };
      if (carrier.encrypted_credentials) {
        try {
          const d = decryptCredentials(carrier.encrypted_credentials);
          creds = { username: d.username || "", password: d.password || "" };
        } catch {}
      }
      setFormData({
        name: carrier.name || "",
        website: carrier.website || "",
        category: carrier.category || "global",
        dashboard_url: carrier.dashboard_url || "",
        username: creds.username,
        password: creds.password,
        contact_email: carrier.contact_email || "",
        contact_phone: carrier.contact_phone || "",
        sales_rep_name: carrier.sales_rep_name || "",
        sales_rep_email: carrier.sales_rep_email || "",
        contact_form_url: carrier.contact_form_url || "",
        status: carrier.status || "active",
        sudan_available: carrier.sudan_available || false,
        coverage: (carrier.coverage || []).join(", "),
        notes: carrier.notes || "",
      });
    }
  }, [carrier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier) return;

    const encrypted = (formData.username || formData.password)
      ? encryptCredentials({ username: formData.username, password: formData.password })
      : carrier.encrypted_credentials;

    onSave(carrier.id, {
      name: formData.name,
      website: formData.website,
      category: formData.category,
      dashboard_url: formData.dashboard_url || undefined,
      encrypted_credentials: encrypted || undefined,
      contact_email: formData.contact_email || undefined,
      contact_phone: formData.contact_phone || undefined,
      sales_rep_name: formData.sales_rep_name || undefined,
      sales_rep_email: formData.sales_rep_email || undefined,
      contact_form_url: formData.contact_form_url || undefined,
      status: formData.status,
      sudan_available: formData.sudan_available,
      coverage: formData.coverage.split(",").map((s) => s.trim()).filter(Boolean),
      notes: formData.notes || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!carrier) return;
    if (confirm(`Delete ${carrier.name}? This cannot be undone.`)) {
      onDelete(carrier.id);
      onClose();
    }
  };

  if (!carrier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit: ${carrier.name}`} maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">business</span>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Carrier Name *</span>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Website</span>
              <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Forwarder["category"] })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="global">Global</option>
                <option value="regional">Regional (Turkey)</option>
                <option value="africa">Africa / Sudan Specialist</option>
                <option value="roro">RORO (Vehicle)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Forwarder["status"] })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="not_contacted">Not Contacted</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Portal / Dashboard URL</span>
              <input type="url" value={formData.dashboard_url} onChange={(e) => setFormData({ ...formData, dashboard_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="https://portal.carrier.com" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Contact Form URL</span>
              <input type="url" value={formData.contact_form_url} onChange={(e) => setFormData({ ...formData, contact_form_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">vpn_key</span>
            Portal Credentials (AES-256 Encrypted)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Username</span>
              <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Portal username" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Portal password" />
            </label>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Sales Rep Name</span>
              <input type="text" value={formData.sales_rep_name} onChange={(e) => setFormData({ ...formData, sales_rep_name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Sales Rep Email</span>
              <input type="email" value={formData.sales_rep_email} onChange={(e) => setFormData({ ...formData, sales_rep_email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Contact Email</span>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Contact Phone</span>
              <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
          </div>
        </div>

        {/* Coverage & Notes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">public</span>
            Coverage & Notes
          </h4>
          <div className="flex items-center gap-3 mb-2">
            <input type="checkbox" id="sudan" checked={formData.sudan_available} onChange={(e) => setFormData({ ...formData, sudan_available: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]" />
            <label htmlFor="sudan" className="text-sm text-slate-700">Sudan / Port Sudan available</label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Coverage Areas (comma separated)</span>
            <input type="text" value={formData.coverage} onChange={(e) => setFormData({ ...formData, coverage: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Turkey, Sudan, Saudi Arabia, China" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Carrier
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#137fec] text-white rounded-lg font-semibold text-sm hover:bg-[#137fec]/90">Save Changes</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
