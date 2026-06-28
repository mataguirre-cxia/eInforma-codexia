<codexia_secure_auth>

  <identity>
    You are implementing an authentication flow. Authentication is
    the gate to everything. Bugs here compromise the entire system.
  </identity>

  <non_negotiables>
    <rule>Use the auth library already adopted in the project
      (Supabase Auth by default, or NextAuth/Clerk if specified).
      Do not hand-roll auth. Do not implement your own JWT signing,
      token rotation, or password hashing.</rule>
    <rule>Passwords, if handled directly, hashed with argon2id or
      bcrypt cost >= 12. Never MD5, SHA-1, SHA-256, or any fast hash.</rule>
    <rule>Never store passwords, tokens, session IDs, or password
      reset tokens in plaintext, in logs, or in URL parameters.</rule>
    <rule>Login and password reset endpoints MUST have rate limiting
      stricter than general endpoints: 5 attempts per 15 minutes per
      IP, 10 per hour per account.</rule>
    <rule>Account enumeration protection: login errors for wrong
      password and non-existent user return the same generic message.
      Password reset always returns success regardless of whether
      the email exists.</rule>
    <rule>Password reset tokens: single-use, 15-minute TTL, bound to
      the specific user. Invalidate all active sessions on password
      change.</rule>
  </non_negotiables>

  <secure_defaults>
    <sessions>
      - Cookies: HttpOnly, Secure, SameSite=Lax, Path=/
      - Access token TTL: short (15-60 min)
      - Refresh token rotation on every use
      - Logout invalidates refresh token server-side, not just clears cookie
    </sessions>
    <registration>
      - Email verification required before account is fully active
      - Reject common/breached passwords (zxcvbn score >= 3 minimum)
      - No username enumeration: error messages generic
      - Audit log entry on account creation with IP and user agent
    </registration>
    <login>
      - Rate limit: 5/15min per IP, 10/hour per account
      - Exponential backoff after 3 failures
      - Lockout temporary (30 min) after 10 failures in an hour
      - Audit log entry on success and failure
    </login>
    <mfa>
      - TOTP (RFC 6238) as default second factor
      - Recovery codes generated on setup, hashed before storage,
        shown only once
      - Admin accounts: MFA mandatory
    </mfa>
    <password_policy>
      - Minimum 12 characters
      - No maximum below 128
      - No composition rules — use zxcvbn strength instead
      - Reject top-10k breached passwords (haveibeenpwned k-anonymity)
    </password_policy>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag if you see or are asked to produce:
    - Passwords stored or compared in plaintext
    - JWT with 'alg: none' or verification skipped
    - Tokens in URL query parameters (except one-time reset tokens)
    - Login endpoints without rate limiting
    - Custom hash functions for passwords
    - Sessions stored in localStorage (use HttpOnly cookies)
    - Email verification links that never expire
    - Password reset that reveals whether email exists
  </anti_patterns>

  <self_check>
    Before opening the PR:
    - [ ] Login endpoint has rate limiting with tests
    - [ ] Password reset returns generic success always
    - [ ] Tokens never appear in logs
    - [ ] All auth failures log to audit table
    - [ ] Session cookies are HttpOnly + Secure + SameSite=Lax
    - [ ] Logout invalidates refresh token server-side
    - [ ] No test users or backdoor credentials in the diff
  </self_check>

  <escalation>
    Stop and ask before:
    - Skipping email verification for any reason
    - Adding SSO/OAuth with a new provider
    - Storing any auth-related data outside Supabase Auth
    - Lowering any rate limit
  </escalation>

</codexia_secure_auth>
