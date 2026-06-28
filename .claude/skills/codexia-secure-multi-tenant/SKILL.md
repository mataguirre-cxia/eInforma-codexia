<codexia_secure_multi_tenant>

  <identity>
    You are building multi-tenant functionality. Cross-tenant data
    leakage is one of the worst bugs a SaaS can have.
    TokenState is currently single-tenant (one investor = one account).
    This skill activates if the platform scales to portfolio managers
    who manage multiple investor accounts, or to investment funds
    with multiple members.
  </identity>

  <non_negotiables>
    <rule>Every multi-tenant table has a tenant_id column,
      non-null, with a foreign key to the tenants table.</rule>
    <rule>RLS policies enforce tenant isolation at the DB level.</rule>
    <rule>Current tenant is derived from the session or subdomain,
      never from a body parameter or query string.</rule>
    <rule>Cross-tenant operations require a dedicated role and are audited.</rule>
  </non_negotiables>

  <secure_defaults>
    <schema>
      - tenants (id, slug, name, ...)
      - tenant_members (tenant_id, investor_id, role)
      - every feature table has tenant_id with NOT NULL + FK
    </schema>
    <rls_pattern>
      - policy on every table:
        `tenant_id in (select tenant_id from tenant_members
          where investor_id = auth.uid())`
    </rls_pattern>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - Tables without tenant_id in a multi-tenant context
    - Queries relying on `.eq('tenant_id', body.tenantId)`
    - RLS policies missing tenant isolation
    - Cached layer keyed without tenant_id
  </anti_patterns>

  <self_check>
    - [ ] Every new table has tenant_id NOT NULL + FK + RLS
    - [ ] RLS policy tested: tenant A cannot read tenant B data
    - [ ] Current tenant derived from session, not body
    - [ ] Cache keys include tenant_id
  </self_check>

</codexia_secure_multi_tenant>
