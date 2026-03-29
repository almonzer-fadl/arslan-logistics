"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface ShipmentRowProps {
  id: string;
  trackingNumber: string;
  carrier: string;
  carrierLogo?: string;
  originPort: string;
  destinationPort: string;
  status: string;
  eta?: string;
  cost: number;
}

export default function ShipmentRow({
  id,
  trackingNumber,
  carrier,
  originPort,
  destinationPort,
  status,
  eta,
  cost,
}: ShipmentRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-[#137fec]">
      <td className="px-6 py-4">
        <Link href={`/dashboard/shipments/${id}`} className="block">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white">{trackingNumber}</span>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600 dark:text-slate-300">{carrier}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold">{originPort}</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          <span className="font-bold">{destinationPort}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={status} variant="shipment" />
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{eta || "TBD"}</td>
      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
        ${cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-400 dark:text-slate-500 hover:text-[#137fec]">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </td>
    </tr>
  );
}
