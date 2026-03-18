-- ============================================
-- RLS Full Test Suite
-- Test all CRUD operations for admin, manager, viewer roles
-- Run this in Supabase SQL Editor
-- ============================================

-- Prerequisites: Ensure you have users with each role:
-- - admin user
-- - manager user  
-- - viewer user

-- Test helper: Create test users if they don't exist
-- NOTE: Run this section manually first to create users via Supabase Dashboard
-- Then update their roles:

-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@test.com';
-- UPDATE profiles SET role = 'manager' WHERE email = 'manager@test.com';
-- UPDATE profiles SET role = 'viewer' WHERE email = 'viewer@test.com';

-- ============================================
-- TEST 1: Verify get_my_role() function works
-- ============================================
SELECT public.get_my_role() as my_role;
-- Expected: Returns your current user's role

-- ============================================
-- TEST 2: Profiles Table
-- ============================================

-- All users should see their own profile
SELECT * FROM profiles WHERE id = auth.uid();
-- Expected: SUCCESS for all roles

-- Only admins should see all profiles
SELECT * FROM profiles;
-- Expected: SUCCESS for admin, FAIL for manager/viewer (only see own)

-- Only admins should update profiles
UPDATE profiles SET full_name = 'Test Update' WHERE id = auth.uid();
-- Expected: SUCCESS for admin, FAIL for manager/viewer

-- Rollback test update
UPDATE profiles SET full_name = 'Original Name' WHERE id = auth.uid();

-- ============================================
-- TEST 3: Forwarders Table
-- ============================================

-- All authenticated users can view
SELECT * FROM forwarders LIMIT 1;
-- Expected: SUCCESS for all roles

-- Admin/Manager can insert
INSERT INTO forwarders (name, category, website) 
VALUES ('Test Forwarder RLS', 'regional', 'https://test.com')
RETURNING id;
-- Expected: SUCCESS for admin/manager, FAIL for viewer
-- Save the returned ID for cleanup

-- Admin/Manager can update
UPDATE forwarders SET notes = 'RLS test update' 
WHERE name = 'Test Forwarder RLS';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Only admin can delete
DELETE FROM forwarders WHERE name = 'Test Forwarder RLS';
-- Expected: SUCCESS for admin, FAIL for manager/viewer

-- ============================================
-- TEST 4: Quotes Table
-- ============================================

-- All authenticated users can view
SELECT * FROM quotes LIMIT 1;
-- Expected: SUCCESS for all roles

-- Admin/Manager can insert
INSERT INTO quotes (origin_port, destination_port, status)
VALUES ('Test Port A', 'Test Port B', 'pending')
RETURNING id;
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can update
UPDATE quotes SET status = 'received' 
WHERE origin_port = 'Test Port A';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can delete
DELETE FROM quotes WHERE origin_port = 'Test Port A';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- ============================================
-- TEST 5: Shipments Table
-- ============================================

-- All authenticated users can view
SELECT * FROM shipments LIMIT 1;
-- Expected: SUCCESS for all roles

-- Admin/Manager can insert
INSERT INTO shipments (origin_port, destination_port, cargo_description, status)
VALUES ('Istanbul', 'Port Sudan', 'Test Cargo', 'booked')
RETURNING id;
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can update
UPDATE shipments SET status = 'in_transit' 
WHERE cargo_description = 'Test Cargo';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can delete
DELETE FROM shipments WHERE cargo_description = 'Test Cargo';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- ============================================
-- TEST 6: Clients Table
-- ============================================

-- All authenticated users can view
SELECT * FROM clients LIMIT 1;
-- Expected: SUCCESS for all roles

-- Admin/Manager can insert
INSERT INTO clients (name, phone, country)
VALUES ('Test Client RLS', '+1234567890', 'Sudan')
RETURNING id;
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can update
UPDATE clients SET notes = 'RLS test' 
WHERE name = 'Test Client RLS';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- Admin/Manager can delete
DELETE FROM clients WHERE name = 'Test Client RLS';
-- Expected: SUCCESS for admin/manager, FAIL for viewer

-- ============================================
-- TEST 7: Routes Table
-- ============================================

-- All authenticated users can view
SELECT * FROM routes LIMIT 1;
-- Expected: SUCCESS for all roles

-- Only admin can insert
INSERT INTO routes (name, origin_country, origin_port, destination_country, destination_port)
VALUES ('Test Route', 'Turkey', 'Istanbul', 'Sudan', 'Port Sudan')
RETURNING id;
-- Expected: SUCCESS for admin, FAIL for manager/viewer

-- Only admin can update
UPDATE routes SET avg_transit_days = 30 
WHERE name = 'Test Route';
-- Expected: SUCCESS for admin, FAIL for manager/viewer

-- Only admin can delete
DELETE FROM routes WHERE name = 'Test Route';
-- Expected: SUCCESS for admin, FAIL for manager/viewer

-- ============================================
-- CLEANUP
-- ============================================

-- Clean up any test data that slipped through
DELETE FROM forwarders WHERE name LIKE '%Test%RLS%';
DELETE FROM quotes WHERE origin_port LIKE '%Test%';
DELETE FROM shipments WHERE cargo_description LIKE '%Test%';
DELETE FROM clients WHERE name LIKE '%Test%RLS%';
DELETE FROM routes WHERE name LIKE '%Test%';

-- ============================================
-- VERIFICATION: Check RLS policies are active
-- ============================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Should see all policies using get_my_role()
-- No policies should reference profiles table directly (would cause recursion)

-- ============================================
-- FINAL CHECK: Verify get_my_role() doesn't cause recursion
-- ============================================

-- This should complete instantly without timeout:
SELECT public.get_my_role();
-- Expected: Returns role in <100ms

-- ============================================
-- RLS TEST SUMMARY
-- ============================================
-- ✅ ADMIN role should:
--    - View all tables
--    - Insert/Update/Delete forwarders, quotes, shipments, clients
--    - Insert/Update/Delete routes
--    - View and update all profiles
--
-- ✅ MANAGER role should:
--    - View all tables
--    - Insert/Update/Delete forwarders, quotes, shipments, clients
--    - CANNOT modify routes
--    - CANNOT update other profiles
--
-- ✅ VIEWER role should:
--    - View all tables
--    - CANNOT insert/update/delete anything
--    - Can only view own profile
