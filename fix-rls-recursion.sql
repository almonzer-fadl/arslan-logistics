-- ============================================
-- FIX: RLS infinite recursion on profiles table
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create a SECURITY DEFINER function to get role without RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Drop the problematic policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Step 3: Recreate profiles policies using the function (no recursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (public.get_my_role() = 'admin');

-- Step 4: Drop and recreate forwarders policies using the function
DROP POLICY IF EXISTS "Admin/Manager can insert forwarders" ON forwarders;
DROP POLICY IF EXISTS "Admin/Manager can update forwarders" ON forwarders;
DROP POLICY IF EXISTS "Admin can delete forwarders" ON forwarders;

CREATE POLICY "Admin/Manager can insert forwarders" ON forwarders
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can update forwarders" ON forwarders
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin can delete forwarders" ON forwarders
  FOR DELETE USING (public.get_my_role() = 'admin');

-- Step 5: Fix quotes policies
DROP POLICY IF EXISTS "Admin/Manager can manage quotes" ON quotes;

CREATE POLICY "Admin/Manager can insert quotes" ON quotes
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can update quotes" ON quotes
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can delete quotes" ON quotes
  FOR DELETE USING (public.get_my_role() IN ('admin', 'manager'));

-- Step 6: Fix shipments policies
DROP POLICY IF EXISTS "Admin/Manager can manage shipments" ON shipments;

CREATE POLICY "Admin/Manager can insert shipments" ON shipments
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can update shipments" ON shipments
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can delete shipments" ON shipments
  FOR DELETE USING (public.get_my_role() IN ('admin', 'manager'));

-- Step 7: Fix clients policies
DROP POLICY IF EXISTS "Admin/Manager can manage clients" ON clients;

CREATE POLICY "Admin/Manager can insert clients" ON clients
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can update clients" ON clients
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'manager'));

CREATE POLICY "Admin/Manager can delete clients" ON clients
  FOR DELETE USING (public.get_my_role() IN ('admin', 'manager'));

-- Step 8: Fix routes policies
DROP POLICY IF EXISTS "Admin can manage routes" ON routes;

CREATE POLICY "Admin can insert routes" ON routes
  FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admin can update routes" ON routes
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "Admin can delete routes" ON routes
  FOR DELETE USING (public.get_my_role() = 'admin');

-- Step 9: Make your test user an admin
UPDATE profiles SET role = 'admin' WHERE email = 'tester@gmail.com';
