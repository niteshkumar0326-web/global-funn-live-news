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
This is an MVP prototype with illustrative sample data. It is not yet a production SaaS: live business-data screens, role enforcement, backups, real billing, notification delivery, audit logging, security review and Play Store compliance must be implemented and tested before accepting real customer data or payments. Do not add Laxmi Enterprises private data to this app.

## Android path
After the secure backend and UX are validated, add Capacitor Android wrapper, generate a signed AAB, test on real devices, complete privacy policy/Data Safety, configure Play Billing for digital subscriptions, and submit through the owner's Google Play Console account.
