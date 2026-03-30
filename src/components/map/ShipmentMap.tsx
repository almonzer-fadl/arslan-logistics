"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Deck } from "@deck.gl/core";
import { ScatterplotLayer, ArcLayer, TextLayer, IconLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
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
  booked: [100, 116, 139],       // slate
  in_transit: [19, 127, 236],    // primary blue
  on_vessel: [19, 127, 236],     // primary blue
  port_arrival: [245, 158, 11],  // amber
  customs: [245, 158, 11],       // amber
  arrived: [16, 185, 129],       // emerald
  delivered: [16, 185, 129],     // emerald
  cancelled: [239, 68, 68],      // red
};

// Interpolate points along a great circle arc for smooth curves
function interpolateArc(
  start: [number, number],
  end: [number, number],
  numPoints = 50
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lon = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    points.push([lon, lat]);
  }
  return points;
}

// Estimate vessel position along route based on status
function estimateVesselPosition(
  shipment: ShipmentWithForwarder,
  origin: [number, number],
  destination: [number, number]
): [number, number] | null {
  const activeStatuses = ["in_transit", "on_vessel"];
  if (!activeStatuses.includes(shipment.status)) return null;

  // Calculate progress based on dates if available
  let progress = 0.5; // default midpoint
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

  // Map style URLs (free tile providers)
  const lightStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode ? darkStyle : lightStyle,
      center: [40, 25], // Center on Red Sea / Middle East region
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

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
    };
  }, []);

  // Update map style when dark mode changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    mapRef.current.setStyle(darkMode ? darkStyle : lightStyle);
  }, [darkMode, mapReady]);

  // Build and update deck.gl layers
  useEffect(() => {
    if (!overlayRef.current || !mapReady) return;

    // --- Resolve shipment routes ---
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

    // --- Port markers layer ---
    // Collect unique ports that appear in shipments
    const usedPortIds = new Set<string>();
    for (const s of shipments) {
      const op = resolvePort(s.origin_port);
      const dp = resolvePort(s.destination_port);
      if (op) usedPortIds.add(op.id);
      if (dp) usedPortIds.add(dp.id);
    }
    const usedPorts = PORTS.filter((p) => usedPortIds.has(p.id));

    const portLayer = new ScatterplotLayer({
      id: "port-markers",
      data: usedPorts,
      getPosition: (d: Port) => [d.lon, d.lat],
      getRadius: 6000,
      radiusMinPixels: 5,
      radiusMaxPixels: 12,
      getFillColor: darkMode ? [255, 255, 255, 200] : [30, 41, 59, 200],
      getLineColor: [19, 127, 236, 255],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: true,
    });

    const portLabelLayer = new TextLayer({
      id: "port-labels",
      data: usedPorts,
      getPosition: (d: Port) => [d.lon, d.lat],
      getText: (d: Port) => d.city,
      getSize: 12,
      getColor: darkMode ? [200, 200, 200, 255] : [30, 41, 59, 255],
      getAngle: 0,
      getTextAnchor: "start" as const,
      getAlignmentBaseline: "center" as const,
      getPixelOffset: [12, 0],
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: darkMode ? [13, 17, 23, 200] : [255, 255, 255, 200],
      billboard: false,
      sizeMinPixels: 10,
      sizeMaxPixels: 14,
    });

    // --- Route arc layers ---
    const arcLayer = new ArcLayer({
      id: "route-arcs",
      data: routes,
      getSourcePosition: (d) => d.origin,
      getTargetPosition: (d) => d.destination,
      getSourceColor: (d) => {
        const isSelected = selectedShipment?.id === d.shipment.id;
        const color = STATUS_COLORS[d.shipment.status] || [100, 116, 139];
        return [...color, isSelected ? 255 : 100] as [number, number, number, number];
      },
      getTargetColor: (d) => {
        const isSelected = selectedShipment?.id === d.shipment.id;
        const color = STATUS_COLORS[d.shipment.status] || [100, 116, 139];
        return [...color, isSelected ? 255 : 100] as [number, number, number, number];
      },
      getWidth: (d) => (selectedShipment?.id === d.shipment.id ? 4 : 2),
      widthMinPixels: 1,
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

    // --- Vessel position layer (active shipments only) ---
    const vessels: {
      shipment: ShipmentWithForwarder;
      position: [number, number];
    }[] = [];

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
        return isSelected ? [19, 127, 236, 255] : [19, 127, 236, 180];
      },
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 2,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: true,
      onClick: ({ object }) => {
        if (object) onSelectShipment(object.shipment);
      },
      updateTriggers: {
        getFillColor: [selectedShipment?.id],
      },
    });

    // Vessel pulse ring for selected
    const selectedVessel = vessels.find((v) => v.shipment.id === selectedShipment?.id);
    const pulseLayer = new ScatterplotLayer({
      id: "vessel-pulse",
      data: selectedVessel ? [selectedVessel] : [],
      getPosition: (d) => d.position,
      getRadius: 18000,
      radiusMinPixels: 18,
      radiusMaxPixels: 30,
      getFillColor: [19, 127, 236, 40],
      getLineColor: [19, 127, 236, 100],
      getLineWidth: 1,
      lineWidthMinPixels: 1,
      stroked: true,
      filled: true,
    });

    // Vessel name labels
    const vesselLabelLayer = new TextLayer({
      id: "vessel-labels",
      data: vessels,
      getPosition: (d) => d.position,
      getText: (d) =>
        d.shipment.vessel_name ||
        d.shipment.booking_reference ||
        d.shipment.id.substring(0, 8).toUpperCase(),
      getSize: 11,
      getColor: darkMode ? [255, 255, 255, 220] : [19, 127, 236, 255],
      getAngle: 0,
      getTextAnchor: "start" as const,
      getAlignmentBaseline: "center" as const,
      getPixelOffset: [16, 0],
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: 700,
      outlineWidth: 2,
      outlineColor: darkMode ? [13, 17, 23, 220] : [255, 255, 255, 220],
      billboard: false,
      sizeMinPixels: 10,
      sizeMaxPixels: 13,
    });

    // --- Origin/destination highlights for selected shipment ---
    const selectedRoute = routes.find((r) => r.shipment.id === selectedShipment?.id);
    const endpointData = selectedRoute
      ? [
          { position: selectedRoute.origin, type: "origin" },
          { position: selectedRoute.destination, type: "destination" },
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
        d.type === "origin" ? [19, 127, 236, 200] : [16, 185, 129, 200],
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 3,
      lineWidthMinPixels: 2,
      stroked: true,
      filled: true,
    });

    overlayRef.current.setProps({
      layers: [
        arcLayer,
        portLayer,
        portLabelLayer,
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

    // Fly to midpoint of the route
    const midLon = (origin[0] + dest[0]) / 2;
    const midLat = (origin[1] + dest[1]) / 2;

    // Calculate zoom based on distance
    const lonDiff = Math.abs(origin[0] - dest[0]);
    const latDiff = Math.abs(origin[1] - dest[1]);
    const maxDiff = Math.max(lonDiff, latDiff);
    const zoom = maxDiff > 80 ? 2.5 : maxDiff > 40 ? 3.5 : maxDiff > 20 ? 4.5 : 5.5;

    mapRef.current.flyTo({
      center: [midLon, midLat],
      zoom,
      duration: 1200,
      essential: true,
    });
  }, [selectedShipment, mapReady]);

  return (
    <div ref={mapContainer} className="absolute inset-0" />
  );
}
