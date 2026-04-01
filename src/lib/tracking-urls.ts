// Free carrier tracking URLs + MarineTraffic vessel lookup

const CARRIER_TRACKING: Record<string, (ref: string) => string> = {
  maersk: (ref) => `https://www.maersk.com/tracking/${encodeURIComponent(ref)}`,
  msc: (ref) => `https://www.msc.com/en/track-a-shipment?agencyPath=msc&trackingNumber=${encodeURIComponent(ref)}`,
  "cma cgm": (ref) => `https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=ContainerNumber&Reference=${encodeURIComponent(ref)}`,
  "hapag-lloyd": (ref) => `https://www.hapag-lloyd.com/en/online-business/track/track-by-booking-solution.html?blno=${encodeURIComponent(ref)}`,
  cosco: (ref) => `https://elines.coscoshipping.com/ebtracking/public/containers/${encodeURIComponent(ref)}`,
  evergreen: (ref) => `https://ct.shipmentlink.com/servlet/TDB1_PageFlow.do?BookingNo=${encodeURIComponent(ref)}`,
  one: (ref) => `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${encodeURIComponent(ref)}`,
  "yang ming": (ref) => `https://www.yangming.com/e-service/Track_Trace/track_trace_cargo_tracking.aspx?rdolType=BL&str=${encodeURIComponent(ref)}`,
  zim: (ref) => `https://www.zim.com/tools/track-a-shipment?consnumber=${encodeURIComponent(ref)}`,
  "db schenker": (ref) => `https://eschenker.dbschenker.com/app/tracking?refNumber=${encodeURIComponent(ref)}`,
  "kuehne+nagel": (ref) => `https://onlineservices.kuehne-nagel.com/public-tracking/shipments?query=${encodeURIComponent(ref)}`,
};

export function getCarrierTrackingUrl(carrierName: string, bookingRef: string): string | null {
  const lower = carrierName.toLowerCase();
  for (const [key, fn] of Object.entries(CARRIER_TRACKING)) {
    if (lower.includes(key)) return fn(bookingRef);
  }
  return null;
}

export function getVesselTrackingUrl(vesselName: string): string {
  const slug = vesselName.trim().replace(/\s+/g, "-").toUpperCase();
  return `https://www.marinetraffic.com/en/ais/details/ships/shipname:${encodeURIComponent(slug)}`;
}

export function getVesselSearchUrl(vesselName: string): string {
  return `https://www.marinetraffic.com/en/ais/index/search/all/keyword:${encodeURIComponent(vesselName.trim())}`;
}
