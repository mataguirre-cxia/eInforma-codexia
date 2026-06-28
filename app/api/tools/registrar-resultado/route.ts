import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhook } from '@/lib/webhook-auth';

// Tool del agente: registra el desenlace de la llamada. Llamado por ElevenLabs.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const Body = z
  .object({
    contact_id: z.string().regex(UUID),
    resultado: z.enum(['conversion', 'email', 'transferido', 'no_interesado', 'sin_contacto']),
    conversation_id: z.string().max(200).optional(),
    duration_seconds: z.number().int().nonnegative().max(36000).optional(),
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
  const { contact_id, resultado, conversation_id, duration_seconds } = parsed.data;

  try {
    const sb = supabaseAdmin();
    const { error } = await sb
      .from('calls')
      .update({
        resultado,
        contactado: resultado !== 'sin_contacto',
        status: 'completed',
        elevenlabs_conversation_id: conversation_id ?? null,
        duration_seconds: duration_seconds ?? null,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', contact_id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/tools/registrar-resultado]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
