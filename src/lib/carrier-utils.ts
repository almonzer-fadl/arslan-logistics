// Shared carrier utilities — monograms, initials, category labels

export const monogramColors: Record<string, { bg: string; text: string }> = {
  "Maersk": { bg: "bg-[#004B87]", text: "text-white" },
  "MSC": { bg: "bg-[#00843D]", text: "text-white" },
  "CMA CGM": { bg: "bg-[#003DA5]", text: "text-white" },
  "Hapag-Lloyd": { bg: "bg-[#FF6600]", text: "text-white" },
  "DB Schenker": { bg: "bg-[#E60028]", text: "text-white" },
  "Kuehne+Nagel": { bg: "bg-[#001F5B]", text: "text-white" },
  "DHL": { bg: "bg-[#FFCC00]", text: "text-[#CC0000]" },
  "Sallaum": { bg: "bg-[#1B3A5C]", text: "text-white" },
  "EUKOR": { bg: "bg-[#002B5C]", text: "text-white" },
};

export function getMonogram(name: string) {
  const match = Object.keys(monogramColors).find((k) => name.includes(k));
  if (match) return monogramColors[match];
  return { bg: "bg-slate-700", text: "text-white" };
}

export function getInitials(name: string): string {
  if (name.includes("MSC")) return "MSC";
  if (name.includes("CMA")) return "CMA";
  if (name.includes("DHL")) return "DHL";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function getCategoryIcon(category: string) {
  switch (category) {
    case "roro": return "directions_car";
    case "africa": return "public";
    case "regional": return "flag";
    default: return "directions_boat";
  }
}

export function getCategoryLabel(category: string) {
  switch (category) {
    case "global": return "Global Carrier";
    case "regional": return "Turkey Regional";
    case "africa": return "Africa Specialist";
    case "roro": return "RORO Vehicle";
    default: return category;
  }
}
