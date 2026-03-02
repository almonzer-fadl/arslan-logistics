-- ============================================
-- Arslan Logistics Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable RLS
ALTER DATABASE postgres SET "app.settings.encryption_key" TO '';

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forwarders
CREATE TABLE forwarders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL CHECK (category IN ('global', 'regional', 'africa', 'roro')),
  contact_email TEXT,
  contact_phone TEXT,
  contact_form_url TEXT,
  sales_rep_name TEXT,
  sales_rep_email TEXT,
  dashboard_url TEXT,
  encrypted_credentials TEXT, -- AES-256 encrypted
  coverage TEXT[] DEFAULT '{}',
  sudan_available BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'not_contacted' CHECK (status IN ('active', 'pending', 'not_contacted', 'approved')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forwarders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view forwarders" ON forwarders
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Manager can insert forwarders" ON forwarders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admin/Manager can update forwarders" ON forwarders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admin can delete forwarders" ON forwarders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Credentials access: only admin can see encrypted_credentials
-- (handled in app layer — RLS allows SELECT but decryption requires admin role check)

-- Quotes
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forwarder_id UUID REFERENCES forwarders(id) ON DELETE CASCADE,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  container_type TEXT DEFAULT '40ft',
  price_usd NUMERIC(10,2),
  transit_days INTEGER,
  insurance_included BOOLEAN DEFAULT FALSE,
  insurance_cost NUMERIC(10,2),
  valid_until DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'expired', 'accepted')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quotes" ON quotes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Manager can manage quotes" ON quotes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Shipments
CREATE TABLE shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forwarder_id UUID REFERENCES forwarders(id),
  quote_id UUID REFERENCES quotes(id),
  booking_reference TEXT,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  container_type TEXT DEFAULT '40ft',
  cargo_description TEXT,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'in_transit', 'arrived', 'delivered', 'cancelled')),
  departure_date DATE,
  arrival_date DATE,
  tracking_url TEXT,
  cost_usd NUMERIC(10,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view shipments" ON shipments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Manager can manage shipments" ON shipments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  country TEXT DEFAULT 'Sudan',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Manager can manage clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Routes
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_port TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  avg_transit_days INTEGER,
  avg_cost_usd NUMERIC(10,2),
  active_forwarders UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routes" ON routes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage routes" ON routes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forwarders_updated_at BEFORE UPDATE ON forwarders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
