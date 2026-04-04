"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import Modal from "../ui/Modal";
import { encryptCredentials } from "@/lib/encryption";
import { validateCarrierForm, type FieldErrors } from "@/lib/validation";
import FieldError from "@/components/ui/FieldError";
import type { Forwarder } from "@/lib/types";

interface EditCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Forwarder>) => Promise<void>;
  carrier: Forwarder | null;
  decryptedUsername?: string;
  decryptedPassword?: string;
}

export default function EditCarrierModal({
  isOpen,
  onClose,
  onSave,
  carrier,
  decryptedUsername,
  decryptedPassword,
}: EditCarrierModalProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    category: "global" as Forwarder["category"],
    dashboard_url: "",
    contact_form_url: "",
    username: "",
    password: "",
    contact_email: "",
    contact_phone: "",
    sales_rep_name: "",
    sales_rep_email: "",
    coverage: "",
    sudan_available: false,
    status: "active" as Forwarder["status"],
    notes: "",
  });

  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name || "",
        website: carrier.website || "",
        category: carrier.category || "global",
        dashboard_url: carrier.dashboard_url || "",
        contact_form_url: carrier.contact_form_url || "",
        username: decryptedUsername || "",
        password: decryptedPassword || "",
        contact_email: carrier.contact_email || "",
        contact_phone: carrier.contact_phone || "",
        sales_rep_name: carrier.sales_rep_name || "",
        sales_rep_email: carrier.sales_rep_email || "",
        coverage: carrier.coverage?.join(", ") || "",
        sudan_available: carrier.sudan_available || false,
        status: carrier.status || "active",
        notes: carrier.notes || "",
      });
      setError("");
    }
  }, [carrier, decryptedUsername, decryptedPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier) return;

    const errors = validateCarrierForm({
      name: formData.name,
      website: formData.website,
      dashboard_url: formData.dashboard_url,
      contact_form_url: formData.contact_form_url,
      contact_email: formData.contact_email,
      sales_rep_email: formData.sales_rep_email,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError("");

    try {
      const updates: Partial<Forwarder> = {
        name: formData.name,
        website: formData.website,
        category: formData.category,
        dashboard_url: formData.dashboard_url || undefined,
        contact_form_url: formData.contact_form_url || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        sales_rep_name: formData.sales_rep_name || undefined,
        sales_rep_email: formData.sales_rep_email || undefined,
        coverage: formData.coverage.split(",").map((s) => s.trim()).filter(Boolean),
        sudan_available: formData.sudan_available,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      // Encrypt credentials
      if (formData.username || formData.password) {
        updates.encrypted_credentials = encryptCredentials({
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Clear credentials if both removed
        updates.encrypted_credentials = undefined;
      }

      await onSave(carrier.id, updates);
      onClose();
    } catch (err: unknown) {
      console.error("Edit carrier error:", err);
      setError(err instanceof Error ? err.message : "Failed to save. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (!carrier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t.common.edit} ${carrier.name}`} maxWidth="xl">
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
            {t.carriers.basicInformation}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.carrierNameLabel} *</span>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`px-3 py-2 border rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm ${fieldErrors.name ? "border-red-300" : "border-slate-200"}`} />
              <FieldError error={fieldErrors.name} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.website}</span>
              <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={`px-3 py-2 border rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm ${fieldErrors.website ? "border-red-300" : "border-slate-200"}`} />
              <FieldError error={fieldErrors.website} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.category}</span>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Forwarder["category"] })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="global">{t.carriers.global}</option>
                <option value="regional">{t.carriers.regional}</option>
                <option value="africa">{t.carriers.africaSpecialist}</option>
                <option value="roro">{t.carriers.roro}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.common.status}</span>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Forwarder["status"] })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm">
                <option value="active">{t.status.active}</option>
                <option value="approved">{t.status.approved}</option>
                <option value="pending">{t.status.pending}</option>
                <option value="not_contacted">{t.carriers.notContacted}</option>
                <option value="inactive">{t.status.inactive}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.portalUrl}</span>
              <input type="url" value={formData.dashboard_url} onChange={(e) => setFormData({ ...formData, dashboard_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="https://portal.carrier.com" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.contactFormUrlShort}</span>
              <input type="url" value={formData.contact_form_url} onChange={(e) => setFormData({ ...formData, contact_form_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="https://carrier.com/contact" />
            </label>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            {t.carriers.portalCredentialsEncrypted}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.username}</span>
              <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder={t.carriers.portalUsername} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.password}</span>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder={t.carriers.portalPassword} />
            </label>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person</span>
            {t.carriers.contactInformation}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.salesRepName}</span>
              <input type="text" value={formData.sales_rep_name} onChange={(e) => setFormData({ ...formData, sales_rep_name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.salesRepEmail}</span>
              <input type="email" value={formData.sales_rep_email} onChange={(e) => setFormData({ ...formData, sales_rep_email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.contactEmail}</span>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">{t.carriers.contactPhone}</span>
              <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
            </label>
          </div>
        </div>

        {/* Coverage & Notes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">public</span>
            {t.carriers.coverageAndNotes}
          </h4>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">{t.carriers.coverageAreas}</span>
            <input type="text" value={formData.coverage} onChange={(e) => setFormData({ ...formData, coverage: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" placeholder="Turkey, Sudan, Saudi Arabia" />
          </label>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-sudan" checked={formData.sudan_available} onChange={(e) => setFormData({ ...formData, sudan_available: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]" />
            <label htmlFor="edit-sudan" className="text-sm text-slate-700">{t.carriers.sudanCoverage}</label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">{t.carriers.notes}</span>
            <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-sm" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-dark-border">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors">{t.common.cancel}</button>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                {t.carriers.saving}
              </>
            ) : (
              t.carriers.saveChanges
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
