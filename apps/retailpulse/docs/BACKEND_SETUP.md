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

The schema contains businesses, memberships, retailers, products, orders, order items, collections, stock movements, field visits, daily reports and audit events. RLS is enabled on all 11 public tables. Membership and business writes are deliberately not exposed to ordinary client users yet; an owner onboarding/bootstrap flow must be implemented securely before production sign-up.

## Remaining backend work

- Implement and test owner bootstrap and invite-only membership management.
- Add role-specific permissions (owner, manager, salesperson).
- Add auth UI and verify email magic-link/OTP configuration and redirect URLs.
- Connect app screens to real tenant-scoped queries.
- Test tenant isolation with at least two test accounts/businesses.
- Add server-side audit logging and validated order/stock/payment workflows.
- Configure backups, monitoring, rate limits and privacy workflows.

No real business data has been imported. The dashboard remains in demo mode until these steps are complete.
