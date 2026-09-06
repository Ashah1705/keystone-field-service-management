# Project KEYSTONE — Field Service Management Platform

A field-service platform for Meridian Facilities Management: dispatchers raise and assign work
orders, technicians update them from the field, managers track SLAs and performance, and
customers self-serve requests. Built for the Zidio Development Java Full-Stack engineering brief.

**Stack:** Spring Boot 3 (Java 21) · Spring Security + JWT · PostgreSQL + Flyway · React 18 + TypeScript (Vite)

---

## 1. Architecture at a glance

```
React SPA (Vite)  →  Spring REST controllers  →  Services (business rules, lifecycle)  →  Spring Data JPA  →  PostgreSQL
                                                         ↑
                                        Spring Security + stateless JWT on every request
```

- **Controllers** are thin: validate input, delegate to services, map nothing themselves.
- **Services** hold all business logic, including the work-order lifecycle state machine
  (`WorkOrderService`), and build response DTOs *inside* their `@Transactional` boundary —
  with `spring.jpa.open-in-view=false`, mapping DTOs after the transaction closes would throw
  `LazyInitializationException` on the `customer`/`site`/`assignedTo`/history associations, so
  entities never leave the service layer.
- **Repositories** are role-scoped where it matters: `WorkOrderRepository.search()` and
  `findByAssignedToId()` are the only ways list endpoints reach the database, so a customer can
  never accidentally see another customer's jobs and a technician never sees another tech's queue.
- **The lifecycle** (`WorkOrderStatus`) encodes every legal transition in one place
  (`ALLOWED_TRANSITIONS`), and `WorkOrderService.assertTransitionRole()` encodes who is allowed to
  make each transition. Every transition writes an append-only `WorkOrderStatusHistory` row in the
  same transaction as the status change.

## 2. Local setup

### Prerequisites
- Java 21, Maven 3.9+, Node.js 20+, PostgreSQL 16 (or Docker)

### Option A — Docker Compose (fastest)
```bash
docker compose up --build
```
This starts Postgres, runs Flyway migrations + seed data automatically on backend startup, and
serves the frontend on **http://localhost:5173** against the API on **http://localhost:8080**.

### Option B — run natively

**Database**
```bash
docker run -d --name keystone-db -e POSTGRES_DB=keystone -e POSTGRES_USER=keystone \
  -e POSTGRES_PASSWORD=keystone -p 5432:5432 postgres:16-alpine
```

**Backend**
```bash
cd backend
export JWT_SECRET="a-long-random-string-at-least-32-chars"
mvn spring-boot:run
```
Flyway runs the migrations in `src/main/resources/db/migration` automatically on startup —
`V1__init_schema.sql` creates the schema, `V2__seed_data.sql` seeds demo accounts and reference data.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Visit **http://localhost:5173**.

## 3. Environment variables

| Variable | Default (dev) | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/keystone` | JDBC connection string |
| `DB_USER` / `DB_PASSWORD` | `keystone` / `keystone` | Database credentials |
| `JWT_SECRET` | *(dev placeholder — override in real environments)* | HMAC key signing JWTs |
| `JWT_EXPIRATION_MINUTES` | `480` | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `SLA_URGENT_MINUTES` / `HIGH` / `MEDIUM` / `LOW` | 240 / 1440 / 4320 / 10080 | SLA windows by priority |
| `VITE_API_BASE_URL` (frontend) | `http://localhost:8080` | Backend base URL the SPA calls |

**Never commit real secrets.** `.env` files are git-ignored; set these via your shell,
`docker-compose.yml`, or your hosting platform's config.

## 4. Seed logins

All seed accounts share the password **`Password123!`**.

| Role | Email |
|---|---|
| Dispatcher | `dispatcher@keystone.dev` |
| Manager | `manager@keystone.dev` |
| Technician | `tech1@keystone.dev` (also `tech2@keystone.dev`) |
| Customer | `customer@keystone.dev` (tied to Meridian Facilities Management) |

## 5. API documentation

Once the backend is running: **http://localhost:8080/swagger-ui.html**
(raw spec at `/v3/api-docs`).

## 6. Running tests

```bash
cd backend
mvn test
```

## 7. What's implemented vs. the brief

Implemented end to end: JWT auth + 4 roles, customers/sites, work-order CRUD, the governed
lifecycle (`NEW → ASSIGNED → IN_PROGRESS ⇄ ON_HOLD → COMPLETED → CLOSED`, with `CANCELLED` from
`NEW`/`ASSIGNED` and a manager-only reopen from `COMPLETED`), dispatch/assignment, transactional
parts usage with stock decrement, time logging, SLA due-dates + a scheduled breach sweep, a
dashboard summary endpoint, a customer portal, and OpenAPI docs.

**Deliberately out of scope**, per Section 4.3 of the brief: payment/invoicing, native mobile
apps, route optimisation/GPS, and third-party ERP integrations.

**Suggested next steps if you extend this:** wire the SLA breach sweep to an actual notification
channel (email/in-app — the hook is `SlaSchedulerService`), add pagination controls to the React
board/list views, and add an integration-test suite covering the lifecycle transitions and
cross-customer/cross-technician authorization boundaries (Section 8.1's "threats to defend
against" — those are the cases to write tests for first).

## 8. A note on this build

This scaffold was put together quickly and covers the architecture, security model, and lifecycle
logic in full working form — but you're expected to understand and be able to explain every part
of it (Section 19 of the brief: mentors may ask you to modify the lifecycle or security layer live
at review). Read `WorkOrderStatus.java` and `WorkOrderService.java` first — that's the core of the
platform — then work outward through the controllers and the React pages that call them.
