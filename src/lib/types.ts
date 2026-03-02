export type ForwarderCategory = "global" | "regional" | "africa" | "roro";

export type ContactStatus = "active" | "pending" | "not_contacted" | "approved";

export interface Forwarder {
  id: string;
  name: string;
  website: string;
  category: ForwarderCategory;
  contact_email?: string;
  contact_phone?: string;
  contact_form_url?: string;
  sales_rep_name?: string;
  sales_rep_email?: string;
  dashboard_url?: string;
  encrypted_credentials?: string;
  coverage: string[];
  sudan_available: boolean;
  status: ContactStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  forwarder_id: string;
  forwarder_name?: string;
  origin_port: string;
  destination_port: string;
  container_type: string; // 20ft, 40ft, 40ft HC
  price_usd: number;
  transit_days: number;
  insurance_included: boolean;
  insurance_cost?: number;
  valid_until?: string;
  status: "pending" | "received" | "expired" | "accepted";
  notes?: string;
  created_at: string;
}

export interface Shipment {
  id: string;
  forwarder_id: string;
  forwarder_name?: string;
  quote_id?: string;
  booking_reference?: string;
  origin_port: string;
  destination_port: string;
  container_type: string;
  cargo_description: string;
  status: "booked" | "in_transit" | "arrived" | "delivered" | "cancelled";
  departure_date?: string;
  arrival_date?: string;
  tracking_url?: string;
  cost_usd: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  country: string;
  notes?: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  origin_country: string;
  origin_port: string;
  destination_country: string;
  destination_port: string;
  avg_transit_days?: number;
  avg_cost_usd?: number;
  active_forwarders: string[];
  notes?: string;
}

export type UserRole = "admin" | "manager" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}
