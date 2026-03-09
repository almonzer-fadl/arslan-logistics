"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import Modal from "./Modal";
import type { Forwarder } from "@/lib/types";

interface CarrierCardProps {
  carrier: Forwarder;
  onConnectClick?: () => void;
}

export default function CarrierCard({ carrier, onConnectClick }: CarrierCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const isLinked = carrier.status === "active" || carrier.status === "approved";
  const hasPortal = !!carrier.dashboard_url;
  const hasContact = !!carrier.contact_form_url || !!carrier.contact_email;

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#137fec]/30 ${
          !isLinked ? "opacity-80" : ""
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-slate-400">
              {isLinked ? "business" : carrier.status === "pending" ? "hourglass_top" : "add_link"}
            </span>
          </div>
          <StatusBadge status={carrier.status} />
        </div>

        <h4 className="font-bold text-slate-900 mb-0.5">{carrier.name}</h4>
        <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">{carrier.category}</p>
        <p className="text-xs text-slate-500 mb-4 line-clamp-1">
          {carrier.coverage?.join(", ") || "No coverage info"}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {hasPortal && (
            <a
              href={carrier.dashboard_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs py-2 px-3 bg-[#137fec]/10 text-[#137fec] rounded-lg font-semibold hover:bg-[#137fec]/20 transition-colors text-center flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              Portal
            </a>
          )}
          {hasContact && (
            <a
              href={carrier.contact_form_url || `mailto:${carrier.contact_email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs py-2 px-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">mail</span>
              Contact
            </a>
          )}
          {!hasPortal && !hasContact && !isLinked && (
            <button
              onClick={(e) => { e.stopPropagation(); onConnectClick?.(); }}
              className="w-full text-xs py-2 px-3 bg-[#137fec]/10 text-[#137fec] rounded-lg font-bold hover:bg-[#137fec]/20 transition-colors border border-[#137fec]/20"
            >
              Connect Carrier
            </button>
          )}
          {!hasPortal && !hasContact && isLinked && (
            <a
              href={carrier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs py-2 px-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">language</span>
              Website
            </a>
          )}
        </div>
      </div>

      {/* Detail View Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={carrier.name} maxWidth="xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-[28px]">
                  {carrier.category === "roro" ? "directions_car" : "directions_boat"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{carrier.name}</h3>
                <p className="text-sm text-slate-500 capitalize">{carrier.category} carrier</p>
              </div>
            </div>
            <StatusBadge status={carrier.status} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Website */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Website</p>
              <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#137fec] hover:underline flex items-center gap-1">
                {carrier.website.replace(/^https?:\/\/(www\.)?/, "")}
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            {/* Portal */}
            {carrier.dashboard_url && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Portal URL</p>
                <a href={carrier.dashboard_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#137fec] hover:underline flex items-center gap-1">
                  {carrier.dashboard_url.replace(/^https?:\/\/(www\.)?/, "").substring(0, 40)}
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            )}

            {/* Contact Form */}
            {carrier.contact_form_url && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contact Form</p>
                <a href={carrier.contact_form_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#137fec] hover:underline flex items-center gap-1">
                  Quote / Contact Form
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            )}

            {/* Category */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Category</p>
              <p className="text-sm text-slate-900 capitalize">{carrier.category}</p>
            </div>

            {/* Sudan Available */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sudan Coverage</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${carrier.sudan_available ? "bg-green-500" : "bg-red-400"}`} />
                <p className="text-sm text-slate-900">{carrier.sudan_available ? "Available" : "Not Available"}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm text-slate-900 capitalize">{carrier.status.replace("_", " ")}</p>
            </div>
          </div>

          {/* Coverage */}
          {carrier.coverage && carrier.coverage.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Coverage Areas</p>
              <div className="flex flex-wrap gap-2">
                {carrier.coverage.map((area) => (
                  <span key={area} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(carrier.contact_email || carrier.contact_phone || carrier.sales_rep_name) && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Contact Information</p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                {carrier.sales_rep_name && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                    <span className="text-sm text-slate-900">{carrier.sales_rep_name}</span>
                  </div>
                )}
                {carrier.contact_email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                    <a href={`mailto:${carrier.contact_email}`} className="text-sm text-[#137fec] hover:underline">{carrier.contact_email}</a>
                  </div>
                )}
                {carrier.sales_rep_email && carrier.sales_rep_email !== carrier.contact_email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                    <a href={`mailto:${carrier.sales_rep_email}`} className="text-sm text-[#137fec] hover:underline">{carrier.sales_rep_email}</a>
                  </div>
                )}
                {carrier.contact_phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                    <a href={`tel:${carrier.contact_phone}`} className="text-sm text-[#137fec] hover:underline">{carrier.contact_phone}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {carrier.notes && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">{carrier.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex gap-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>Added: {new Date(carrier.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(carrier.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
