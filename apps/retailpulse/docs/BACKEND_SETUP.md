# RetailPulse backend setup

A dedicated Supabase project has been provisioned in the Asia South (Mumbai) region.

- Project ref: `limsfhmnijttaevtrfdx`
- Project URL: `https://limsfhmnijttaevtrfdx.supabase.co`
- Client key type: Supabase publishable key (safe for browser use when RLS is enabled)
- Never place a Supabase secret/service-role key in this repository or browser environment.

## Local/Vercel configuration

Set these environment variables for the RetailPulse Vite app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Use `.env.example` as the template. The actual publishable key should be set in Vercel project environment settings, not committed to Git.

## Database baseline

The first two database migrations are applied to the dedicated RetailPulse project:

- `20261119024624_retailpulse_tenant_schema_v1`
- `20261119024639_retailpulse_foreign_key_indexes_v1`
- `20261119024936_retailpulse_secure_owner_onboarding_v1`
- `20261119025111_retailpulse_restrict_onboarding_rpc_v1`
- `20261119025310_retailpulse_role_based_access_v1`
- `20261119025319_retailpulse_order_item_tenant_check_v1`

The schema contains businesses, memberships, retailers, products, orders, order items, collections, stock movements, field visits, daily reports and audit events. RLS is enabled on all 11 public tables. Role policies now distinguish owner, manager and salesperson permissions: managers maintain master data; salespeople can create their own orders, collections, visits and daily reports; deletion and sensitive updates are restricted. The owner bootstrap RPC creates a business and owner membership for the currently authenticated user. It validates auth.uid(), uses a fixed search_path, and is executable by authenticated users only (anon execution explicitly revoked). Supabase's security advisor still reports the intentional authenticated SECURITY DEFINER RPC as a warning; this requires a focused security review before production.

## Remaining backend work

- Configure Supabase Auth email provider, Site URL and allowed redirect URLs for the final app domain; verify email link delivery and callback end-to-end.
- Review the owner bootstrap SECURITY DEFINER RPC and test abuse/rate limits; advisor warning is intentional but not a production approval.
- Implement invite-only membership management and safe role assignment/change workflow.
- [x] Add email magic-link sign-in UI and first-business onboarding screen (provider and redirect configuration still needs dashboard verification).
- [x] Connect retailer directory and order register to tenant-scoped Supabase queries.
- [x] Add retailer creation (owner/manager) and basic order-total creation (owner/manager/salesperson policy).
- [x] Add tenant-scoped product catalogue reads and product creation (owner/manager), including SKU, unit, sale price, purchase price and reorder level.
- [ ] Replace prompt-based product entry with validated forms and duplicate-SKU feedback.
- [x] Add itemised order workflow using order_items and a server-side atomic RPC that validates active business membership, retailer/product ownership, quantities and discount, then calculates line totals from catalogue prices.
- [ ] Add automated authenticated integration tests for owner, manager, salesperson and cross-tenant denial.
- [x] Add owner/manager stock receipt RPC and tenant-scoped live stock-balance view.
- [x] Automatically post stock-out ledger movements when itemised order lines are created.
- [ ] Add insufficient-stock prevention / configurable negative-stock policy and stock adjustment workflow.
- [ ] Add secure collection receipt RPC, payment allocation and live retailer outstanding calculations.
- [ ] Add field-visit and daily-report CRUD.
- Test tenant isolation with at least two test accounts/businesses.
- Add server-side audit logging and validated order/stock/payment workflows.
- Configure backups, monitoring, rate limits and privacy workflows.

No real business data has been imported. The dashboard remains in demo mode until these steps are complete.
