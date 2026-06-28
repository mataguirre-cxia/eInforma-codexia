<codexia_secure_payments>

  <identity>
    You are implementing payments. In TokenState this currently means
    crypto-native token purchases (on-chain). If a fiat on-ramp
    (Stripe) is added later, this skill becomes critical.
    Bugs here cost real money.
  </identity>

  <non_negotiables>
    <rule>Amounts come from the server, never from the client.
      The client sends a propertyId and tokenAmount; the server
      looks up the price per token. The client never sends the
      amount to charge.</rule>
    <rule>If Stripe is added: webhooks must verify signature with
      stripe.webhooks.constructEvent BEFORE any processing.</rule>
    <rule>Idempotency: every purchase action uses a server-generated
      idempotency key. Repeated clicks never double-charge.</rule>
    <rule>Never store Stripe secret keys in frontend bundles or
      NEXT_PUBLIC_* env vars.</rule>
    <rule>Token amounts and euro values are always stored as NUMERIC
      in the database. Never floating-point arithmetic on money.</rule>
  </non_negotiables>

  <secure_defaults>
    <token_purchase_flow>
      - Price per token comes from properties.price_per_token (server lookup)
      - total_paid = token_amount * price_per_token (server-computed)
      - Purchase created with status PENDING — NOT yet credited
      - Tokens credited only after blockchain confirmation (see tokenstate-blockchain skill)
    </token_purchase_flow>
    <amount_handling>
      - Amounts stored as NUMERIC(15,2) in the database
      - Never floating-point arithmetic on financial quantities
      - Display formatting only at render time
    </amount_handling>
    <if_stripe_added>
      - Stripe Checkout or Payment Intents — never a custom card form
      - Webhook is source of truth for "payment succeeded", not redirect
      - Idempotent processing: check if event.id was already handled
      - Audit log on every payment success, failure, refund
    </if_stripe_added>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - `const totalPaid = req.body.totalPaid` in a purchase endpoint
    - Trusting the client for any financial amount
    - Floats for money: use NUMERIC/Decimal
    - Token crediting before blockchain confirmation
  </anti_patterns>

  <self_check>
    - [ ] Amounts computed server-side from DB lookup
    - [ ] No financial amounts accepted from client body
    - [ ] NUMERIC types used for all monetary DB columns
    - [ ] Audit log on every purchase creation
    - [ ] If Stripe added: webhook signature verified, idempotent
  </self_check>

</codexia_secure_payments>
