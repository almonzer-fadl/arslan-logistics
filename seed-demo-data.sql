-- ============================================
-- Arslan Logistics - Demo Data Seed
-- For presentation to the owner's dad
-- DO NOT run against production without review
-- ============================================

-- This script assumes:
-- 1. Schema is already set up (supabase-schema.sql applied)
-- 2. Carriers already exist in forwarders table
-- 3. You have at least one admin user in profiles

-- Get the first admin user's ID for created_by fields
DO $$
DECLARE
  admin_user_id UUID;
  maersk_id UUID;
  hapag_id UUID;
  schenker_id UUID;
  kuehne_id UUID;
  msc_id UUID;
  cma_id UUID;
  quote1_id UUID;
  quote2_id UUID;
  quote3_id UUID;
  quote4_id UUID;
  quote5_id UUID;
BEGIN
  -- Get an admin user (first one found)
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE role = 'admin' 
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Create an admin user first.';
  END IF;

  -- Get existing carrier IDs
  SELECT id INTO maersk_id FROM forwarders WHERE name ILIKE '%maersk%' LIMIT 1;
  SELECT id INTO hapag_id FROM forwarders WHERE name ILIKE '%hapag%' LIMIT 1;
  SELECT id INTO schenker_id FROM forwarders WHERE name ILIKE '%schenker%' LIMIT 1;
  SELECT id INTO kuehne_id FROM forwarders WHERE name ILIKE '%kuehne%' OR name ILIKE '%k+n%' LIMIT 1;
  SELECT id INTO msc_id FROM forwarders WHERE name ILIKE '%msc%' LIMIT 1;
  SELECT id INTO cma_id FROM forwarders WHERE name ILIKE '%cma%' LIMIT 1;

  RAISE NOTICE 'Using admin user: %', admin_user_id;
  RAISE NOTICE 'Found carriers: Maersk=%, Hapag=%, Schenker=%, Kuehne=%, MSC=%, CMA=%', 
    maersk_id, hapag_id, schenker_id, kuehne_id, msc_id, cma_id;

  -- ============================================
  -- Insert 5 Sample Quotes
  -- ============================================
  
  -- Quote 1: Pending quote from Maersk (Istanbul → Port Sudan)
  INSERT INTO quotes (
    forwarder_id, 
    origin_port, 
    destination_port, 
    container_type, 
    price_usd, 
    transit_days,
    insurance_included,
    insurance_cost,
    valid_until, 
    status, 
    notes,
    created_by,
    created_at
  ) VALUES (
    maersk_id,
    'Istanbul, Turkey',
    'Port Sudan, Sudan',
    '40ft HC',
    4500.00,
    18,
    true,
    250.00,
    CURRENT_DATE + INTERVAL '30 days',
    'pending',
    'Requested quote for automotive parts shipment',
    admin_user_id,
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO quote1_id;

  -- Quote 2: Received quote from Hapag-Lloyd (Shanghai → Jeddah)
  INSERT INTO quotes (
    forwarder_id,
    origin_port,
    destination_port,
    container_type,
    price_usd,
    transit_days,
    insurance_included,
    insurance_cost,
    valid_until,
    status,
    notes,
    created_by,
    created_at
  ) VALUES (
    hapag_id,
    'Shanghai, China',
    'Jeddah, Saudi Arabia',
    '20ft',
    2800.00,
    22,
    false,
    NULL,
    CURRENT_DATE + INTERVAL '14 days',
    'received',
    'Electronics shipment - price received from sales rep',
    admin_user_id,
    NOW() - INTERVAL '5 days'
  ) RETURNING id INTO quote2_id;

  -- Quote 3: Accepted quote from DB Schenker (Rotterdam → Istanbul)
  INSERT INTO quotes (
    forwarder_id,
    origin_port,
    destination_port,
    container_type,
    price_usd,
    transit_days,
    insurance_included,
    insurance_cost,
    valid_until,
    status,
    notes,
    created_by,
    created_at
  ) VALUES (
    schenker_id,
    'Rotterdam, Netherlands',
    'Istanbul, Turkey',
    '40ft',
    3200.00,
    12,
    true,
    180.00,
    CURRENT_DATE + INTERVAL '20 days',
    'accepted',
    'Construction materials - booking confirmed',
    admin_user_id,
    NOW() - INTERVAL '10 days'
  ) RETURNING id INTO quote3_id;

  -- Quote 4: Expired quote from Kuehne+Nagel (Jeddah → Port Sudan)
  INSERT INTO quotes (
    forwarder_id,
    origin_port,
    destination_port,
    container_type,
    price_usd,
    transit_days,
    insurance_included,
    insurance_cost,
    valid_until,
    status,
    notes,
    created_by,
    created_at
  ) VALUES (
    kuehne_id,
    'Jeddah, Saudi Arabia',
    'Port Sudan, Sudan',
    '20ft',
    1950.00,
    8,
    false,
    NULL,
    CURRENT_DATE - INTERVAL '5 days',
    'expired',
    'Food products - quote expired, need to request new pricing',
    admin_user_id,
    NOW() - INTERVAL '40 days'
  ) RETURNING id INTO quote4_id;

  -- Quote 5: Pending quote from MSC (Istanbul → Shanghai)
  INSERT INTO quotes (
    forwarder_id,
    origin_port,
    destination_port,
    container_type,
    price_usd,
    transit_days,
    insurance_included,
    insurance_cost,
    valid_until,
    status,
    notes,
    created_by,
    created_at
  ) VALUES (
    msc_id,
    'Istanbul, Turkey',
    'Shanghai, China',
    '40ft HC',
    5200.00,
    28,
    true,
    320.00,
    CURRENT_DATE + INTERVAL '25 days',
    'pending',
    'Textile exports - awaiting final confirmation',
    admin_user_id,
    NOW() - INTERVAL '2 days'
  ) RETURNING id INTO quote5_id;

  RAISE NOTICE 'Created 5 sample quotes';

  -- ============================================
  -- Insert 5 Sample Shipments
  -- ============================================

  -- Shipment 1: Delivered (Rotterdam → Istanbul) - Using accepted quote
  INSERT INTO shipments (
    forwarder_id,
    quote_id,
    booking_reference,
    origin_port,
    destination_port,
    container_type,
    cargo_description,
    status,
    departure_date,
    arrival_date,
    tracking_url,
    cost_usd,
    notes,
    created_by,
    created_at
  ) VALUES (
    schenker_id,
    quote3_id,
    'DBSC-2026-002847',
    'Rotterdam, Netherlands',
    'Istanbul, Turkey',
    '40ft',
    'Construction materials - steel beams and cement',
    'delivered',
    CURRENT_DATE - INTERVAL '25 days',
    CURRENT_DATE - INTERVAL '13 days',
    'https://tracking.dbschenker.com/002847',
    3200.00,
    'Delivered successfully, all customs cleared',
    admin_user_id,
    NOW() - INTERVAL '25 days'
  );

  -- Shipment 2: On Vessel (Istanbul → Port Sudan)
  INSERT INTO shipments (
    forwarder_id,
    quote_id,
    booking_reference,
    origin_port,
    destination_port,
    container_type,
    cargo_description,
    status,
    departure_date,
    arrival_date,
    tracking_url,
    cost_usd,
    notes,
    created_by,
    created_at
  ) VALUES (
    maersk_id,
    NULL,
    'MAEU-458932017',
    'Istanbul, Turkey',
    'Port Sudan, Sudan',
    '40ft HC',
    'Automotive parts and accessories',
    'in_transit',
    CURRENT_DATE - INTERVAL '8 days',
    CURRENT_DATE + INTERVAL '10 days',
    'https://www.maersk.com/tracking/458932017',
    4500.00,
    'Currently in transit through Suez Canal',
    admin_user_id,
    NOW() - INTERVAL '12 days'
  );

  -- Shipment 3: Booked (Shanghai → Jeddah)
  INSERT INTO shipments (
    forwarder_id,
    quote_id,
    booking_reference,
    origin_port,
    destination_port,
    container_type,
    cargo_description,
    status,
    departure_date,
    arrival_date,
    tracking_url,
    cost_usd,
    notes,
    created_by,
    created_at
  ) VALUES (
    hapag_id,
    quote2_id,
    'HLCU-329845102',
    'Shanghai, China',
    'Jeddah, Saudi Arabia',
    '20ft',
    'Consumer electronics - smartphones and tablets',
    'booked',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '27 days',
    NULL,
    2800.00,
    'Awaiting container loading at Shanghai port',
    admin_user_id,
    NOW() - INTERVAL '2 days'
  );

  -- Shipment 4: In Transit (Jeddah → Istanbul)
  INSERT INTO shipments (
    forwarder_id,
    quote_id,
    booking_reference,
    origin_port,
    destination_port,
    container_type,
    cargo_description,
    status,
    departure_date,
    arrival_date,
    tracking_url,
    cost_usd,
    notes,
    created_by,
    created_at
  ) VALUES (
    cma_id,
    NULL,
    'CMAU-785439201',
    'Jeddah, Saudi Arabia',
    'Istanbul, Turkey',
    '40ft',
    'Medical equipment and supplies',
    'in_transit',
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE + INTERVAL '4 days',
    'https://www.cma-cgm.com/ebusiness/tracking/785439201',
    3850.00,
    'ETA Istanbul: 4 days. Priority customs clearance arranged.',
    admin_user_id,
    NOW() - INTERVAL '8 days'
  );

  -- Shipment 5: Cancelled (Istanbul → Shanghai)
  INSERT INTO shipments (
    forwarder_id,
    quote_id,
    booking_reference,
    origin_port,
    destination_port,
    container_type,
    cargo_description,
    status,
    departure_date,
    arrival_date,
    tracking_url,
    cost_usd,
    notes,
    created_by,
    created_at
  ) VALUES (
    msc_id,
    quote5_id,
    'MSCU-192847563',
    'Istanbul, Turkey',
    'Shanghai, China',
    '40ft HC',
    'Textile products - cotton fabrics',
    'cancelled',
    CURRENT_DATE + INTERVAL '15 days',
    NULL,
    NULL,
    5200.00,
    'Cancelled by customer - export license issue. Refund processed.',
    admin_user_id,
    NOW() - INTERVAL '1 day'
  );

  RAISE NOTICE 'Created 5 sample shipments';

  -- ============================================
  -- Optional: Insert sample clients
  -- ============================================
  
  INSERT INTO clients (name, phone, whatsapp, email, city, country, notes, created_by, created_at)
  VALUES 
    (
      'Ahmed Trading Co.',
      '+249912345678',
      '+249912345678',
      'ahmed@tradingco.sd',
      'Khartoum',
      'Sudan',
      'Regular client - automotive parts importer',
      admin_user_id,
      NOW() - INTERVAL '60 days'
    ),
    (
      'Mediterranean Imports Ltd.',
      '+905321234567',
      '+905321234567',
      'info@medimports.com.tr',
      'Istanbul',
      'Turkey',
      'Construction materials - reliable payment history',
      admin_user_id,
      NOW() - INTERVAL '45 days'
    ),
    (
      'Red Sea Logistics',
      '+966501234567',
      '+966501234567',
      'operations@redsealog.sa',
      'Jeddah',
      'Saudi Arabia',
      'Regional distributor - electronics and medical equipment',
      admin_user_id,
      NOW() - INTERVAL '30 days'
    );

  RAISE NOTICE 'Created 3 sample clients';
  
  RAISE NOTICE '✅ Demo data seed complete!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 5 quotes (pending, received, accepted, expired statuses)';
  RAISE NOTICE '  - 5 shipments (booked, in_transit, delivered, cancelled statuses)';
  RAISE NOTICE '  - 3 clients';
  RAISE NOTICE 'Routes: Istanbul ↔ Port Sudan, Shanghai → Jeddah, Rotterdam → Istanbul';

END $$;
