import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhook } from '@/lib/webhook-auth';

// Tool del agente: registra una pregunta del usuario para la que Nina no tenía
// respuesta preparada. Sirve para ir puliendo el guión durante el piloto.
// El endpoint es PÚBLICO → verifica firma antes de escribir. `pregunta` puede
// contener habla del usuario (PII): nunca se loguea su contenido.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const Body = z
  .object({
    contact_id: z.string().regex(UUID),
    pregunta: z.string().trim().min(1).max(1000),
    conversation_id: z.string().max(200).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(req, raw).ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let json: unknown;
  try {
    json = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  const { contact_id, pregunta, conversation_id } = parsed.data;

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('incidencias').insert({
      contact_id,
      pregunta,
      conversation_id: conversation_id ?? null,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Nunca logar el contenido de `pregunta` (PII).
    console.error('[api/tools/registrar-incidencia]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
