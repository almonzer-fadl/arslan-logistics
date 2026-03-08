"use client";

import { useState } from "react";
import StatusBadge from "../ui/StatusBadge";
import { decryptCredentials } from "@/lib/encryption";
import type { Forwarder } from "@/lib/types";

interface CarrierAccordionProps {
  carrier: Forwarder;
  onEdit: () => void;
}

export default function CarrierAccordion({ carrier, onEdit }: CarrierAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let credentials: { username?: string; password?: string } = {};
  if (carrier.encrypted_credentials) {
    try {
      credentials = decryptCredentials(carrier.encrypted_credentials);
    } catch {}
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const categoryLabel = {
    global: "Global",
    regional: "Turkey Regional",
    africa: "Africa / Sudan",
    roro: "RORO Vehicle",
  }[carrier.category] || carrier.category;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4 flex-1">
          <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">
              {carrier.category === "roro" ? "directions_car" : carrier.category === "africa" ? "public" : "business"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-bold text-slate-900">{carrier.name}</h3>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-semibold">{categoryLabel}</span>
              {carrier.sudan_available && (
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-semibold">🇸🇩 Sudan</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {carrier.website && <span className="truncate max-w-[200px]">{carrier.website.replace(/https?:\/\//, "")}</span>}
              {carrier.coverage?.length > 0 && <span className="hidden md:inline">· {carrier.coverage.slice(0, 3).join(", ")}{carrier.coverage.length > 3 ? ` +${carrier.coverage.length - 3}` : ""}</span>}
            </div>
          </div>
          <StatusBadge status={carrier.status} />
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ml-3 ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portal Login */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                Portal Login
              </h4>
              <div className="space-y-3">
                {carrier.dashboard_url && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Portal URL</label>
                    <a href={carrier.dashboard_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#137fec] hover:underline mt-1 truncate">{carrier.dashboard_url}</a>
                  </div>
                )}
                {credentials.username ? (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Username</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="text" readOnly value={credentials.username} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(credentials.username || ""); }} className="p-2 text-slate-400 hover:text-[#137fec]" title="Copy">
                          <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Password</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type={showPassword ? "text" : "password"} readOnly value={credentials.password || ""} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        <button onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }} className="p-2 text-slate-400 hover:text-[#137fec]" title={showPassword ? "Hide" : "Show"}>
                          <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(credentials.password || ""); }} className="p-2 text-slate-400 hover:text-[#137fec]" title="Copy">
                          <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">No credentials stored</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person</span>
                Contact Information
              </h4>
              <div className="space-y-3">
                {carrier.sales_rep_name && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Sales Rep</label>
                    <p className="text-sm text-slate-900 mt-1">{carrier.sales_rep_name}</p>
                  </div>
                )}
                {(carrier.contact_email || carrier.sales_rep_email) && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
                    <a href={`mailto:${carrier.contact_email || carrier.sales_rep_email}`} className="block text-sm text-[#137fec] hover:underline mt-1">{carrier.contact_email || carrier.sales_rep_email}</a>
                  </div>
                )}
                {carrier.contact_phone && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Phone</label>
                    <a href={`tel:${carrier.contact_phone}`} className="block text-sm text-[#137fec] hover:underline mt-1">{carrier.contact_phone}</a>
                  </div>
                )}
                {carrier.contact_form_url && (
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Quote Form</label>
                    <a href={carrier.contact_form_url} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#137fec] hover:underline mt-1 truncate">{carrier.contact_form_url}</a>
                  </div>
                )}
                {!carrier.sales_rep_name && !carrier.contact_email && !carrier.contact_phone && !carrier.contact_form_url && (
                  <p className="text-sm text-slate-400 italic">No contact info yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {carrier.notes && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Notes</label>
              <p className="text-sm text-slate-600 mt-1">{carrier.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="px-4 py-2 text-sm font-semibold text-[#137fec] hover:bg-[#137fec]/5 rounded-lg transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Details
            </button>
            {carrier.dashboard_url && (
              <a href={carrier.dashboard_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Open Portal
              </a>
            )}
            {carrier.contact_form_url && (
              <a href={carrier.contact_form_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">request_quote</span>
                Request Quote
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
