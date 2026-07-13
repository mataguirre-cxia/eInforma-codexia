import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { placeOutboundCall } from '@/lib/elevenlabs';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/auth-guard';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { TEST_CAMPAIGN_NAME } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// POST /api/test-call → lanza UNA llamada de prueba del agente (solo operador).
// Crea un contacto real en una campaña "Pruebas" aislada para tener un contact_id
// válido: así los tools del agente (registrar_resultado / enviar_email /
// registrar_incidencia) y el webhook post-llamada persisten de verdad, y la prueba
// funciona de punta a punta. Envía además TODAS las variables dinámicas que el agente
// referencia — si falta alguna, ElevenLabs aborta la conversación (la llamada se corta).
const Body = z
  .object({
    toNumber: z.string().trim().regex(/^\+?[0-9\s().-]{6,20}$/),
    nombre: z.string().max(120).optional(),
    ultimo_informe: z.string().max(120).optional(),
    num_informes: z.string().max(10).optional(),
    precio_oferta: z.string().max(40).optional(),
    oferta_url: z.string().max(300).optional(),
    email: z.string().max(254).optional(),
  })
  .strict();

// Reutiliza una única campaña "Pruebas" (no crea una nueva por llamada). Se excluye
// del dashboard en getDashboardData, pero sus llamadas sí se ven en /llamadas.
async function getOrCreateTestCampaign(sb: SupabaseClient): Promise<string> {
  const { data: existing } = await sb
    .from('campaigns')
    .select('id')
    .eq('name', TEST_CAMPAIGN_NAME)
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error } = await sb
    .from('campaigns')
    .insert({ name: TEST_CAMPAIGN_NAME, status: 'running', total_contacts: 0 })
    .select('id')
    .single();
  if (error || !created) throw new Error(error?.message || 'test campaign insert failed');
  return created.id;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // Las llamadas salientes cuestan dinero → límite estricto por IP (5 / 5 min).
  if (!(await rateLimit(`test-call:${clientIp(req)}`, 5, 300))) {
    return NextResponse.json({ error: 'too_many_requests' }, { status: 429 });
  }

  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_AGENT_ID || !process.env.ELEVENLABS_PHONE_NUMBER_ID) {
    return NextResponse.json({ error: 'ElevenLabs no configurado' }, { status: 400 });
  }

  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    const d = parsed.data;

    // Valores efectivos (con defaults de demo si el operador deja algún campo vacío).
    const nombre = d.nombre || 'Sebastián';
    const ultimo_informe = d.ultimo_informe || 'Telefónica';
    const num_informes = d.num_informes || '';
    const precio_oferta = d.precio_oferta || '19 €';
    const oferta_url = d.oferta_url || 'informa.es/oferta';
    const email = d.email || '';

    // Crear contacto + llamada reales para tener un contact_id válido de punta a punta.
    const sb = supabaseAdmin();
    const campaignId = await getOrCreateTestCampaign(sb);
    const { data: contact, error: cErr } = await sb
      .from('contacts')
      .insert({
        campaign_id: campaignId,
        nombre,
        telefono: d.toNumber,
        email: email || null,
        ultimo_informe,
        num_informes: num_informes ? parseInt(num_informes, 10) || null : null,
        oferta_url,
        precio_oferta,
      })
      .select('id')
      .single();
    if (cErr || !contact) throw new Error(cErr?.message || 'contact insert failed');

    await sb.from('calls').insert({ campaign_id: campaignId, contact_id: contact.id, status: 'queued' });

    await placeOutboundCall({
      toNumber: d.toNumber,
      dynamicVariables: {
        nombre,
        ultimo_informe,
        num_informes,
        precio_oferta,
        oferta_url,
        email,
        contact_id: contact.id,
      },
    });

    await logAudit({
      action: 'test_call_placed',
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
      meta: { contact_id: contact.id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/test-call] POST', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
