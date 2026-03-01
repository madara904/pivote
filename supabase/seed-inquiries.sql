-- =============================================================================
-- Seed: Test-Anfragen (Inquiries) für Shipper + 2 Forwarder
-- Shipper: 2396473f-8383-441c-8c9d-c1501ffd3eac
-- Forwarder 1: f1c85dc9-162e-4060-a89c-4f66a048b91a
-- Forwarder 2: 504a404d-812f-424e-bc1c-679254f164b2
--
-- Voraussetzung: Mindestens 1 User muss Mitglied der Shipper-Org sein
-- (organization_member mit organization_id = Shipper-Org)
-- =============================================================================

DO $$
DECLARE
  v_user_id text;
  v_inquiry_id text;
  v_ref_base text := 'INV-2025-';
  v_ref_num int := 1;
BEGIN
  -- User aus Shipper-Org holen (Erstes Mitglied)
  SELECT user_id INTO v_user_id
  FROM organization_member
  WHERE organization_id = '2396473f-8383-441c-8c9d-c1501ffd3eac'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kein User in Shipper-Org gefunden. Bitte zuerst User zur Org 2396473f-8383-441c-8c9d-c1501ffd3eac hinzufügen.';
  END IF;

  -- ===========================================================================
  -- 1. Anfrage: Luftfracht FRA → JFK (Draft)
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, cargo_description, incoterms, ready_date, delivery_date, validity_date,
    status, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Luftfracht Frankfurt – New York',
    'Dringende Lieferung Elektronikbauteile',
    'air_freight', 'export',
    'FRA', 'Frankfurt', 'Deutschland', 'JFK', 'New York', 'USA',
    'general', 'Elektronik, 5 Paletten', 'DAP',
    NOW() + interval '7 days', NOW() + interval '10 days', NOW() + interval '14 days',
    'draft', '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  INSERT INTO inquiry_package (id, inquiry_id, package_number, description, pieces, gross_weight, chargeable_weight, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'PKG-1', 'Palette 1', 5, 450.500, 500.000, NOW(), NOW());
  v_ref_num := v_ref_num + 1;

  -- ===========================================================================
  -- 2. Anfrage: Seefracht Hamburg → Shanghai (Open – an beide Forwarder gesendet)
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, cargo_description, incoterms, ready_date, delivery_date, validity_date,
    status, sent_at, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Seefracht Hamburg – Shanghai',
    'Maschinenteile, 2x40ft Container',
    'sea_freight', 'export',
    'HAM', 'Hamburg', 'Deutschland', 'PVG', 'Shanghai', 'China',
    'general', 'Stahlteile, nicht gefährlich', 'FOB',
    NOW() + interval '14 days', NOW() + interval '35 days', NOW() + interval '21 days',
    'open', NOW() - interval '2 days', '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'f1c85dc9-162e-4060-a89c-4f66a048b91a', 'pending', NOW(), NOW());
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, '504a404d-812f-424e-bc1c-679254f164b2', 'quoted', NOW(), NOW());
  INSERT INTO inquiry_package (id, inquiry_id, package_number, description, pieces, gross_weight, chargeable_weight, length, width, height, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'PKG-1', 'Container 1', 1, 12000.000, 15000.000, 1200.00, 230.00, 230.00, NOW(), NOW());
  v_ref_num := v_ref_num + 1;

  -- ===========================================================================
  -- 3. Anfrage: Luftfracht MUC → DXB (Open – nur Forwarder 1)
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, cargo_description, incoterms, ready_date, delivery_date, validity_date,
    status, sent_at, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Luftfracht München – Dubai',
    'Pharmazeutische Produkte, temperiert',
    'air_freight', 'export',
    'MUC', 'München', 'Deutschland', 'DXB', 'Dubai', 'VAE',
    'perishable', '2–8°C, pharmazeutisch', 'DDP',
    NOW() + interval '5 days', NOW() + interval '7 days', NOW() + interval '10 days',
    'open', NOW() - interval '1 day', '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'f1c85dc9-162e-4060-a89c-4f66a048b91a', 'pending', NOW(), NOW());
  INSERT INTO inquiry_package (id, inquiry_id, package_number, description, pieces, gross_weight, temperature, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'PKG-1', 'Kühlbox 1', 2, 85.250, '2-8°C', NOW(), NOW());
  v_ref_num := v_ref_num + 1;

  -- ===========================================================================
  -- 4. Anfrage: Straßenfracht Berlin → Paris (Awarded – abgeschlossen)
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, cargo_description, incoterms, ready_date, delivery_date, validity_date,
    status, sent_at, closed_at, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Straßenfracht Berlin – Paris',
    'Möbeltransport, 1 LKW',
    'road_freight', 'export',
    'BER', 'Berlin', 'Deutschland', 'CDG', 'Paris', 'Frankreich',
    'general', 'Möbel, zerlegbar', 'DAP',
    NOW() - interval '10 days', NOW() + interval '2 days', NOW() - interval '5 days',
    'awarded', NOW() - interval '12 days', NOW() - interval '3 days', '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'f1c85dc9-162e-4060-a89c-4f66a048b91a', 'quoted', NOW(), NOW());
  v_ref_num := v_ref_num + 1;

  -- ===========================================================================
  -- 5. Anfrage: Luftfracht ZRH → SIN (Open – an beide Forwarder)
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, cargo_description, incoterms, ready_date, delivery_date, validity_date,
    status, sent_at, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Luftfracht Zürich – Singapur',
    'Uhren und Schmuck, hochwertig',
    'air_freight', 'export',
    'ZRH', 'Zürich', 'Schweiz', 'SIN', 'Singapur', 'Singapur',
    'fragile', 'Wertvolle Uhren, Versicherung erforderlich', 'CIP',
    NOW() + interval '3 days', NOW() + interval '6 days', NOW() + interval '7 days',
    'open', NOW(), '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, 'f1c85dc9-162e-4060-a89c-4f66a048b91a', 'pending', NOW(), NOW());
  INSERT INTO inquiry_forwarder (id, inquiry_id, forwarder_organization_id, response_status, sent_at, created_at)
  VALUES (gen_random_uuid(), v_inquiry_id, '504a404d-812f-424e-bc1c-679254f164b2', 'pending', NOW(), NOW());
  v_ref_num := v_ref_num + 1;

  -- ===========================================================================
  -- 6. Anfrage: Storniert
  -- ===========================================================================
  v_inquiry_id := gen_random_uuid()::text;
  INSERT INTO inquiry (
    id, reference_number, title, description, service_type, service_direction,
    origin_airport, origin_city, origin_country, destination_airport, destination_city, destination_country,
    cargo_type, incoterms, ready_date, validity_date,
    status, shipper_organization_id, created_by_id, created_at, updated_at
  ) VALUES (
    v_inquiry_id, v_ref_base || lpad((v_ref_num)::text, 3, '0'),
    'Stornierte Test-Anfrage',
    'Wurde vom Kunden storniert',
    'air_freight', 'import',
    'LHR', 'London', 'UK', 'FRA', 'Frankfurt', 'Deutschland',
    'general', 'EXW', NOW() + interval '20 days', NOW() + interval '25 days',
    'cancelled', '2396473f-8383-441c-8c9d-c1501ffd3eac', v_user_id, NOW(), NOW()
  );
  v_ref_num := v_ref_num + 1;

  RAISE NOTICE 'Erfolgreich % Anfragen angelegt (INV-2025-001 bis INV-2025-006)', v_ref_num - 1;
END $$;
