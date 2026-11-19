# RetailPulse production data model (design only)

Status: baseline schema applied to the dedicated RetailPulse Supabase project on 2026-11-19. RLS is enabled on all 11 public tables. This remains a first security baseline, not a production security certification.

## Isolation model
- One business is one tenant (businesses).
- A user can belong to multiple businesses through business_memberships.
- Every business-owned row carries a non-null business_id.
- All exposed tables must have Row Level Security enabled.
- Policies must verify membership in the row's business; authentication alone is never sufficient.
- Roles are stored in the membership table, not in user-editable auth metadata.
- The frontend must never receive a service-role/secret database key.

## Core tables
1. businesses: id, name, preferred_language, timezone, created_at.
2. business_memberships: business_id, user_id, role (owner/manager/salesperson), active, created_at.
3. retailers: business_id, name, phone, address, area, credit_limit, opening_balance, active.
4. products: business_id, sku, name, unit, sale_price, purchase_price, reorder_level, active.
5. orders: business_id, retailer_id, order_number, status, subtotal, discount, total, placed_by, placed_at.
6. order_items: business_id, order_id, product_id, quantity, unit_price, line_total.
7. collections: business_id, retailer_id, order_id nullable, amount, method, reference, collected_by, collected_at.
8. stock_movements: business_id, product_id, movement_type, quantity, reference_type, reference_id, created_by, created_at.
9. field_visits: business_id, retailer_id, salesperson_id, visit_status, notes, visited_at.
10. daily_reports: business_id, salesperson_id, report_date, visits_count, orders_count, collection_total, notes.
11. audit_events: business_id, actor_id, action, entity_type, entity_id, safe_metadata, created_at.

## Database rules
- Use UUID primary keys and foreign keys.
- Use numeric(12,2) for money; never floating point.
- Use non-negative quantity checks and positive amount checks.
- Add indexes on (business_id, created_at), retailer lookups, order status/date and membership (user_id, business_id).
- Store timestamps in timestamptz; display in the business timezone.
- Prefer append-only stock movements and collection records; corrections should be explicit reversal/adjustment entries.
- Order status transitions must be validated server-side.
- Avoid cascading deletes for financial records; archive businesses and deactivate users instead.
- Add unique constraints scoped by business, e.g. (business_id, sku) and (business_id, order_number).

## RLS policy pattern
For every business-owned table, SELECT, INSERT, UPDATE and DELETE policies must check that auth.uid() has an active membership for the row's business_id. UPDATE requires both USING and WITH CHECK. Never use TO authenticated without a business-membership predicate.

A membership-management or first-business bootstrap function, if implemented with elevated privileges, must live in a non-exposed schema, set a fixed search_path, explicitly verify auth.uid(), revoke default PUBLIC execution, and grant only the minimum intended role. Prefer invoker-rights functions whenever possible.

## Not implemented yet
No real customer data, database credentials, authentication, billing or tenant onboarding is connected. This document is an implementation contract, not evidence of a secured production system.
