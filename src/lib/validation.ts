export type FieldErrors = Record<string, string>;

export function validateEmail(email: string): string | null {
  if (!email) return null; // optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : "Invalid email format.";
}

export function validateUrl(url: string): string | null {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return "Invalid URL format.";
  }
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function validateMinLength(value: string, min: number, label: string): string | null {
  if (!value) return null;
  return value.length >= min ? null : `${label} must be at least ${min} characters.`;
}

export function validatePort(port: string, label: string): string | null {
  if (!port.trim()) return `${label} is required.`;
  if (port.trim().length < 2) return `${label} must be at least 2 characters.`;
  return null;
}

// Carrier form validation
export function validateCarrierForm(data: {
  name: string;
  website?: string;
  dashboard_url?: string;
  contact_form_url?: string;
  contact_email?: string;
  sales_rep_email?: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  const nameErr = validateRequired(data.name, "Carrier name");
  if (nameErr) errors.name = nameErr;

  if (data.website) {
    const err = validateUrl(data.website);
    if (err) errors.website = err;
  }
  if (data.dashboard_url) {
    const err = validateUrl(data.dashboard_url);
    if (err) errors.dashboard_url = err;
  }
  if (data.contact_form_url) {
    const err = validateUrl(data.contact_form_url);
    if (err) errors.contact_form_url = err;
  }
  if (data.contact_email) {
    const err = validateEmail(data.contact_email);
    if (err) errors.contact_email = err;
  }
  if (data.sales_rep_email) {
    const err = validateEmail(data.sales_rep_email);
    if (err) errors.sales_rep_email = err;
  }

  return errors;
}

// Shipment form validation
export function validateShipmentForm(data: {
  forwarder_id: string;
  origin_port: string;
  destination_port: string;
  cargo_description: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.forwarder_id) errors.forwarder_id = "Carrier is required.";

  const origin = validatePort(data.origin_port, "Origin port");
  if (origin) errors.origin_port = origin;

  const dest = validatePort(data.destination_port, "Destination port");
  if (dest) errors.destination_port = dest;

  if (!data.cargo_description.trim()) errors.cargo_description = "Cargo description is required.";

  return errors;
}

// Quote form validation
export function validateQuoteForm(data: {
  forwarder_id: string;
  origin_port: string;
  destination_port: string;
  cargo_description: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.forwarder_id) errors.forwarder_id = "Carrier is required.";

  const origin = validatePort(data.origin_port, "Origin port");
  if (origin) errors.origin_port = origin;

  const dest = validatePort(data.destination_port, "Destination port");
  if (dest) errors.destination_port = dest;

  if (!data.cargo_description.trim()) errors.cargo_description = "Cargo description is required.";

  return errors;
}
