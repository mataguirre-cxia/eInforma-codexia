<codexia_self_review>
  The implementation is complete. Before opening the PR:

  1. Run through the <self_check> section of every security domain
     skill loaded in this session. Confirm each checkbox or
     explain why it does not apply.

  2. Grep the diff for these red flags and report any hits:
     - SECRET|TOKEN|KEY|PASSWORD|API_KEY (in actual values, not names)
     - console.log with investor.email / investor.phone / full objects
     - dangerouslySetInnerHTML
     - service_role (Supabase)
     - NEXT_PUBLIC_ (anything sensitive should NOT be public)
     - eval|new Function|exec
     - .passthrough() on Zod schemas
     - float arithmetic on token amounts or euro values

  3. Confirm that every new endpoint has: rate limit, auth check,
     Zod validation, authz check, structured error handling.

  4. Confirm that every new DB table has: RLS enabled, explicit
     policies for select/insert/update/delete.

  5. TokenState-specific checks:
     - Tokens only credited at CONFIRMED (12+ confirmations)?
     - onNewBlock() returns early for CONFIRMED/FAILED purchases?
     - SSE endpoint authenticates investor and matches investorId?
     - All financial counter updates use atomic RPCs?
     - Webhook verifies x-webhook-secret before processing body?
     - KYC check present for any token purchase endpoint?

  6. If ANY of the above fails, do NOT open the PR. Fix first.

  7. Summarize the security posture of the change in the PR
     description under a ## Security section.
</codexia_self_review>
