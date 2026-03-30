export interface Port {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  type: "container" | "mixed" | "oil" | "bulk";
}

// Ports relevant to Arslan Integrated Solutions corridors
// Turkey ↔ Sudan, Saudi ↔ Sudan, China ↔ Sudan, Europe ↔ Turkey
export const PORTS: Port[] = [
  // Primary Arslan corridors
  { id: "istanbul", name: "Port of Istanbul", city: "Istanbul", country: "Turkey", lat: 41.0, lon: 28.98, type: "container" },
  { id: "ambarli", name: "Ambarlı Port", city: "Istanbul", country: "Turkey", lat: 40.97, lon: 28.69, type: "container" },
  { id: "mersin", name: "Port of Mersin", city: "Mersin", country: "Turkey", lat: 36.78, lon: 34.64, type: "container" },
  { id: "izmir", name: "Port of Izmir", city: "Izmir", country: "Turkey", lat: 38.44, lon: 27.14, type: "container" },
  { id: "port_sudan", name: "Port Sudan", city: "Port Sudan", country: "Sudan", lat: 19.62, lon: 37.22, type: "mixed" },
  { id: "jeddah", name: "Jeddah Islamic Port", city: "Jeddah", country: "Saudi Arabia", lat: 21.48, lon: 39.17, type: "container" },
  { id: "dammam", name: "King Abdulaziz Port", city: "Dammam", country: "Saudi Arabia", lat: 26.48, lon: 50.21, type: "container" },
  { id: "riyadh_dry", name: "Riyadh Dry Port", city: "Riyadh", country: "Saudi Arabia", lat: 24.69, lon: 46.72, type: "container" },

  // China corridor
  { id: "shanghai", name: "Port of Shanghai", city: "Shanghai", country: "China", lat: 31.23, lon: 121.47, type: "container" },
  { id: "shenzhen", name: "Port of Shenzhen", city: "Shenzhen", country: "China", lat: 22.52, lon: 114.05, type: "container" },
  { id: "ningbo", name: "Ningbo-Zhoushan", city: "Ningbo", country: "China", lat: 29.87, lon: 121.55, type: "container" },
  { id: "guangzhou", name: "Port of Guangzhou", city: "Guangzhou", country: "China", lat: 23.08, lon: 113.24, type: "mixed" },

  // Europe corridor
  { id: "rotterdam", name: "Port of Rotterdam", city: "Rotterdam", country: "Netherlands", lat: 51.90, lon: 4.50, type: "mixed" },
  { id: "hamburg", name: "Port of Hamburg", city: "Hamburg", country: "Germany", lat: 53.54, lon: 9.99, type: "container" },
  { id: "antwerp", name: "Port of Antwerp-Bruges", city: "Antwerp", country: "Belgium", lat: 51.26, lon: 4.40, type: "mixed" },
  { id: "genoa", name: "Port of Genoa", city: "Genoa", country: "Italy", lat: 44.41, lon: 8.93, type: "container" },

  // Transit / chokepoint ports
  { id: "port_said", name: "Port Said", city: "Port Said", country: "Egypt", lat: 31.26, lon: 32.30, type: "mixed" },
  { id: "suez", name: "Port of Suez", city: "Suez", country: "Egypt", lat: 29.97, lon: 32.55, type: "mixed" },
  { id: "aden", name: "Port of Aden", city: "Aden", country: "Yemen", lat: 12.79, lon: 45.03, type: "mixed" },
  { id: "djibouti", name: "Port of Djibouti", city: "Djibouti", country: "Djibouti", lat: 11.59, lon: 43.15, type: "mixed" },
  { id: "salalah", name: "Port of Salalah", city: "Salalah", country: "Oman", lat: 16.94, lon: 54.00, type: "container" },
  { id: "jebel_ali", name: "Jebel Ali", city: "Dubai", country: "UAE", lat: 25.01, lon: 55.06, type: "container" },

  // East Africa
  { id: "mombasa", name: "Port of Mombasa", city: "Mombasa", country: "Kenya", lat: -4.04, lon: 39.66, type: "mixed" },
  { id: "dar_es_salaam", name: "Port of Dar es Salaam", city: "Dar es Salaam", country: "Tanzania", lat: -6.83, lon: 39.29, type: "mixed" },
];

// Fuzzy match a port name string (e.g. "Istanbul, Turkey") to a port record
export function resolvePort(portString: string): Port | undefined {
  const lower = portString.toLowerCase();
  return PORTS.find(
    (p) =>
      lower.includes(p.city.toLowerCase()) ||
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.id)
  );
}

// Get port coordinates, returns [lon, lat] for GeoJSON / deck.gl
export function getPortCoords(portString: string): [number, number] | null {
  const port = resolvePort(portString);
  if (!port) return null;
  return [port.lon, port.lat];
}
