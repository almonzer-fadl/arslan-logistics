-- ============================================
-- Verify updated_at Triggers on All Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check existing triggers
SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- Expected output should show triggers on:
-- - forwarders
-- - quotes
-- - shipments
-- - clients
-- - profiles

-- Step 2: Verify the update_updated_at() function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_updated_at';

-- Expected: 1 row showing the function exists

-- Step 3: Create missing triggers if any
-- (Based on schema, all should exist, but this ensures completeness)

DO $$
BEGIN
  -- Forwarders trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_forwarders_updated_at'
  ) THEN
    CREATE TRIGGER update_forwarders_updated_at 
      BEFORE UPDATE ON forwarders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger: update_forwarders_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_forwarders_updated_at already exists';
  END IF;

  -- Quotes trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_quotes_updated_at'
  ) THEN
    CREATE TRIGGER update_quotes_updated_at 
      BEFORE UPDATE ON quotes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger: update_quotes_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_quotes_updated_at already exists';
  END IF;

  -- Shipments trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_shipments_updated_at'
  ) THEN
    CREATE TRIGGER update_shipments_updated_at 
      BEFORE UPDATE ON shipments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger: update_shipments_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_shipments_updated_at already exists';
  END IF;

  -- Clients trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_clients_updated_at'
  ) THEN
    CREATE TRIGGER update_clients_updated_at 
      BEFORE UPDATE ON clients
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger: update_clients_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_clients_updated_at already exists';
  END IF;

  -- Profiles trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    RAISE NOTICE 'Created trigger: update_profiles_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_profiles_updated_at already exists';
  END IF;
END $$;

-- Step 4: Test triggers work correctly
-- Test on forwarders table (safe test, should have data)
DO $$
DECLARE
  test_id UUID;
  old_updated_at TIMESTAMPTZ;
  new_updated_at TIMESTAMPTZ;
BEGIN
  -- Get a random forwarder
  SELECT id INTO test_id FROM forwarders LIMIT 1;
  
  IF test_id IS NULL THEN
    RAISE NOTICE 'No forwarders found to test trigger';
    RETURN;
  END IF;

  -- Get current updated_at
  SELECT updated_at INTO old_updated_at FROM forwarders WHERE id = test_id;
  
  -- Wait a moment
  PERFORM pg_sleep(0.1);
  
  -- Update the record (no actual change, just trigger the update)
  UPDATE forwarders SET notes = COALESCE(notes, '') WHERE id = test_id;
  
  -- Get new updated_at
  SELECT updated_at INTO new_updated_at FROM forwarders WHERE id = test_id;
  
  -- Check if updated_at changed
  IF new_updated_at > old_updated_at THEN
    RAISE NOTICE 'Trigger test PASSED: updated_at was automatically updated';
  ELSE
    RAISE WARNING 'Trigger test FAILED: updated_at did not change';
  END IF;
END $$;

-- Step 5: Comprehensive trigger status report
SELECT 
  t.table_name,
  CASE 
    WHEN tr.trigger_name IS NOT NULL THEN '✅ Present'
    ELSE '❌ Missing'
  END as trigger_status
FROM (
  SELECT 'forwarders' as table_name, 'update_forwarders_updated_at' as expected_trigger
  UNION ALL
  SELECT 'quotes', 'update_quotes_updated_at'
  UNION ALL
  SELECT 'shipments', 'update_shipments_updated_at'
  UNION ALL
  SELECT 'clients', 'update_clients_updated_at'
  UNION ALL
  SELECT 'profiles', 'update_profiles_updated_at'
) t
LEFT JOIN information_schema.triggers tr 
  ON tr.event_object_table = t.table_name 
  AND tr.trigger_name = t.expected_trigger
ORDER BY t.table_name;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- All tables should show "✅ Present" for their triggers
-- If any show "❌ Missing", the DO block above created them
