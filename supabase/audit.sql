-- Tabla de auditoría de acciones de operador. Ejecutar en el SQL Editor de Supabase.
-- Las inserciones las hace el servidor con service-role (bypassa RLS).
-- Lectura: operadores autenticados. `anon`: sin acceso.

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  action      text not null,
  actor_id    uuid,
  actor_email text,
  ip          text,
  meta        jsonb
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "operadores leen audit" on public.audit_log;
create policy "operadores leen audit" on public.audit_log
  for select to authenticated using (true);

-- Sin policy de insert/update/delete: solo el service-role (servidor) escribe.
