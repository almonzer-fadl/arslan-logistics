"use client";

import StatusBadge from "./StatusBadge";
import Image from "next/image";

interface CarrierCardProps {
  id: string;
  name: string;
  logo?: string;
  account?: string;
  status: "authenticated" | "not linked" | "active" | "inactive";
  onQuoteClick?: () => void;
  onInfoClick?: () => void;
  onConnectClick?: () => void;
}

export default function CarrierCard({
  name,
  logo,
  account,
  status,
  onQuoteClick,
  onInfoClick,
  onConnectClick,
}: CarrierCardProps) {
  const isLinked = status === "authenticated" || status === "active";

  return (
    <div
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
        !isLinked ? "opacity-75" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
          {logo ? (
            <img src={logo} alt={`${name} Logo`} className="w-10 h-auto" />
          ) : (
            <span className="material-symbols-outlined text-slate-400">
              {isLinked ? "business" : "add_link"}
            </span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <h4 className="font-bold text-slate-900 mb-1">{name}</h4>
      <p className="text-xs text-slate-500 mb-4">
        {account || "Requires API key verification"}
      </p>

      {isLinked ? (
        <div className="flex gap-2">
          <button
            onClick={onQuoteClick}
            className="flex-1 text-xs py-2 px-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Quotation Page
          </button>
          <button
            onClick={onInfoClick}
            className="size-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:text-[#137fec] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
          </button>
        </div>
      ) : (
        <button
          onClick={onConnectClick}
          className="w-full text-xs py-2 px-3 bg-[#137fec]/10 text-[#137fec] rounded-lg font-bold hover:bg-[#137fec]/20 transition-colors border border-[#137fec]/20"
        >
          Connect Carrier
        </button>
      )}
    </div>
  );
}
