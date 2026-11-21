# RetailPulse

A standalone distributor/wholesaler operations app prototype.

## Current scope
- Responsive owner dashboard
- Demo orders, retailer directory, inventory, collections, field-team and reports views
- Hindi/English navigation toggle
- Add demo order and retailer interactions
- CSV export for demo orders
- Local browser persistence for demo changes
- PWA manifest foundation

## Run locally
```bash
npm install
npm run dev
npm run build
```

## Important
This is an MVP prototype with illustrative sample data. It is not yet a production SaaS: inventory/product CRUD, order line items, collection recording, field reports, live KPI aggregation, backups, real billing, notification delivery, audit logging, security review and Play Store compliance must be implemented and tested before accepting real customer data or payments. Do not add Laxmi Enterprises private data to this app.

## Android path
After the secure backend and UX are validated, add Capacitor Android wrapper, generate a signed AAB, test on real devices, complete privacy policy/Data Safety, configure Play Billing for digital subscriptions, and submit through the owner's Google Play Console account.


### Invoice-level payment allocation

Collections can be recorded against a specific invoice or left as an account-level receipt. The order register shows the amount allocated, remaining invoice balance, and paid / part-paid / unpaid status. The database RPC locks the retailer and invoice rows and rejects an invoice allocation above its remaining balance, including concurrent receipts. The applied migration is tracked at `supabase/migrations/202611190001_enforce_order_payment_allocation.sql`. This does not yet provide automatic allocation of account-level receipts across multiple invoices.
