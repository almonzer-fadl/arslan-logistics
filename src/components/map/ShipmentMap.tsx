"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, ArcLayer, TextLayer } from "@deck.gl/layers";
import type { Shipment } from "@/lib/types";
import { PORTS, resolvePort, getPortCoords, type Port } from "@/config/ports";

type ShipmentWithForwarder = Shipment & { forwarders?: { name: string } };

interface ShipmentMapProps {
  shipments: ShipmentWithForwarder[];
  selectedShipment: ShipmentWithForwarder | null;
  onSelectShipment: (s: ShipmentWithForwarder) => void;
  darkMode?: boolean;
}

// Status → color mapping
const STATUS_COLORS: Record<string, [number, number, number]> = {
  booked: [100, 116, 139],
  in_transit: [19, 127, 236],
  on_vessel: [19, 127, 236],
  port_arrival: [245, 158, 11],
  customs: [245, 158, 11],
  arrived: [16, 185, 129],
  delivered: [16, 185, 129],
  cancelled: [239, 68, 68],
};

// Primary Arslan corridor connections (always visible)
const CORRIDOR_ROUTES: { from: string; to: string; label: string; color: [number, number, number, number] }[] = [
  { from: "istanbul", to: "port_sudan", label: "Turkey → Sudan", color: [19, 127, 236, 50] },
  { from: "istanbul", to: "jeddah", label: "Turkey → Saudi", color: [19, 127, 236, 50] },
  { from: "mersin", to: "port_sudan", label: "Turkey → Sudan", color: [19, 127, 236, 35] },
  { from: "jeddah", to: "port_sudan", label: "Saudi → Sudan", color: [245, 158, 11, 50] },
  { from: "dammam", to: "port_sudan", label: "Saudi → Sudan", color: [245, 158, 11, 35] },
  { from: "shanghai", to: "port_sudan", label: "China → Sudan", color: [16, 185, 129, 40] },
  { from: "shanghai", to: "jeddah", label: "China → Saudi", color: [16, 185, 129, 35] },
  { from: "rotterdam", to: "istanbul", label: "Europe → Turkey", color: [139, 92, 246, 40] },
  { from: "hamburg", to: "istanbul", label: "Europe → Turkey", color: [139, 92, 246, 35] },
  { from: "istanbul", to: "jebel_ali", label: "Turkey → UAE", color: [19, 127, 236, 30] },
  { from: "jebel_ali", to: "port_sudan", label: "UAE → Sudan", color: [245, 158, 11, 30] },
  { from: "shenzhen", to: "jeddah", label: "China → Saudi", color: [16, 185, 129, 30] },
];

// Estimate vessel position along route
function estimateVesselPosition(
  shipment: ShipmentWithForwarder,
  origin: [number, number],
  destination: [number, number]
): [number, number] | null {
  if (!["in_transit", "on_vessel"].includes(shipment.status)) return null;

  let progress = 0.5;
  if (shipment.departure_date && shipment.arrival_date) {
    const dep = new Date(shipment.departure_date).getTime();
    const arr = new Date(shipment.arrival_date).getTime();
    const now = Date.now();
    if (arr > dep) {
      progress = Math.max(0.05, Math.min(0.95, (now - dep) / (arr - dep)));
    }
  }

  return [
    origin[0] + (destination[0] - origin[0]) * progress,
    origin[1] + (destination[1] - origin[1]) * progress,
  ];
}

export default function ShipmentMap({
  shipments,
  selectedShipment,
  onSelectShipment,
  darkMode = false,
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const lightStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode ? darkStyle : lightStyle,
      center: [40, 25],
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });
    map.addControl(overlay as unknown as maplibregl.IControl);

    mapRef.current = map;
    overlayRef.current = overlay;

    map.on("load", () => setMapReady(true));

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update style on dark mode toggle
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    mapRef.current.setStyle(darkMode ? darkStyle : lightStyle);
  }, [darkMode, mapReady]);

  // Build layers
  useEffect(() => {
    if (!overlayRef.current || !mapReady) return;

    const portMap = new Map<string, Port>();
    for (const p of PORTS) portMap.set(p.id, p);

    // --- 1. Corridor arcs (always visible, subtle background routes) ---
    const corridorData = CORRIDOR_ROUTES.map((r) => {
      const from = portMap.get(r.from);
      const to = portMap.get(r.to);
      if (!from || !to) return null;
      return { origin: [from.lon, from.lat] as [number, number], destination: [to.lon, to.lat] as [number, number], color: r.color, label: r.label };
    }).filter(Boolean) as { origin: [number, number]; destination: [number, number]; color: [number, number, number, number]; label: string }[];

    const corridorArcLayer = new ArcLayer({
      id: "corridor-arcs",
      data: corridorData,
      getSourcePosition: (d) => d.origin,
      getTargetPosition: (d) => d.destination,
      getSourceColor: (d) => d.color,
      getTargetColor: (d) => d.color,
      getWidth: 1.5,
      widthMinPixels: 1,
      widthMaxPixels: 3,
      greatCircle: true,
    });

    // --- 2. All ports (always visible) ---
    // Categorize ports for visual hierarchy
    const primaryPortIds = new Set(["istanbul", "port_sudan", "jeddah", "shanghai", "rotterdam"]);
    const secondaryPortIds = new Set(["mersin", "izmir", "ambarli", "dammam", "shenzhen", "hamburg", "jebel_ali"]);

    // Split ports into layers for visual hierarchy
    const primaryPorts = PORTS.filter((p) => primaryPortIds.has(p.id));
    const secondaryPorts = PORTS.filter((p) => secondaryPortIds.has(p.id));
    const tertiaryPorts = PORTS.filter((p) => !primaryPortIds.has(p.id) && !secondaryPortIds.has(p.id));

    const primaryPortLayer = new ScatterplotLayer({
      id: "primary-ports",
      data: primaryPorts,
      getPosition: (d: Port) => [d.lon, d.lat] as [number, number],
      getRadius: 8000,
      radiusMinPixels: 6,
      radiusMaxPixels: 14,
      getFillColor: darkMode ? [19, 127, 236, 220] : [19, 127, 236, 200],
      getLineColor: [255, 255, 255, 200] as [number, number, number, number],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: true,
    });

    const secondaryPortLayer = new ScatterplotLayer({
      id: "secondary-ports",
      data: secondaryPorts,
      getPosition: (d: Port) => [d.lon, d.lat] as [number, number],
      getRadius: 5000,
      radiusMinPixels: 4,
      radiusMaxPixels: 10,
      getFillColor: darkMode ? [148, 163, 184, 180] : [100, 116, 139, 160],
      getLineColor: darkMode ? [255, 255, 255, 60] : [255, 255, 255, 100],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
      pickable: true,
    });

    const tertiaryPortLayer = new ScatterplotLayer({
      id: "tertiary-ports",
      data: tertiaryPorts,
      getPosition: (d: Port) => [d.lon, d.lat] as [number, number],
      getRadius: 3500,
      radiusMinPixels: 3,
      radiusMaxPixels: 8,
      getFillColor: darkMode ? [100, 116, 139, 120] : [148, 163, 184, 120],
      getLineColor: darkMode ? [255, 255, 255, 40] : [255, 255, 255, 80],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
      pickable: true,
    });

    // Port labels (primary + secondary only)
    const labelPorts = PORTS.filter((p) => primaryPortIds.has(p.id) || secondaryPortIds.has(p.id));
    const portLabelLayer = new TextLayer({
      id: "port-labels",
      data: labelPorts,
      getPosition: (d: Port) => [d.lon, d.lat] as [number, number],
      getText: (d: Port) => d.city,
      getSize: (d: Port) => primaryPortIds.has(d.id) ? 13 : 11,
      getColor: (d: Port) => {
        if (primaryPortIds.has(d.id)) return darkMode ? [255, 255, 255, 230] : [15, 23, 42, 230];
        return darkMode ? [180, 180, 180, 200] : [71, 85, 105, 200];
      },
      getAngle: 0,
      getTextAnchor: "start" as const,
      getAlignmentBaseline: "center" as const,
      getPixelOffset: [10, 0],
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: darkMode ? [13, 17, 23, 220] : [255, 255, 255, 220],
      billboard: false,
      sizeMinPixels: 9,
      sizeMaxPixels: 15,
    });

    // --- 3. Shipment routes (on top of corridors, brighter) ---
    const routes: {
      shipment: ShipmentWithForwarder;
      origin: [number, number];
      destination: [number, number];
    }[] = [];
    for (const s of shipments) {
      const o = getPortCoords(s.origin_port);
      const d = getPortCoords(s.destination_port);
      if (o && d) routes.push({ shipment: s, origin: o, destination: d });
    }

    const shipmentArcLayer = new ArcLayer({
      id: "shipment-arcs",
      data: routes,
      getSourcePosition: (d) => d.origin,
      getTargetPosition: (d) => d.destination,
      getSourceColor: (d) => {
        const isSelected = selectedShipment?.id === d.shipment.id;
        const color = STATUS_COLORS[d.shipment.status] || [100, 116, 139];
        return [...color, isSelected ? 255 : 160] as [number, number, number, number];
      },
      getTargetColor: (d) => {
        const isSelected = selectedShipment?.id === d.shipment.id;
        const color = STATUS_COLORS[d.shipment.status] || [100, 116, 139];
        return [...color, isSelected ? 255 : 160] as [number, number, number, number];
      },
      getWidth: (d) => (selectedShipment?.id === d.shipment.id ? 4 : 2.5),
      widthMinPixels: 1.5,
      widthMaxPixels: 6,
      greatCircle: true,
      pickable: true,
      onClick: ({ object }) => {
        if (object) onSelectShipment(object.shipment);
      },
      updateTriggers: {
        getSourceColor: [selectedShipment?.id],
        getTargetColor: [selectedShipment?.id],
        getWidth: [selectedShipment?.id],
      },
    });

    // --- 4. Vessel positions ---
    const vessels: { shipment: ShipmentWithForwarder; position: [number, number] }[] = [];
    for (const r of routes) {
      const pos = estimateVesselPosition(r.shipment, r.origin, r.destination);
      if (pos) vessels.push({ shipment: r.shipment, position: pos });
    }

    const vesselLayer = new ScatterplotLayer({
      id: "vessel-positions",
      data: vessels,
      getPosition: (d) => d.position,
      getRadius: 8000,
      radiusMinPixels: 8,
      radiusMaxPixels: 16,
      getFillColor: (d) => {
        const isSelected = selectedShipment?.id === d.shipment.id;
        return isSelected
          ? ([19, 127, 236, 255] as [number, number, number, number])
          : ([19, 127, 236, 200] as [number, number, number, number]);
      },
      getLineColor: [255, 255, 255, 255] as [number, number, number, number],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: true,
      onClick: ({ object }) => {
        if (object) onSelectShipment(object.shipment);
      },
      updateTriggers: { getFillColor: [selectedShipment?.id] },
    });

    const selectedVessel = vessels.find((v) => v.shipment.id === selectedShipment?.id);
    const pulseLayer = new ScatterplotLayer({
      id: "vessel-pulse",
      data: selectedVessel ? [selectedVessel] : [],
      getPosition: (d) => d.position,
      getRadius: 18000,
      radiusMinPixels: 18,
      radiusMaxPixels: 30,
      getFillColor: [19, 127, 236, 40] as [number, number, number, number],
      getLineColor: [19, 127, 236, 100] as [number, number, number, number],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
    });

    const vesselLabelLayer = new TextLayer({
      id: "vessel-labels",
      data: vessels,
      getPosition: (d) => d.position,
      getText: (d) =>
        d.shipment.vessel_name ||
        d.shipment.booking_reference ||
        d.shipment.id.substring(0, 8).toUpperCase(),
      getSize: 11,
      getColor: darkMode
        ? ([255, 255, 255, 220] as [number, number, number, number])
        : ([19, 127, 236, 255] as [number, number, number, number]),
      getAngle: 0,
      getTextAnchor: "start" as const,
      getAlignmentBaseline: "center" as const,
      getPixelOffset: [16, 0],
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: 700,
      outlineWidth: 2,
      outlineColor: darkMode
        ? ([13, 17, 23, 220] as [number, number, number, number])
        : ([255, 255, 255, 220] as [number, number, number, number]),
      billboard: false,
      sizeMinPixels: 10,
      sizeMaxPixels: 13,
    });

    // --- 5. Selected shipment endpoints ---
    const selectedRoute = routes.find((r) => r.shipment.id === selectedShipment?.id);
    const endpointData = selectedRoute
      ? [
          { position: selectedRoute.origin, type: "origin" as const },
          { position: selectedRoute.destination, type: "destination" as const },
        ]
      : [];

    const endpointLayer = new ScatterplotLayer({
      id: "selected-endpoints",
      data: endpointData,
      getPosition: (d) => d.position,
      getRadius: 10000,
      radiusMinPixels: 8,
      radiusMaxPixels: 14,
      getFillColor: (d) =>
        d.type === "origin"
          ? ([19, 127, 236, 200] as [number, number, number, number])
          : ([16, 185, 129, 200] as [number, number, number, number]),
      getLineColor: [255, 255, 255, 255] as [number, number, number, number],
      getLineWidth: 3,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
    });

    overlayRef.current.setProps({
      layers: [
        corridorArcLayer,
        tertiaryPortLayer,
        secondaryPortLayer,
        primaryPortLayer,
        portLabelLayer,
        shipmentArcLayer,
        endpointLayer,
        pulseLayer,
        vesselLayer,
        vesselLabelLayer,
      ],
    });
  }, [shipments, selectedShipment, darkMode, mapReady, onSelectShipment]);

  // Fly to selected shipment
  useEffect(() => {
    if (!mapRef.current || !selectedShipment || !mapReady) return;
    const origin = getPortCoords(selectedShipment.origin_port);
    const dest = getPortCoords(selectedShipment.destination_port);
    if (!origin || !dest) return;

    mapRef.current.flyTo({
      center: [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2],
      zoom: Math.abs(origin[0] - dest[0]) > 80 ? 2.5 : Math.abs(origin[0] - dest[0]) > 40 ? 3.5 : Math.abs(origin[0] - dest[0]) > 20 ? 4.5 : 5.5,
      duration: 1200,
      essential: true,
    });
  }, [selectedShipment, mapReady]);

  return (
    <div
      ref={mapContainer}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
    />
  );
}
