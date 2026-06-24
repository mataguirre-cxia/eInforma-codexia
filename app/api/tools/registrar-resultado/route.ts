import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Resultado } from '@/lib/types';

// Tool del agente: registra el desenlace de la llamada.
// El agente la invoca al final de cada salida:
//   POST { contact_id, resultado, conversation_id?, duration_seconds? }
const VALID: Resultado[] = ['conversion', 'email', 'transferido', 'no_interesado', 'sin_contacto'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const contactId: string | undefined = body?.contact_id;
    const resultado = body?.resultado as Resultado | undefined;

    if (!contactId) return NextResponse.json({ error: 'falta contact_id' }, { status: 400 });
    if (!resultado || !VALID.includes(resultado)) {
      return NextResponse.json({ error: `resultado inválido (${VALID.join(', ')})` }, { status: 400 });
    }

    const contactado = resultado !== 'sin_contacto';
    const sb = supabaseAdmin();
    const { error } = await sb
      .from('calls')
      .update({
        resultado,
        contactado,
        status: 'completed',
        elevenlabs_conversation_id: body?.conversation_id ?? null,
        duration_seconds: body?.duration_seconds ?? null,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', contactId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
