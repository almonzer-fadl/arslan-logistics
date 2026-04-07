"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import type { Forwarder } from "@/lib/types";
import { getMonogram, getInitials, getCategoryIcon, getCategoryLabel } from "@/lib/carrier-utils";
import { decryptCredentials } from "@/lib/encryption";

interface CarrierDetailModalProps {
  carrier: Forwarder | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenPortal?: (name: string, url: string) => void;
}

export default function CarrierDetailModal({ carrier, onClose, onEdit, onDelete, onOpenPortal }: CarrierDetailModalProps) {
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (!carrier) return null;

  const mono = getMonogram(carrier.name);

  let creds: { username?: string; password?: string } | null = null;
  if (carrier.encrypted_credentials) {
    try {
      creds = decryptCredentials(carrier.encrypted_credentials);
    } catch {}
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal isOpen={!!carrier} onClose={() => { onClose(); setShowCredentials(false); setShowPw(false); }} title="" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl ${mono.bg} ${mono.text} flex items-center justify-center font-black text-xl shadow-md`}>
            {getInitials(carrier.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{carrier.name}</h2>
              <StatusBadge status={carrier.status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(carrier.category)}</span>
              <span>{getCategoryLabel(carrier.category)}</span>
              {carrier.sudan_available && (
                <span className="text-green-600 font-semibold ml-2">🇸🇩 Sudan Ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          {carrier.website && (
            <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-dark-elevated text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined text-[16px]">language</span>
              Website
            </a>
          )}
          {carrier.dashboard_url && (
            <>
              <a href={carrier.dashboard_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#137fec]/10 text-[#137fec] rounded-lg text-sm font-bold hover:bg-[#137fec]/20 transition-colors">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Open Portal
              </a>
              {onOpenPortal && (
                <button
                  onClick={() => {
                    onOpenPortal(carrier.name, carrier.dashboard_url!);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tab_group</span>
                  Split View
                </button>
              )}
            </>
          )}
          {carrier.contact_form_url && (
            <a href={carrier.contact_form_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
              <span className="material-symbols-outlined text-[16px]">request_quote</span>
              Request Quote
            </a>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portal Credentials */}
          <div className="bg-slate-50 dark:bg-dark-elevated rounded-xl p-5 border border-slate-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                Portal Credentials
              </h5>
              {creds && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">AES-256</span>
              )}
            </div>

            {creds ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Username</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-dark-card px-3 py-2.5 rounded-lg border border-slate-200 dark:border-dark-border">
                    <span className="text-sm text-slate-900 dark:text-white flex-1 font-mono">{showCredentials ? creds.username : "••••••••••••"}</span>
                    <button onClick={() => copyToClipboard(creds!.username || "")} className="text-slate-400 hover:text-[#137fec] transition-colors" title="Copy">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Password</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-dark-card px-3 py-2.5 rounded-lg border border-slate-200 dark:border-dark-border">
                    <span className="text-sm text-slate-900 dark:text-white flex-1 font-mono">
                      {showCredentials && showPw ? creds.password : "••••••••••••"}
                    </span>
                    <button onClick={() => { setShowCredentials(true); setShowPw(!showPw); }} className="text-slate-400 hover:text-[#137fec] transition-colors" title={showPw ? "Hide" : "Show"}>
                      <span className="material-symbols-outlined text-[18px]">{showCredentials && showPw ? "visibility_off" : "visibility"}</span>
                    </button>
                    <button onClick={() => copyToClipboard(creds!.password || "")} className="text-slate-400 hover:text-[#137fec] transition-colors" title="Copy">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
                {!showCredentials && (
                  <button
                    onClick={() => setShowCredentials(true)}
                    className="w-full mt-1 text-sm font-semibold text-[#137fec] hover:bg-[#137fec]/5 py-2 rounded-lg transition-colors"
                  >
                    Reveal Credentials
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2 block">lock_open</span>
                <p className="text-sm text-slate-400 dark:text-slate-500">No credentials stored</p>
                {onEdit && <button onClick={onEdit} className="text-sm font-semibold text-[#137fec] mt-2 hover:underline">Add credentials</button>}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-slate-50 dark:bg-dark-elevated rounded-xl p-5 border border-slate-200 dark:border-dark-border">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Primary Contact
            </h5>

            {(carrier.sales_rep_name || carrier.contact_email || carrier.contact_phone) ? (
              <div className="space-y-3">
                {carrier.sales_rep_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#137fec]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#137fec] text-[20px]">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{carrier.sales_rep_name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Account Manager</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2 mt-2">
                  {(carrier.contact_email || carrier.sales_rep_email) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">mail</span>
                      <a href={`mailto:${carrier.contact_email || carrier.sales_rep_email}`} className="text-[#137fec] hover:underline">
                        {carrier.contact_email || carrier.sales_rep_email}
                      </a>
                    </div>
                  )}
                  {carrier.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">call</span>
                      <a href={`tel:${carrier.contact_phone}`} className="text-[#137fec] hover:underline">{carrier.contact_phone}</a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2 block">person_off</span>
                <p className="text-sm text-slate-400 dark:text-slate-500">No contact info yet</p>
                {onEdit && <button onClick={onEdit} className="text-sm font-semibold text-[#137fec] mt-2 hover:underline">Add contact</button>}
              </div>
            )}
          </div>
        </div>

        {/* Coverage Areas */}
        {carrier.coverage && carrier.coverage.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Coverage Areas</h5>
            <div className="flex flex-wrap gap-2">
              {carrier.coverage.map((area) => (
                <span key={area} className="text-xs bg-slate-100 dark:bg-dark-elevated text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {carrier.notes && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
            <h5 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sticky_note_2</span>
              Notes
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{carrier.notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-dark-border">
          <div className="flex gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Added {new Date(carrier.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>Updated {new Date(carrier.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-1.5 text-sm bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
