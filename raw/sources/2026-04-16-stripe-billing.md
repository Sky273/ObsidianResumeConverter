# Source Note: Stripe billing and firm credit purchases

## Purpose

Capture the durable Stripe billing model used by ResumeConverter for firm credit purchases.

## Files inspected

- `server/routes/billing.routes.js`
- `server/services/stripeBilling.service.js`
- `server/routes/stripeWebhook.routes.js`
- `docs/STRIPE_CONFIGURATION.md`

## Durable facts

- Stripe is used for cabinet/firm credit purchases, not for generic subscription billing in the currently documented product shape.
- The user-facing entry point is the admin firm-credits surface.
- Listing credit packs requires authenticated manager-level access.
- Creating a Stripe checkout session requires authenticated manager-level access and is further restricted to local admins.
- Credit packs are configuration-driven and exposed through the backend as:
  - `enabled`
  - `currency`
  - `packs`
- Checkout-session creation persists a `firm_credit_purchases` row in `pending` state before calling Stripe.
- The Stripe Checkout Session stores metadata including:
  - purchase id
  - firm id
  - user id
  - pack id
  - credits
- Success and cancel redirects return the browser to the admin firm-credits tab.
- Credits are added only after webhook fulfillment on `checkout.session.completed`.
- Webhook handling also tracks:
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`
- Fulfillment is idempotent at the purchase row level:
  - purchase is locked with `FOR UPDATE`
  - already completed purchases are not re-credited
- Successful fulfillment creates a `firm.credit_purchase` credit transaction and updates purchase fields such as:
  - checkout session id
  - payment intent id
  - customer email
  - completed timestamp
- After fulfillment, multiple caches are invalidated, including firms-related/business caches.
- The webhook endpoint uses raw-body parsing and Stripe signature verification with `STRIPE_WEBHOOK_SECRET`.
- Browser redirects alone must never credit the firm.

## Interpretation

- Stripe in ResumeConverter is a controlled top-up flow for AI credits.
- Its invariants are:
  - admin-scoped initiation
  - purchase persistence before Stripe redirect
  - webhook-only fulfillment
  - credit ledger update after verified payment
