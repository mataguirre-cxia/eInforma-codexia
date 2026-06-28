<codexia_threat_model>
  Before writing any code for this feature, produce a brief threat
  model (5-10 bullet points, no more):

  1. What are the assets this feature handles?
     (data, money, tokens, privileged operations, integrations)
  2. Who are the potential adversaries?
     (external attacker, malicious investor, compromised admin,
      curious insider, third-party dependency, rogue blockchain node)
  3. What are the most plausible attack paths?
     (think STRIDE: Spoofing, Tampering, Repudiation, Information
      disclosure, Denial of service, Elevation of privilege)
  4. Which existing controls in the stack mitigate these?
     (RLS, rate limit, MFA, audit log, input validation, webhook secret,
      idempotency guard, 12-confirmation rule)
  5. Which controls are MISSING for this feature and must be added
     as part of the implementation?

  Return the threat model as a short markdown section. Do NOT start
  writing code until the operator reviews and confirms.
  If the feature is trivial (pure UI change, no new data, no new
  endpoint), state that and skip.

  TokenState-specific attack surfaces to always consider:
  - Can an attacker fake a blockchain confirmation (webhook replay)?
  - Can an investor trigger double-credit by sending duplicate requests?
  - Can an investor subscribe to another investor's SSE stream?
  - Can the admin panel be accessed without MFA?
  - Can financial amounts be manipulated client-side?
</codexia_threat_model>
