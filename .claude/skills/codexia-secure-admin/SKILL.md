<codexia_secure_admin>

  <identity>
    You are building admin or privileged functionality for Portal Cliente Codexia.
    These endpoints have blast radius — a bug or an abused account here
    can expose every client's project data, send unwanted invitations,
    or corrupt project state for paying clients.
    In Portal Cliente, admin actions include: creating projects, inviting clients,
    managing phases, publishing weekly updates, and extracting kickoff documents with AI.
  </identity>

  <non_negotiables>
    <rule>Every admin endpoint checks: authenticated user + row in the `admins`
      table with matching `auth_user_id`. Both checks are mandatory.
      Middleware auth alone is not sufficient — the admins table check must
      happen server-side in each route handler.</rule>
    <rule>The `createAdminClient()` (service_role) is ONLY used in
      `app/api/admin/` and scripts. Never in client-accessible code.</rule>
    <rule>Client invitation uses `supabase.auth.admin.inviteUserByEmail`.
      Only admins can invoke this. Never expose this flow to client-role users.</rule>
    <rule>The `internal_note` field of `client_updates` is ONLY readable
      by admins. Never include it in any query or response accessible
      to client-role users.</rule>
    <rule>Destructive admin actions (deleting a project, closing onboarding
      forcefully, removing a client user) require explicit re-confirmation
      from the admin before executing.</rule>
  </non_negotiables>

  <secure_defaults>
    <role_gating>
      - Admin role: presence of a row in `admins` WHERE `auth_user_id = user.id`
      - Every /api/admin/* route handler performs this lookup before any logic
      - Middleware only handles session redirect; role check is in each handler
      - RLS policies enforce that clients cannot read/write admin-only data
    </role_gating>
    <admin_client_usage>
      - `createAdminClient()` is for: inviting users, writing across tenants,
        operations that need to bypass RLS by design
      - Any use of `createAdminClient()` outside admin routes is a bug — flag it
    </admin_client_usage>
    <dangerous_operations>
      - Project creation: always validate required fields before inviting client
      - Onboarding gate: `gate_closed_at` is set by the system, not directly by
        the client — guard against premature closure
      - Phase status changes: `completed` → `in_progress` is a regression;
        surface it as a confirmation
    </dangerous_operations>
    <internal_data>
      - `client_updates.internal_note` is never selected in client-facing queries
      - When building queries for the portal (client view), always exclude internal_note
      - grep check before PR: `grep -r "internal_note" app/api/` and
        `grep -r "internal_note" app/(client)/`
    </internal_data>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - Admin routes gated only by middleware (no admins table check in the handler)
    - `createAdminClient()` used in client-accessible routes or components
    - `internal_note` returned to the client in any API response
    - Client invitation triggered by a non-admin user
    - `service_role` key exposed in any NEXT_PUBLIC_ variable
    - Admin UI that lets a client user see or modify another tenant's data
    - Bulk operations without preview or dry-run step
  </anti_patterns>

  <self_check>
    - [ ] Every /api/admin/* route checks admins table (not just middleware)
    - [ ] `createAdminClient()` only appears in admin routes and scripts
    - [ ] `internal_note` absent from all client-facing queries and responses
    - [ ] Client invitation only callable by verified admin
    - [ ] Destructive operations have a confirmation step
    - [ ] Test: user without admin row cannot access any /admin/* route
    - [ ] Test: client-role user cannot read internal_note via any endpoint
  </self_check>

  <escalation>
    Stop and ask before:
    - Adding a new admin capability that touches multiple tenants at once
    - Building bulk operations (mass invite, mass status update)
    - Implementing any admin impersonation of a client user
    - Adding new fields that should be admin-only to existing client-facing tables
  </escalation>

</codexia_secure_admin>
