-- Migration: Create Ladipo Categories and Subcategories Tables
-- Date: 2026-04-08

-- Create main categories table
CREATE TABLE IF NOT EXISTS public.ladipo_main_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS public.ladipo_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id UUID NOT NULL REFERENCES public.ladipo_main_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(main_category_id, slug)
);

-- Create junction table for parts and subcategories
CREATE TABLE IF NOT EXISTS public.ladipo_parts_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES public.ladipo_parts(id) ON DELETE CASCADE,
  subcategory_id UUID NOT NULL REFERENCES public.ladipo_subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(part_id, subcategory_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_main_category ON public.ladipo_subcategories(main_category_id);
CREATE INDEX IF NOT EXISTS idx_parts_subcategories_part ON public.ladipo_parts_subcategories(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_subcategories_subcategory ON public.ladipo_parts_subcategories(subcategory_id);

-- Insert main categories (10 categories)
INSERT INTO public.ladipo_main_categories (name, slug, description, icon, "order") VALUES
('Engine & Powertrain', 'engine-powertrain', 'Engine components, fuel system, cooling, transmission and drivetrain parts', 'solar:engine-bold', 1),
('Suspension & Steering', 'suspension-steering', 'Suspension components, shock absorbers, steering parts and wheel bearings', 'game-icons:suspension', 2),
('Brakes', 'brakes', 'Brake pads, rotors, calipers, ABS and complete brake system components', 'solar:stop-circle-bold', 3),
('Exterior & Lighting', 'exterior-lighting', 'Headlights, taillights, mirrors, bumpers and body panels', 'solar:sun-bold', 4),
('Interior & Comfort', 'interior-comfort', 'Seats, carpets, dashboard, climate control and interior accessories', 'solar:home-bold', 5),
('Electrical & Battery', 'electrical-battery', 'Battery, alternator, starter, sensors and wiring components', 'solar:bolt-bold', 6),
('Maintenance & Fluids', 'maintenance-fluids', 'Oil, filters, coolant, spark plugs and lubrication products', 'solar:drop-bold', 7),
('Wheels & Tires', 'wheels-tires', 'Tires, wheels, rims and tire accessories', 'solar:wheel-bold', 8),
('Tools & Accessories', 'tools-accessories', 'Diagnostic tools, repair tools and cleaning products', 'solar:wrench-bold', 9),
('Performance & Customization', 'performance-customization', 'Performance upgrades, audio systems and body kits', 'solar:rocket-bold', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for each main category
-- 1. Engine & Powertrain (5 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Engine Components', 'engine-components', 'Pistons, rings, gaskets, cylinder heads, valve covers', 'ri:settings-3-line', 1
FROM public.ladipo_main_categories WHERE slug = 'engine-powertrain'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Fuel System', 'fuel-system', 'Fuel pumps, injectors, filters and regulators', 'mdi:fuel', 2
FROM public.ladipo_main_categories WHERE slug = 'engine-powertrain'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Cooling System', 'cooling-system', 'Radiators, water pumps, thermostats and hoses', 'ri:drop-line', 3
FROM public.ladipo_main_categories WHERE slug = 'engine-powertrain'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Ignition System', 'ignition-system', 'Spark plugs, ignition coils and distributors', 'solar:lightning-charge-bold', 4
FROM public.ladipo_main_categories WHERE slug = 'engine-powertrain'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Transmission', 'transmission', 'Transmission fluid, filters and mounts', 'game-icons:gears', 5
FROM public.ladipo_main_categories WHERE slug = 'engine-powertrain'
ON CONFLICT DO NOTHING;

-- 2. Suspension & Steering (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Shock Absorbers & Struts', 'shock-absorbers-struts', 'Front and rear shocks, struts and springs', 'ri:shock-lines', 1
FROM public.ladipo_main_categories WHERE slug = 'suspension-steering'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Control Arms & Joints', 'control-arms-joints', 'Upper and lower control arms, ball joints and bushings', 'game-icons:linkage', 2
FROM public.ladipo_main_categories WHERE slug = 'suspension-steering'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Steering Components', 'steering-components', 'Steering racks, tie rods and power steering pumps', 'solar:steering-wheel-bold', 3
FROM public.ladipo_main_categories WHERE slug = 'suspension-steering'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Wheel Bearing & Hubs', 'wheel-bearing-hubs', 'Wheel hubs, bearings and related assemblies', 'ri:circle-line', 4
FROM public.ladipo_main_categories WHERE slug = 'suspension-steering'
ON CONFLICT DO NOTHING;

-- 3. Brakes (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Brake Pads & Shoes', 'brake-pads-shoes', 'Front and rear brake pads and brake shoes', 'mdi:brake-fluid', 1
FROM public.ladipo_main_categories WHERE slug = 'brakes'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Brake Rotors & Drums', 'brake-rotors-drums', 'Brake discs, rotors and brake drums', 'ri:disc-line', 2
FROM public.ladipo_main_categories WHERE slug = 'brakes'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Calipers & Cylinders', 'calipers-cylinders', 'Brake calipers and wheel cylinders', 'ri:compass-3-line', 3
FROM public.ladipo_main_categories WHERE slug = 'brakes'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'ABS & Brake Fluid', 'abs-brake-fluid', 'ABS sensors, modules and brake fluid', 'solar:drop-bold', 4
FROM public.ladipo_main_categories WHERE slug = 'brakes'
ON CONFLICT DO NOTHING;

-- 4. Exterior & Lighting (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Headlights & Taillights', 'headlights-taillights', 'LED, HID and halogen headlights and tail lamps', 'solar:sun-bold', 1
FROM public.ladipo_main_categories WHERE slug = 'exterior-lighting'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Mirrors & Trims', 'mirrors-trims', 'Side mirrors, rearview mirrors and trim pieces', 'ri:corner-up-left-line', 2
FROM public.ladipo_main_categories WHERE slug = 'exterior-lighting'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Bumpers & Grilles', 'bumpers-grilles', 'Front and rear bumpers, grilles and protective parts', 'ri:line-height', 3
FROM public.ladipo_main_categories WHERE slug = 'exterior-lighting'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Body Panels', 'body-panels', 'Doors, fenders, hoods, trunks and side panels', 'ri:door-line', 4
FROM public.ladipo_main_categories WHERE slug = 'exterior-lighting'
ON CONFLICT DO NOTHING;

-- 5. Interior & Comfort (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Seats & Upholstery', 'seats-upholstery', 'Seat covers, seat heaters and upholstery kits', 'ri:armchair-2-line', 1
FROM public.ladipo_main_categories WHERE slug = 'interior-comfort'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Carpets & Floor Mats', 'carpets-floor-mats', 'Carpet sets, rubber mats and custom floor mats', 'ri:layout-grid-line', 2
FROM public.ladipo_main_categories WHERE slug = 'interior-comfort'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Dashboard & Controls', 'dashboard-controls', 'Instrument clusters, dashboard pads and controls', 'ri:layout-line', 3
FROM public.ladipo_main_categories WHERE slug = 'interior-comfort'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Climate Control', 'climate-control', 'AC compressors, condenser and heater cores', 'ri:thermostat-line', 4
FROM public.ladipo_main_categories WHERE slug = 'interior-comfort'
ON CONFLICT DO NOTHING;

-- 6. Electrical & Battery (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Battery & Terminals', 'battery-terminals', 'Car batteries, terminals and cables', 'solar:bolt-bold', 1
FROM public.ladipo_main_categories WHERE slug = 'electrical-battery'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Alternator & Starter', 'alternator-starter', 'Alternators, starters and regulators', 'ri:electric-car-2-line', 2
FROM public.ladipo_main_categories WHERE slug = 'electrical-battery'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Sensors & Modules', 'sensors-modules', 'Oxygen sensors, ABS sensors and ECU modules', 'ri:radio-button-line', 3
FROM public.ladipo_main_categories WHERE slug = 'electrical-battery'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Wiring & Connectors', 'wiring-connectors', 'Wiring harness, connectors and fuses', 'ri:plug-line', 4
FROM public.ladipo_main_categories WHERE slug = 'electrical-battery'
ON CONFLICT DO NOTHING;

-- 7. Maintenance & Fluids (5 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Oil & Filters', 'oil-filters', 'Motor oil, oil filters and oil change kits', 'ri:drop-line', 1
FROM public.ladipo_main_categories WHERE slug = 'maintenance-fluids'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Coolant & Brake Fluid', 'coolant-brake-fluid', 'Coolants and brake fluid', 'ri:water-flash-line', 2
FROM public.ladipo_main_categories WHERE slug = 'maintenance-fluids'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Spark Plugs & Belts', 'spark-plugs-belts', 'Spark plugs, serpentine belts and drive belts', 'ri:flash-line', 3
FROM public.ladipo_main_categories WHERE slug = 'maintenance-fluids'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Air Filters', 'air-filters', 'Engine air filters and cabin air filters', 'ri:wind-lines', 4
FROM public.ladipo_main_categories WHERE slug = 'maintenance-fluids'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Lubrication Products', 'lubrication-products', 'Greases, lubricants and maintenance sprays', 'ri:glow-line', 5
FROM public.ladipo_main_categories WHERE slug = 'maintenance-fluids'
ON CONFLICT DO NOTHING;

-- 8. Wheels & Tires (4 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Tires', 'tires', 'All-season, summer, winter and performance tires', 'ri:e-bike-2-line', 1
FROM public.ladipo_main_categories WHERE slug = 'wheels-tires'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Wheels & Rims', 'wheels-rims', 'Steel and alloy wheels in various sizes', 'solar:wheel-bold', 2
FROM public.ladipo_main_categories WHERE slug = 'wheels-tires'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Tire Accessories', 'tire-accessories', 'Tire pressure monitors and valve stems', 'ri:compass-line', 3
FROM public.ladipo_main_categories WHERE slug = 'wheels-tires'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Wheel Protection', 'wheel-protection', 'Wheel covers, lug nuts and rim protectors', 'ri:shield-line', 4
FROM public.ladipo_main_categories WHERE slug = 'wheels-tires'
ON CONFLICT DO NOTHING;

-- 9. Tools & Accessories (3 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Diagnostic Tools', 'diagnostic-tools', 'OBD scanners and diagnostic equipment', 'ri:computer-line', 1
FROM public.ladipo_main_categories WHERE slug = 'tools-accessories'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Repair Tools', 'repair-tools', 'Hand tools and repair tool sets', 'ri:tools-line', 2
FROM public.ladipo_main_categories WHERE slug = 'tools-accessories'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Cleaning & Detailing', 'cleaning-detailing', 'Car wash products and detailing supplies', 'ri:brush-line', 3
FROM public.ladipo_main_categories WHERE slug = 'tools-accessories'
ON CONFLICT DO NOTHING;

-- 10. Performance & Customization (3 subcategories)
INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Performance Upgrades', 'performance-upgrades', 'Exhaust systems and performance parts', 'ri:rocket-line', 1
FROM public.ladipo_main_categories WHERE slug = 'performance-customization'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Audio & Entertainment', 'audio-entertainment', 'Car audio systems and entertainment upgrades', 'ri:music-line', 2
FROM public.ladipo_main_categories WHERE slug = 'performance-customization'
ON CONFLICT DO NOTHING;

INSERT INTO public.ladipo_subcategories (main_category_id, name, slug, description, icon, "order") 
SELECT id, 'Body Kits & Styling', 'body-kits-styling', 'Body kits, spoilers and styling accessories', 'ri:palette-line', 3
FROM public.ladipo_main_categories WHERE slug = 'performance-customization'
ON CONFLICT DO NOTHING;
