-- Seed data for local/dev and for reviewer sign-in (Section 15.3).
-- All seed accounts share the password: Password123!

INSERT INTO customers (name, contact_email) VALUES
    ('Meridian Facilities Management', 'ops@meridianfm.example'),
    ('Harborview Logistics', 'facilities@harborview.example');

INSERT INTO sites (customer_id, name, address) VALUES
    (1, 'Meridian HQ Tower', '100 Meridian Plaza, Springfield'),
    (1, 'Meridian Distribution Center', '45 Industrial Way, Springfield'),
    (2, 'Harborview Warehouse 3', '9 Dockside Road, Harborview');

-- Dispatcher, Manager, Technicians are internal Zidio/Meridian staff (no customer_id).
-- The Customer-role user is tied to customer_id 1 (Meridian) so they only see their own jobs.
INSERT INTO users (name, email, password_hash, role, customer_id, active) VALUES
    ('Dana Dispatcher', 'dispatcher@keystone.dev',  '$2a$10$ZrBe9.6PBoRLQvngOJSzg.f/QepmTmyLr8bcwXcGREa7t88ZkZiI6', 'DISPATCHER', NULL, true),
    ('Mona Manager',    'manager@keystone.dev',     '$2a$10$ZrBe9.6PBoRLQvngOJSzg.f/QepmTmyLr8bcwXcGREa7t88ZkZiI6', 'MANAGER',    NULL, true),
    ('Tom Technician',  'tech1@keystone.dev',       '$2a$10$ZrBe9.6PBoRLQvngOJSzg.f/QepmTmyLr8bcwXcGREa7t88ZkZiI6', 'TECHNICIAN', NULL, true),
    ('Tara Technician', 'tech2@keystone.dev',       '$2a$10$ZrBe9.6PBoRLQvngOJSzg.f/QepmTmyLr8bcwXcGREa7t88ZkZiI6', 'TECHNICIAN', NULL, true),
    ('Cara Customer',   'customer@keystone.dev',    '$2a$10$ZrBe9.6PBoRLQvngOJSzg.f/QepmTmyLr8bcwXcGREa7t88ZkZiI6', 'CUSTOMER',   1,    true);

INSERT INTO parts (name, sku, unit_cost, stock_qty) VALUES
    ('HVAC Air Filter 20x25', 'HVAC-FLT-2025', 18.50, 40),
    ('Copper Pipe Fitting 1/2in', 'PLM-FIT-050', 4.25, 120),
    ('Circuit Breaker 20A', 'ELC-BRK-20A', 12.90, 30),
    ('Refrigerant R-410A (lb)', 'HVAC-REF-410A', 22.00, 60);

-- One example work order already in flight, so the board isn't empty on first login.
INSERT INTO work_orders (code, title, description, priority, status, customer_id, site_id, assigned_to, sla_due_at, sla_breached, created_at, updated_at)
VALUES (
    'WO-2026-000001',
    'AC unit not cooling - 3rd floor east wing',
    'Tenant reports the rooftop AC unit serving the 3rd floor east wing is running but not cooling.',
    'HIGH', 'ASSIGNED', 1, 1, 3, now() + interval '20 hours', false, now(), now()
);

INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by, changed_at, note) VALUES
    (1, NULL, 'NEW', 'dispatcher@keystone.dev', now() - interval '2 hours', 'Work order raised'),
    (1, 'NEW', 'ASSIGNED', 'dispatcher@keystone.dev', now() - interval '1 hour', 'Assigned to Tom Technician');
