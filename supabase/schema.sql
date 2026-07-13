-- ============================================
-- eInforma — Agente de voz POC · Esquema de datos
-- Modelo: campañas → contactos → llamadas (con resultado)
-- ============================================

-- Campañas (cada fichero CSV que procesamos = una campaña)
create table if not exists campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  status      text not null default 'draft', -- draft | running | completed
  total_contacts int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Contactos a llamar (cargados desde el CSV de eInforma)
create table if not exists contacts (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references campaigns(id) on delete cascade,
  nombre         text,
  telefono       text not null,
  email          text,
  cif            text,
  ultimo_informe text,            -- gancho de contexto (ej. "Telefónica")
  num_informes   int,
  oferta_url     text,            -- URL personalizada (Salida 1)
  precio_oferta  text,            -- ej. "19 €"
  created_at     timestamptz default now()
);
create index if not exists idx_contacts_campaign on contacts(campaign_id);

-- Llamadas (una por contacto; guarda el desenlace y métricas)
create table if not exists calls (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references campaigns(id) on delete cascade,
  contact_id        uuid not null references contacts(id) on delete cascade,
  status            text not null default 'queued', -- queued | in_progress | completed | failed | no_answer
  contactado        boolean default false,          -- métrica: contactado sí/no
  resultado         text,                           -- conversion | email | transferido | callback | no_interesado | sin_contacto
  duration_seconds  int,
  elevenlabs_conversation_id text,                  -- id de la conversación en ElevenLabs
  transcript        text,
  recording_url     text,
  error             text,
  started_at        timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists idx_calls_campaign on calls(campaign_id);
create index if not exists idx_calls_contact on calls(contact_id);
create index if not exists idx_calls_resultado on calls(resultado);

-- Incidencias: preguntas del usuario sin respuesta preparada. El agente las
-- registra durante la llamada (tool registrar_incidencia) para ir puliendo el
-- guión durante el piloto. `pregunta` puede contener habla del usuario (PII):
-- se muestra escapada en el panel y nunca se loguea.
create table if not exists incidencias (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid references contacts(id) on delete cascade,
  conversation_id text,                              -- id de la conversación en ElevenLabs
  pregunta     text not null,
  created_at   timestamptz default now()
);
create index if not exists idx_incidencias_created on incidencias(created_at desc);
create index if not exists idx_incidencias_contact on incidencias(contact_id);

-- Vista de métricas por campaña (para el dashboard)
create or replace view campaign_metrics as
select
  c.id as campaign_id,
  c.name,
  count(ca.id)                                              as total_llamadas,
  count(ca.id) filter (where ca.contactado)                as contactadas,
  count(ca.id) filter (where ca.resultado = 'conversion')  as conversiones,
  count(ca.id) filter (where ca.resultado = 'email')       as emails,
  count(ca.id) filter (where ca.resultado = 'transferido') as transferidas,
  count(ca.id) filter (where ca.resultado = 'no_interesado') as no_interesados,
  coalesce(avg(ca.duration_seconds) filter (where ca.contactado), 0)::int as duracion_media_seg
from campaigns c
left join calls ca on ca.campaign_id = c.id
group by c.id, c.name;
