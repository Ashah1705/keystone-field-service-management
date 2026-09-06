-- Project KEYSTONE - initial schema
-- Section 05 Domain Model / Appendix A

CREATE TABLE customers (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sites (
    id          BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(500) NOT NULL
);
CREATE INDEX idx_sites_customer ON sites(customer_id);

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('DISPATCHER','TECHNICIAN','MANAGER','CUSTOMER')),
    customer_id   BIGINT REFERENCES customers(id),
    active        BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE parts (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    sku        VARCHAR(64)  NOT NULL UNIQUE,
    unit_cost  NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
    stock_qty  INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    version    BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE work_orders (
    id            BIGSERIAL PRIMARY KEY,
    code          VARCHAR(32) NOT NULL UNIQUE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    priority      VARCHAR(10) NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    status        VARCHAR(20) NOT NULL CHECK (status IN
                    ('NEW','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED','CANCELLED')),
    customer_id   BIGINT NOT NULL REFERENCES customers(id),
    site_id       BIGINT NOT NULL REFERENCES sites(id),
    assigned_to   BIGINT REFERENCES users(id),
    sla_due_at    TIMESTAMPTZ,
    sla_breached  BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_customer ON work_orders(customer_id);
CREATE INDEX idx_wo_assigned ON work_orders(assigned_to);
CREATE INDEX idx_wo_sla_due ON work_orders(sla_due_at);

-- Append-only audit trail: no updated_at column, no update path in the app.
CREATE TABLE work_order_status_history (
    id            BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    from_status   VARCHAR(20),
    to_status     VARCHAR(20) NOT NULL,
    changed_by    VARCHAR(255) NOT NULL,
    changed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    note          VARCHAR(1000)
);
CREATE INDEX idx_wosh_wo ON work_order_status_history(work_order_id);

CREATE TABLE part_usages (
    id            BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id       BIGINT NOT NULL REFERENCES parts(id),
    qty_used      INTEGER NOT NULL CHECK (qty_used > 0)
);
CREATE INDEX idx_pu_wo ON part_usages(work_order_id);

CREATE TABLE time_logs (
    id             BIGSERIAL PRIMARY KEY,
    work_order_id  BIGINT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id  BIGINT NOT NULL REFERENCES users(id),
    minutes        INTEGER NOT NULL CHECK (minutes > 0),
    note           VARCHAR(1000),
    logged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tl_wo ON time_logs(work_order_id);
