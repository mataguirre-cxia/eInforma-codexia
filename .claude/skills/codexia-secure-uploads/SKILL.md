<codexia_secure_uploads>

  <identity>
    You are implementing file uploads. In TokenState this primarily
    means KYC documents (DNI, passport, proof of address). These are
    highly sensitive identity documents. Default to paranoia.
  </identity>

  <non_negotiables>
    <rule>Uploads are stored in Supabase Storage (object storage),
      never on the web server filesystem.</rule>
    <rule>The KYC bucket is private. Access only via signed URLs
      with short TTL (15 min). Never public.</rule>
    <rule>Filename from the user is never used as storage key.
      Generate a UUID + extension server-side.</rule>
    <rule>MIME type from the client is untrusted. Check the magic
      bytes server-side.</rule>
    <rule>File size limited at: HTTP body size (proxy), request
      handler, and storage policy. Three layers.</rule>
  </non_negotiables>

  <secure_defaults>
    <allowlist>
      - KYC documents: image/jpeg, image/png, application/pdf only
      - Size cap: 10MB per document
      - Extensions derived from verified MIME, never from filename
    </allowlist>
    <verification>
      - Magic-byte check server-side with file-type npm package
      - If image: re-encode with sharp to strip EXIF metadata
      - If PDF: do not render inline; download only
    </verification>
    <storage>
      - Key: kyc/{investor_id}/{uuid}.{ext}
      - Bucket: private, RLS enforced (investor sees only their own files)
      - Metadata: original_filename stored as metadata only
      - Access: signed URLs with 15 min TTL
    </storage>
    <serving>
      - Content-Disposition: attachment on all KYC document downloads
      - X-Content-Type-Options: nosniff
      - Never serve KYC documents from the app's main origin
    </serving>
  </secure_defaults>

  <anti_patterns>
    REJECT and flag:
    - Using filename from upload as storage key
    - Trusting Content-Type header from the client
    - KYC bucket accessible without signed URL
    - Accepting all MIME types
    - No size limit, or size limit only in the frontend
    - SVG uploads (XSS risk)
    - Serving KYC documents from the app's main domain
  </anti_patterns>

  <self_check>
    - [ ] Storage key is server-generated UUID, not user filename
    - [ ] MIME allowlist enforced with magic-byte verification
    - [ ] Size cap enforced server-side
    - [ ] Files served via signed URL from private bucket
    - [ ] Image uploads re-encoded to strip EXIF metadata
    - [ ] Content-Disposition: attachment on downloads
    - [ ] RLS on storage bucket: investor sees only their files
    - [ ] Test: unaccepted MIME, oversized file, spoofed Content-Type
  </self_check>

</codexia_secure_uploads>
