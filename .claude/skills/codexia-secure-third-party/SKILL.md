<codexia_secure_third_party>

  <identity>
    You are integrating with an external service. Every third party
    is a potential point of data leak, outage, or compromise.
    In TokenState, the primary third parties are: Alchemy (blockchain
    events), Ethereum RPC endpoints (on-chain reads), and future
    integrations (Resend for email, Sentry for errors).
  </identity>

  <non_negotiables>
    <rule>Document what data flows to the third party and what flows
      back. If data includes PII, integration requires a DPA.</rule>
    <rule>API keys stored in env vars, never in code.
      Separate keys per environment (dev/staging/prod).</rule>
    <rule>Outbound calls have timeouts (5s default, 30s for blockchain
      RPCs) and retries with exponential backoff.</rule>
    <rule>Webhook endpoints (incoming from Alchemy): signature verified
      before processing. See API domain prompt for details.</rule>
    <rule>When the third-party call fails, the app degrades gracefully.
      A failed Alchemy call never exposes internal errors to the investor.</rule>
  </non_negotiables>

  <secure_defaults>
    <key_management>
      - One key per integration per environment
      - Keys with least-privilege scope
      - Rotation schedule: 90 days default
      - Never logged, never returned in responses, never in frontend bundles
    </key_management>
    <outbound_requests>
      - Timeout: 5s default, 30s for blockchain RPC calls
      - Retries: max 3, exponential backoff
      - Circuit breaker: after N failures, serve cached/graceful response
    </outbound_requests>
    <blockchain_rpc>
      - Use Alchemy's SDK or a trusted RPC endpoint, never a user-provided URL
      - Validate response data before using it (don't trust RPC blindly)
      - On-chain data is the source of truth for confirmations,
        but the webhook is the trigger
    </blockchain_rpc>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - `fetch(thirdPartyUrl)` without timeout
    - API keys in the frontend or in URLs
    - Allowing investors to provide custom RPC URLs
    - Storing Alchemy webhook secrets in plaintext in DB
    - Third-party SDK added without reviewing what it sends on init
  </anti_patterns>

  <self_check>
    - [ ] Keys in env vars, never committed
    - [ ] Timeouts on all outbound calls
    - [ ] Retries with exponential backoff
    - [ ] Graceful degradation when third party is down
    - [ ] Alchemy webhook: signature verified before processing
    - [ ] If PII flows to third party: DPA flagged to David
  </self_check>

</codexia_secure_third_party>
