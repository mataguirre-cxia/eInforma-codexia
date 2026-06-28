<codexia_secure_api>

  <identity>
    You are building a server-side endpoint. Everything that crosses
    the network from the client is untrusted until validated,
    authenticated, authorized and rate-limited.
  </identity>

  <non_negotiables>
    <rule>Every endpoint follows this sequence, in order:
      1. Rate limit check (fail fast with 429)
      2. Authentication check (401 if required and missing)
      3. Input validation with Zod (400 on schema violation)
      4. Authorization check (403 or 404 based on threat model)
      5. Business logic
      6. Audit log (if relevant)
      7. Response (minimum necessary data)
    </rule>
    <rule>Error responses never leak internal details: stack traces,
      SQL errors, internal paths, library versions. Map to generic
      messages; log full detail server-side with a correlation ID.</rule>
    <rule>For sensitive read endpoints (returning user data), return
      404 instead of 403 when the user is authenticated but not
      authorized. This prevents resource existence leak.</rule>
    <rule>Never accept raw SQL, raw regex patterns, or raw HTML from
      the client.</rule>
  </non_negotiables>

  <secure_defaults>
    <validation>
      - Zod schema per endpoint, strict: no excess properties allowed
      - Types inferred from Zod, not duplicated
      - Numbers bounded (min/max), strings length-bounded, arrays size-bounded
      - Emails, URLs, UUIDs validated with specific Zod validators
      - Dates accepted as ISO strings, parsed to Date server-side
    </validation>
    <rate_limiting>
      - Default: 60/min per IP unauthenticated, 600/min per user auth
      - Auth endpoints stricter: 5/15min per IP
      - Key: user.id when authenticated, IP when not
      - Storage: Upstash Redis with sliding window
    </rate_limiting>
    <webhooks_incoming>
      - Verify signature with the provider's scheme before ANY processing
      - Reject replay attacks: check timestamp is within tolerance
      - Idempotency key handled: repeated webhooks don't duplicate effects
      - Never execute user-controlled payloads as code or SQL
    </webhooks_incoming>
    <responses>
      - Return only fields the client needs for this view
      - Never return full DB rows when only a subset is needed
      - Never include internal flags, deleted_at, system-only fields
    </responses>
  </secure_defaults>

  <pattern_template>
    // Canonical structure for a Next.js Route Handler (App Router):
    export async function POST(req: Request) {
      try {
        // 1. Rate limit
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const rl = await rateLimit({ key: ip, limit: 60, window: '1m' })
        if (!rl.ok) return Response.json({ error: 'too_many' }, { status: 429 })

        // 2. Auth
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'unauthenticated' }, { status: 401 })

        // 3. Validate
        const body = await req.json()
        const parsed = Schema.safeParse(body)
        if (!parsed.success) {
          return Response.json({ error: 'invalid_input' }, { status: 400 })
        }

        // 4. Authorize (RLS + explicit check)
        // 5. Business logic
        const result = await doWork(parsed.data, user)

        // 6. Audit (if relevant)
        // 7. Return minimum
        return Response.json({ id: result.id })
      } catch (err) {
        console.error('[api]', err)
        return Response.json({ error: 'internal_error' }, { status: 500 })
      }
    }
  </pattern_template>

  <anti_patterns>
    REJECT and flag:
    - Endpoints without rate limiting
    - Endpoints that skip validation because "it's internal"
    - try/catch that returns err.message or err.stack to the client
    - Webhook handlers that process payload before signature check
    - CORS with `*` in production
    - Endpoints that perform destructive operations on GET
  </anti_patterns>

  <self_check>
    - [ ] Rate limit in place
    - [ ] Zod schema covers all accepted fields and rejects extras
    - [ ] Auth check present (or endpoint is intentionally public)
    - [ ] Authz check present for any user-specific resource
    - [ ] Error responses don't leak internals
    - [ ] Audit log entry for state-changing operations
    - [ ] Response contains only fields needed by the client
  </self_check>

</codexia_secure_api>
