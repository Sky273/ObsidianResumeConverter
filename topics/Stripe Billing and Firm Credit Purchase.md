# Stripe Billing and Firm Credit Purchase

## Summary

ResumeConverter uses Stripe to let a cabinet purchase additional AI credits. This is not a broad billing platform in the currently documented product shape; it is a controlled credit top-up flow connected to the firm credit ledger.

## User-Facing Flow

The flow is:

1. a manager/local admin opens the firm credits admin area
2. the frontend loads available Stripe credit packs
3. a local admin selects a pack
4. the backend creates a pending purchase record
5. the backend creates a Stripe Checkout Session
6. Stripe hosts the payment
7. Stripe calls the webhook after payment outcome
8. the backend credits the firm only after verified webhook fulfillment

The browser redirect alone never grants credits.

## Access Model

- Listing packs requires authenticated manager-level access.
- Creating a checkout session requires manager-level access and is additionally restricted to local admins.

This makes purchase initiation an admin-governed operation, not a generic end-user feature.

## Purchase Model

Stripe purchase state is persisted in `firm_credit_purchases`.

Important states include:

- `pending`
- `completed`
- `expired`
- `failed`

The purchase row is created before Stripe Checkout is called. This ensures the application has an internal purchase identifier and state even before the external payment completes.

## Checkout Session Model

The Stripe Checkout Session includes metadata such as:

- purchase id
- firm id
- user id
- pack id
- credits

This lets webhook fulfillment reconnect the external Stripe event to the internal purchase and firm-credit model.

## Webhook Model

The webhook endpoint is the real fulfillment boundary.

Handled events include:

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

### Completion

On `checkout.session.completed`, the backend:

- loads the purchase by internal identifier
- locks it
- checks whether it is already completed
- verifies payment status
- writes the firm credit transaction
- marks the purchase completed

### Expired / failed

On expiration or async failure, the purchase status is updated without granting credits.

## Credit Ledger Link

Successful Stripe fulfillment creates a `firm.credit_purchase` credit transaction. This ties Stripe billing directly into the same firm-credit accounting model used by the rest of the AI credit system.

Security and operational consequence:

- Stripe is not a side system
- it feeds the same cabinet-credit truth used by AI reservation and consumption

## Security Invariants

- only authorized admin-level users can initiate checkout
- no credits are granted from frontend redirects
- webhook signature verification is mandatory
- fulfillment is idempotent at the purchase level
- purchase state is persisted before leaving the app for Stripe

## Operational Notes

- redirect URLs point back to the admin firm-credits tab
- currency and credit packs are configuration-driven
- fulfillment invalidates relevant caches after updating the firm credit state

## Why This Matters

- Stripe behavior should be understood together with AI credits, not separately
- any change to purchase flow, webhook handling, or firm credit accounting can directly affect cabinet billing integrity

## Related

- [[topics/AI Credits]]
- [[topics/Admin and Operations]]
- [[topics/Security and Compliance]]
- [[topics/Integrations]]

## Sources

- [[raw/sources/2026-04-16-stripe-billing]]
