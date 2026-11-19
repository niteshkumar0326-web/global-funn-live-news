# RetailPulse release gates

## Current prototype
- [x] Separate app directory in GitHub
- [x] Responsive dashboard prototype
- [x] Demo-only orders, retailers, inventory, collections, field team and reports
- [x] Local demo persistence and CSV export
- [x] PWA manifest foundation
- [x] First Vercel build completed successfully

## Before real business use
- [x] Provision a dedicated Supabase database project in Mumbai; existing Wild Lilly database left untouched.
- [x] Add email magic-link sign-in UI and secure session persistence client.
- [ ] Configure and verify Supabase email provider, Site URL and allowed redirect URLs.
- [x] Add first-business onboarding RPC (owner role).
- [ ] Implement invite-only membership management and manager/salesperson role permissions.
- [x] Enable tenant-membership RLS policies on all 11 public tables.
- [ ] Review intentional authenticated SECURITY DEFINER owner-bootstrap RPC warning; anon execution is revoked.
- [ ] Replace browser localStorage demo state with authenticated server reads/writes.
- [ ] Add server-side validation, idempotency and audit trails.
- [ ] Add backups, restore test, monitoring and error reporting.
- [ ] Add export/import, privacy controls and account deletion workflow.
- [ ] Test tenant A cannot read or mutate tenant B data.
- [ ] Test role permissions, expired sessions, invalid inputs and concurrency.
- [ ] Security and performance review before onboarding paying businesses.

## Before charging
- [ ] Validate the product with 5–10 independent distributors.
- [ ] Confirm pricing, support workload and unit economics.
- [ ] Configure subscription entitlements and renewal/cancellation handling.
- [ ] For Google Play-distributed digital subscriptions, implement compliant Play Billing.
- [ ] Publish public HTTPS privacy policy and accurate Data Safety declarations.
- [ ] Complete Play Console account verification and applicable closed testing.
- [ ] Generate signed Android App Bundle and test on real devices.
- [ ] Complete store listing, screenshots, content rating, target API and release review.

## Non-negotiable
Never import Laxmi Enterprises' private records into this product. Never treat sample dashboard figures as real business metrics. Never claim production security or live payment processing until verified.
