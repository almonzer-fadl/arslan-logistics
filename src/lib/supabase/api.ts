import { createClient } from "./client";
import type { Forwarder, Quote, Shipment, Client, Route, UserProfile } from "../types";

function getSupabase() {
  return createClient();
}

// ---- Forwarders ----
export async function getForwarders() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("forwarders")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Forwarder[];
}

export async function getForwarder(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("forwarders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Forwarder;
}

export async function upsertForwarder(forwarder: Partial<Forwarder>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("forwarders")
    .upsert(forwarder)
    .select()
    .single();
  if (error) throw error;
  return data as Forwarder;
}

export async function updateForwarder(id: string, updates: Partial<Forwarder>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("forwarders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Forwarder;
}

export async function deleteForwarder(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("forwarders").delete().eq("id", id);
  if (error) throw error;
}

// ---- Quotes ----
export async function getQuotes(forwarderId?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("quotes")
    .select("*, forwarders(name)")
    .order("created_at", { ascending: false });

  if (forwarderId) query = query.eq("forwarder_id", forwarderId);

  const { data, error } = await query;
  if (error) throw error;
  return data as (Quote & { forwarders: { name: string } })[];
}

export async function upsertQuote(quote: Partial<Quote>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .upsert(quote)
    .select()
    .single();
  if (error) throw error;
  return data as Quote;
}

export async function deleteQuote(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}

// ---- Shipments ----
export async function getShipments() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shipments")
    .select("*, forwarders(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Shipment & { forwarders: { name: string } })[];
}

export async function upsertShipment(shipment: Partial<Shipment>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("shipments")
    .upsert(shipment)
    .select()
    .single();
  if (error) throw error;
  return data as Shipment;
}

// ---- Clients ----
export async function getClients() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Client[];
}

export async function upsertClient(client: Partial<Client>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .upsert(client)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function deleteClient(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

// ---- Routes ----
export async function getRoutes() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Route[];
}

// ---- Profile ----
export async function getProfile() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

// ---- Auth ----
export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
