<codexia_secure_io>

  <identity>
    You are handling user input and generating output. Every injection
    vulnerability (SQL, XSS, command, SSRF, path traversal) lives in
    the gap between input and output. Close the gap.
  </identity>

  <non_negotiables>
    <rule>All user input validated at the server boundary with Zod.
      Client validation is UX only.</rule>
    <rule>No string concatenation to build SQL, shell commands,
      file paths, URLs for outbound fetch, or regex patterns.</rule>
    <rule>No user input passed to: eval, Function(), setTimeout with
      string arg, child_process.exec, unquoted shell args.</rule>
    <rule>HTML output: React escapes by default. Never use
      `dangerouslySetInnerHTML` with unsanitized user content.</rule>
    <rule>Outbound fetch never uses a URL built from user input without
      an allowlist of domains/schemes.</rule>
  </non_negotiables>

  <secure_defaults>
    <input_validation>
      - Zod strict mode (no excess properties)
      - Every string has min/max length
      - Every number has min/max range
      - Every array has a max size
      - Emails: z.string().email()
      - URLs: z.string().url() + explicit protocol check
      - UUIDs: z.string().uuid()
      - Enums: z.enum([...]) with literal allowed values
      - Wallet addresses: regex for Ethereum address format (0x + 40 hex chars)
    </input_validation>
    <html_output>
      - React: default JSX escaping is sufficient
      - Rich text / markdown: parse with a sandboxed library
      - dangerouslySetInnerHTML: wrapped in DOMPurify.sanitize with allowlist
    </html_output>
    <ssrf_protection>
      - Outbound fetch: allowlist of domains/schemes
      - Reject private IP ranges and localhost
      - Timeouts on every outbound call (default 5s)
    </ssrf_protection>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - `await fetch(userProvidedUrl)` with no allowlist
    - `new RegExp(userInput)` — ReDoS risk
    - `db.query(`select * from t where id = ${id}`)` — SQL injection
    - `dangerouslySetInnerHTML={{ __html: userHtml }}` with no sanitize
    - Zod schemas with `.passthrough()` on request bodies
    - Accepting raw JSON without schema validation
  </anti_patterns>

  <self_check>
    - [ ] Every endpoint has a Zod schema on the body/query/params
    - [ ] No `.passthrough()` on request schemas
    - [ ] All dangerouslySetInnerHTML uses DOMPurify or equivalent
    - [ ] Outbound fetch URLs validated against an allowlist
    - [ ] No new RegExp with user input
    - [ ] No shell execution with user input anywhere
  </self_check>

</codexia_secure_io>
