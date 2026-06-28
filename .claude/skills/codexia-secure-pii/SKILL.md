<codexia_secure_pii>

  <identity>
    You are handling personal data in an EU context. GDPR applies
    by default. Treat PII as radioactive: only collect what's needed,
    protect it while you hold it, delete it when you're done.
    In TokenState, PII includes: name, email, wallet address, DNI/passport
    (KYC), and full investment history (financial data).
  </identity>

  <non_negotiables>
    <rule>PII categories treated distinctly:
      - Common: name, email, phone, address
      - Identifiers: DNI/NIE/passport, tax ID, wallet address
      - Financial: investment history, token balances, payout amounts
      - Sensitive (Art. 9 GDPR): health, biometric, etc.
      Sensitive PII requires explicit legal basis and stricter handling.</rule>
    <rule>Never log PII. Log investor.id, never investor.email.
      Never log body of requests containing PII.</rule>
    <rule>Never include PII in error messages returned to the client.</rule>
    <rule>Never include PII in URL parameters.</rule>
    <rule>Never include PII in analytics events or Sentry error payloads
      without explicit data processing agreements.</rule>
    <rule>Financial records (purchases, rental_payouts) have legal
      retention requirements. Do not delete them on user account
      deletion — pseudonymize instead.</rule>
  </non_negotiables>

  <secure_defaults>
    <storage>
      - KYC documents (DNI, passport): encrypted at column level
        with Supabase pgcrypto or stored in encrypted Supabase Storage bucket
      - Wallet address: pseudonymizable — can be stored hashed for
        internal references if the original is not needed for display
      - Retention period defined per entity:
        - investors: until deletion request (GDPR Art. 17) — pseudonymize
        - purchases/rental_payouts: 7 years (financial record retention)
    </storage>
    <access>
      - Access to PII by admins is audited with user + reason
      - Bulk exports require admin + MFA + justification
    </access>
    <user_rights>
      - Export (Art. 15): investor can download their data
      - Erasure (Art. 17): investor requests deletion; pseudonymize
        financial records, delete personal identifiers
    </user_rights>
    <breach_handling>
      - Any PII incident: escalate to David within 1 hour
      - GDPR breach notification: 72 hours to AEPD if risk to subjects
    </breach_handling>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - `console.log('investor logged in', { email: investor.email })`
    - URLs like /confirm?email=alice@foo.com&token=...
    - Error responses that echo back submitted PII
    - Sentry events with full request body on 500 errors
    - Hard-delete of purchases or rental_payouts (legal retention)
    - One-click "delete my account" without email confirmation
  </anti_patterns>

  <self_check>
    - [ ] No PII in logs
    - [ ] No PII in Sentry payloads (beforeSend scrubber present)
    - [ ] No PII in URL parameters
    - [ ] KYC documents encrypted at rest
    - [ ] Audit log on admin access to investor PII
    - [ ] Investor export and pseudonymization flow planned if feature collects PII
    - [ ] Financial records retained, not hard-deleted
  </self_check>

  <escalation>
    Stop and ask before:
    - Adding a new field that collects sensitive PII (Art. 9)
    - Sending PII to a third-party service
    - Implementing investor deletion for financial records
    - Adding analytics or tracking
    - Storing PII outside the EU region
  </escalation>

</codexia_secure_pii>
