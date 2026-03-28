"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import { encryptCredentials } from "@/lib/encryption";
import { validateCarrierForm, type FieldErrors } from "@/lib/validation";
import FieldError from "@/components/ui/FieldError";

interface AddCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (carrier: Record<string, unknown>) => Promise<void>;
}

export default function AddCarrierModal({
  isOpen,
  onClose,
  onAdd,
}: AddCarrierModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    category: "global" as "global" | "regional" | "africa" | "roro",
    dashboard_url: "",
    contact_form_url: "",
    username: "",
    password: "",
    sales_rep_name: "",
    contact_email: "",
    contact_phone: "",
    coverage: "",
    sudan_available: false,
    status: "active" as "active" | "pending" | "not_contacted" | "approved",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      category: "global",
      dashboard_url: "",
      contact_form_url: "",
      username: "",
      password: "",
      sales_rep_name: "",
      contact_email: "",
      contact_phone: "",
      coverage: "",
      sudan_available: false,
      status: "active",
      notes: "",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCarrierForm({
      name: formData.name,
      website: formData.website,
      dashboard_url: formData.dashboard_url,
      contact_form_url: formData.contact_form_url,
      contact_email: formData.contact_email,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError("");

    try {
      let encrypted_credentials: string | undefined;
      if (formData.username || formData.password) {
        encrypted_credentials = encryptCredentials({
          username: formData.username,
          password: formData.password,
        });
      }

      const newCarrier = {
        name: formData.name,
        website: formData.website || undefined,
        category: formData.category,
        dashboard_url: formData.dashboard_url || undefined,
        contact_form_url: formData.contact_form_url || undefined,
        encrypted_credentials,
        sales_rep_name: formData.sales_rep_name || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        coverage: formData.coverage
          ? formData.coverage.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        sudan_available: formData.sudan_available,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      await onAdd(newCarrier);
      resetForm();
      onClose();
    } catch (err: unknown) {
      console.error("Add carrier error:", err);
      setError(err instanceof Error ? err.message : "Failed to add carrier. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="Add New Carrier" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Carrier Name <span className="text-red-500">*</span></span>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`px-3 py-2 border rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm ${fieldErrors.name ? "border-red-300" : "border-slate-200"}`} placeholder="e.g., Maersk Line" />
              <FieldError error={fieldErrors.name} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Website</span>
              <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={`px-3 py-2 border rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm ${fieldErrors.website ? "border-red-300" : "border-slate-200"}`} placeholder="https://www.carrier.com" />
              <FieldError error={fieldErrors.website} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></span>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="global">Global Carrier</option>
                <option value="regional">Turkey Regional</option>
                <option value="africa">Africa Specialist</option>
                <option value="roro">RORO Vehicle</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="not_contacted">Not Contacted</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Portal URL</span>
              <input type="url" value={formData.dashboard_url} onChange={(e) => setFormData({ ...formData, dashboard_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="https://portal.carrier.com" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Contact / Quote Form URL</span>
              <input type="url" value={formData.contact_form_url} onChange={(e) => setFormData({ ...formData, contact_form_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="https://carrier.com/quote" />
            </label>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Portal Credentials
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
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Encrypted with AES-256 before storage
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Primary Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Contact Name</span>
              <input type="text" value={formData.sales_rep_name} onChange={(e) => setFormData({ ...formData, sales_rep_name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Sales Rep Name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="contact@carrier.com" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="+1 234 567 8900" />
            </label>
          </div>
        </div>

        {/* Coverage & Notes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">public</span>
            Coverage & Notes
          </h4>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Coverage Areas (comma-separated)</span>
            <input type="text" value={formData.coverage} onChange={(e) => setFormData({ ...formData, coverage: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Turkey, Sudan, Saudi Arabia, China" />
          </label>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="add-sudan" checked={formData.sudan_available} onChange={(e) => setFormData({ ...formData, sudan_available: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]" />
            <label htmlFor="add-sudan" className="text-sm text-slate-700">Sudan coverage available</label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Any additional notes..." />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-dark-border">
          <button type="button" onClick={() => { resetForm(); onClose(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Saving...
              </>
            ) : (
              "Add Carrier"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
