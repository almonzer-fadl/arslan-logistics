"use client";

import { useTranslation } from "@/lib/i18n";
import StatusBadge from "./StatusBadge";
import type { Forwarder } from "@/lib/types";
import { getMonogram, getInitials, getCategoryIcon, getCategoryLabel } from "@/lib/carrier-utils";
import { decryptCredentials } from "@/lib/encryption";

interface CarrierCardProps {
  carrier: Forwarder;
  onClick?: () => void;
  onEditClick?: () => void;
}

export default function CarrierCard({ carrier, onClick, onEditClick }: CarrierCardProps) {
  const { t } = useTranslation();
  const mono = getMonogram(carrier.name);
  const linked = ["active", "approved"].includes(carrier.status);

  let hasCreds = false;
  if (carrier.encrypted_credentials) {
    try {
      decryptCredentials(carrier.encrypted_credentials);
      hasCreds = true;
    } catch {}
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
        !linked ? "opacity-90" : ""
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${linked ? "bg-emerald-500" : carrier.status === "pending" ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600"}`} />

      <div className="p-5">
        {/* Logo + Status */}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-lg ${mono.bg} ${mono.text} flex items-center justify-center font-black text-sm shadow-sm`}>
            {getInitials(carrier.name)}
          </div>
          <StatusBadge status={carrier.status} />
        </div>

        {/* Name + Category */}
        <h4 className="font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-[#137fec] transition-colors">{carrier.name}</h4>
        <div className="flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[14px]">{getCategoryIcon(carrier.category)}</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">{getCategoryLabel(carrier.category)}</p>
        </div>

        {/* Coverage Tags */}
        <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
          {carrier.coverage?.slice(0, 3).map((area) => (
            <span key={area} className="text-[10px] bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
              {area}
            </span>
          ))}
          {(carrier.coverage?.length || 0) > 3 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 py-0.5">
              +{carrier.coverage!.length - 3}
            </span>
          )}
          {carrier.sudan_available && (
            <span className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
              🇸🇩 Sudan
            </span>
          )}
        </div>

        {/* Credential indicator + Quick Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-border">
          <div className="flex items-center gap-1.5">
            {hasCreds ? (
              <>
                <span className="material-symbols-outlined text-emerald-500 text-[16px]">lock</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{t.carriers.credentialsStored}</span>
              </>
            ) : carrier.website ? (
              <a
                href={carrier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[#137fec] text-[16px]">language</span>
                <span className="text-[10px] text-[#137fec] font-semibold uppercase">{t.carriers.visitWebsite}</span>
              </a>
            ) : (
              <>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">lock_open</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{t.carriers.noCredentials}</span>
              </>
            )}
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {carrier.category === "regional" && carrier.contact_phone && (
              <a
                href={`tel:${carrier.contact_phone}`}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-colors"
                title={carrier.contact_phone}
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
            )}
            {carrier.category === "regional" && (carrier.contact_form_url || carrier.contact_email) && (
              <a
                href={carrier.contact_form_url || `mailto:${carrier.contact_email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                title={carrier.contact_form_url ? "Contact Form" : carrier.contact_email}
              >
                <span className="material-symbols-outlined text-[18px]">{carrier.contact_form_url ? "description" : "mail"}</span>
              </a>
            )}
            {carrier.dashboard_url && (
              <a
                href={carrier.dashboard_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                title="Open Portal"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            )}
            {onEditClick && (
              <button
                onClick={onEditClick}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-[#137fec] hover:bg-[#137fec]/5 transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
