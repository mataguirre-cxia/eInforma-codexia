<codexia_secure_authz>

  <identity>
    You are implementing authorization. Authentication answers
    "who are you?" — authorization answers "what are you allowed
    to do?". Most real-world breaches happen here, not in auth.
  </identity>

  <non_negotiables>
    <rule>Every Supabase table that stores any data has RLS enabled.
      No exceptions. If you create a table, you write the RLS policy
      in the same migration.</rule>
    <rule>Default policy is deny. Allow is explicit per role and
      per operation (select, insert, update, delete).</rule>
    <rule>Never trust user IDs or resource IDs sent by the client.
      Always derive the current user from the verified session
      (auth.uid() in RLS, session.user.id in server code).</rule>
    <rule>Authorization is enforced server-side AND at the DB level.
      Frontend hiding is UX, not security.</rule>
    <rule>IDOR (Insecure Direct Object Reference) protection is
      mandatory: every query that loads a resource by ID checks
      ownership or role access.</rule>
    <rule>Never use the Supabase service_role key in client code,
      browser bundles, or client-accessible API routes. It bypasses
      RLS by design.</rule>
  </non_negotiables>

  <secure_defaults>
    <rls_policies>
      - Table created → RLS enabled in the same migration:
        `alter table {name} enable row level security;`
      - At minimum, four policies: select, insert, update, delete
      - Each policy uses `auth.uid()` to scope to the current user
      - Policies checked with integration tests before deploy
    </rls_policies>
    <server_actions>
      - Start with getUser() from the auth client
      - If not authenticated: return 401 immediately
      - Check resource ownership or role membership explicitly
      - Use the authenticated Supabase client (inherits RLS),
        not the service_role client
    </server_actions>
    <roles>
      - Roles stored in a dedicated table (investors with role field)
      - Role assignment is an audited action
      - Role checks happen in RLS policies (not only in app code)
    </roles>
    <ids>
      - New resources: use UUID v4, not sequential integers
      - Never expose internal DB IDs in URLs when a slug would suffice
    </ids>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag if you see or are asked to produce:
    - A Supabase table without RLS enabled
    - service_role key used in any code reachable from the client
    - Queries that trust `userId` from the request body
      instead of the session
    - Admin endpoints gated only by a role check in JS (must be in RLS too)
    - `.eq('investor_id', body.investorId)` anywhere in a client-facing route
    - RLS policies that use `true` without a user filter
  </anti_patterns>

  <self_check>
    Before opening the PR:
    - [ ] Every new table has RLS enabled in the migration
    - [ ] Every new table has explicit policies for select/insert/update/delete
    - [ ] Every new endpoint verifies session before reading resources
    - [ ] Every resource load by ID checks ownership (in code or RLS or both)
    - [ ] No service_role key in code reachable from client
    - [ ] Role checks happen both in app code AND RLS
    - [ ] Integration test: user A cannot access user B's resources
  </self_check>

  <escalation>
    Stop and ask before:
    - Using the service_role client in any server code
    - Disabling RLS on an existing table
    - Adding a new role type
    - Building an "impersonate user" feature for admins
  </escalation>

</codexia_secure_authz>
