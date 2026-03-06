"use client";

import { useState } from "react";
import StatusBadge from "../ui/StatusBadge";
import { decryptCredentials } from "@/lib/encryption";

interface CarrierAccordionProps {
  id: string;
  name: string;
  scacCode?: string;
  status: string;
  lastQuoteDate?: string;
  encryptedCredentials?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  portalUrl?: string;
}

export default function CarrierAccordion({
  name,
  scacCode,
  status,
  lastQuoteDate,
  encryptedCredentials,
  contactName,
  contactEmail,
  contactPhone,
  portalUrl,
}: CarrierAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let credentials: { username?: string; password?: string; email?: string; apiKey?: string; notes?: string } = { username: "", password: "" };
  if (encryptedCredentials) {
    try {
      credentials = decryptCredentials(encryptedCredentials);
    } catch (e) {
      console.error("Failed to decrypt credentials", e);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Logo Placeholder */}
          <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">
              business
            </span>
          </div>

          {/* Carrier Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900">{name}</h3>
              {scacCode && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {scacCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Last quote: {lastQuoteDate || "Never"}
            </p>
          </div>

          {/* Status */}
          <StatusBadge status={status} />
        </div>

        {/* Expand Icon */}
        <span
          className={`material-symbols-outlined text-slate-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </div>

      {/* Expanded Content */}
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
                {/* Portal URL */}
                {portalUrl && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Portal URL
                    </label>
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-[#137fec] hover:underline mt-1"
                    >
                      {portalUrl}
                    </a>
                  </div>
                )}

                {/* Username */}
                {credentials.username && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Username
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={credentials.username}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(credentials.username || "");
                        }}
                        className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                        title="Copy username"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Password */}
                {credentials.password && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={credentials.password}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPassword(!showPassword);
                        }}
                        className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(credentials.password || "");
                        }}
                        className="p-2 text-slate-400 hover:text-[#137fec] transition-colors"
                        title="Copy password"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Contact */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person</span>
                Primary Contact
              </h4>
              <div className="space-y-3">
                {contactName && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Name
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contactName}</p>
                  </div>
                )}

                {contactEmail && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Email
                    </label>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="block text-sm text-[#137fec] hover:underline mt-1"
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}

                {contactPhone && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider">
                      Phone
                    </label>
                    <a
                      href={`tel:${contactPhone}`}
                      className="block text-sm text-[#137fec] hover:underline mt-1"
                    >
                      {contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
            <button className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors">
              Edit Details
            </button>
            <button className="px-4 py-2 text-xs font-semibold text-[#137fec] hover:bg-white rounded-lg transition-colors">
              Request Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
