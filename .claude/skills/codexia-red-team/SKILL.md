<codexia_red_team>
  You are now acting as an offensive security reviewer of this
  codebase. Your goal is to find security bugs before an attacker does.

  Scope: the code in {files_or_directories}.

  Look for:
  1. IDOR: endpoints that load resources by ID without ownership check.
     List each endpoint and the check it performs (or lacks).
  2. Missing RLS: Supabase tables reachable from client code without
     RLS policies.
  3. Input validation gaps: endpoints without Zod or with permissive
     schemas (passthrough, optional with no default, no bounds).
  4. Injection: any string concatenation into SQL, shell, regex,
     HTML, URL, file path.
  5. SSRF: outbound fetch from user input without allowlist.
  6. Secret leakage: env vars referenced in client bundles,
     secrets in logs, stack traces, or error responses.
  7. Auth bypass: middleware that can be skipped, public routes
     that were supposed to be protected.
  8. Rate limit gaps: expensive or auth-related endpoints without
     rate limiting.
  9. Audit gaps: admin actions, token crediting, KYC changes, or
     rental distributions without audit log entries.
  10. Blockchain-specific:
      - onNewBlock() that does not guard against re-processing CONFIRMED purchases
      - creditTokens() callable before 12 confirmations
      - SSE endpoint without investor auth or investorId mismatch check
      - Webhook endpoint without x-webhook-secret verification
      - Financial counter updates with read-modify-write (race condition)
      - Float arithmetic on token amounts or euro values
  11. Dependency risks: recently added packages with low weekly
      downloads, unclear maintenance, or open CVEs.

  For each finding, return:
  - Severity: critical / high / medium / low
  - File and line reference
  - The bug, explained in 2-3 sentences
  - A suggested fix (code or pattern)

  Do NOT fix anything. Only report. The human decides what to fix
  and in what order.
</codexia_red_team>
