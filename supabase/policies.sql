-- RLS para el POC de eInforma. Ejecutar en el SQL Editor de Supabase.
--
-- Modelo: herramienta interna (operadores de eInforma/Codexia). No hay aislamiento
-- por tenant; cualquier usuario AUTENTICADO tiene acceso completo. El rol `anon`
-- queda denegado por defecto (RLS niega si no hay policy que lo permita).
-- El service-role (usado por los webhooks del agente en el servidor) BYPASEA RLS
-- por diseño, así que las tools y el webhook post-llamada siguen funcionando.

alter table public.campaigns enable row level security;
alter table public.contacts  enable row level security;
alter table public.calls     enable row level security;

-- campaigns
drop policy if exists "operadores acceso total" on public.campaigns;
create policy "operadores acceso total" on public.campaigns
  for all to authenticated using (true) with check (true);

-- contacts
drop policy if exists "operadores acceso total" on public.contacts;
create policy "operadores acceso total" on public.contacts
  for all to authenticated using (true) with check (true);

-- calls
drop policy if exists "operadores acceso total" on public.calls;
create policy "operadores acceso total" on public.calls
  for all to authenticated using (true) with check (true);

-- incidencias: las escribe el agente vía service-role (bypasea RLS); los operadores
-- solo las LEEN. Sin policy de insert/update/delete → nadie con la anon key puede
-- crearlas ni alterarlas (patrón audit_log).
alter table public.incidencias enable row level security;
drop policy if exists "operadores leen incidencias" on public.incidencias;
create policy "operadores leen incidencias" on public.incidencias
  for select to authenticated using (true);

-- Nota: el dashboard lee con service-role en el servidor; el cliente de navegador
-- (Realtime de /llamadas y dashboard) usa la sesión autenticada, cubierta por las
-- policies de arriba. `anon` no tiene policy → sin acceso vía la anon key.
