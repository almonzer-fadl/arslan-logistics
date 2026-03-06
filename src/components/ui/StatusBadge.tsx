interface StatusBadgeProps {
  status: string;
  variant?: "default" | "shipment" | "quote";
}

const statusConfig = {
  // Shipment statuses
  booked: { color: "blue", label: "Booked" },
  in_transit: { color: "blue", label: "In Transit" },
  "on water": { color: "blue", label: "On Water" },
  "port entry": { color: "amber", label: "Port Entry" },
  customs: { color: "amber", label: "Customs" },
  arrived: { color: "green", label: "Arrived" },
  delivered: { color: "green", label: "Delivered" },
  cancelled: { color: "red", label: "Cancelled" },
  
  // Quote statuses
  pending: { color: "slate", label: "Pending" },
  draft: { color: "slate", label: "Draft" },
  submitted: { color: "blue", label: "Submitted" },
  received: { color: "green", label: "Received" },
  expired: { color: "red", label: "Expired" },
  accepted: { color: "green", label: "Accepted" },
  
  // Carrier statuses
  active: { color: "green", label: "Active" },
  inactive: { color: "slate", label: "Inactive" },
  authenticated: { color: "green", label: "Authenticated" },
  "not linked": { color: "slate", label: "Not Linked" },
};

const colorClasses = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-100 text-slate-600",
};

export default function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || {
    color: "slate",
    label: status,
  };

  const colorClass = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colorClass}`}
    >
      <span className={`size-1 rounded-full ${config.color === 'green' ? 'bg-green-500' : config.color === 'blue' ? 'bg-blue-500' : config.color === 'amber' ? 'bg-amber-500' : config.color === 'red' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
      {config.label}
    </span>
  );
}
