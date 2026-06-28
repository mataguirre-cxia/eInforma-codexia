import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { enviarEmailOferta } from '@/lib/email';
import { verifyWebhook } from '@/lib/webhook-auth';

// Tool del agente (Salida 2): envía el enlace de la oferta por email y registra consentimiento.
// El destino SIEMPRE es el email almacenado del contacto — nunca un email del body
// (evita usar nuestro remitente para enviar a direcciones arbitrarias).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const Body = z.object({ contact_id: z.string().regex(UUID) }).strict();

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
  const { contact_id } = parsed.data;

  try {
    const sb = supabaseAdmin();
    const { data: contact, error } = await sb
      .from('contacts')
      .select('nombre, email, oferta_url, precio_oferta')
      .eq('id', contact_id)
      .single();
    if (error || !contact) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    if (!contact.email) return NextResponse.json({ error: 'sin_email' }, { status: 422 });
    if (!contact.oferta_url) return NextResponse.json({ error: 'sin_oferta_url' }, { status: 422 });

    const result = await enviarEmailOferta({
      to: contact.email,
      nombre: contact.nombre || undefined,
      ofertaUrl: contact.oferta_url,
      precioOferta: contact.precio_oferta || undefined,
    });

    await sb
      .from('calls')
      .update({ resultado: 'email', contactado: true, status: 'completed', updated_at: new Date().toISOString() })
      .eq('contact_id', contact_id);

    return NextResponse.json({ ok: true, email_sent: result.sent });
  } catch (e) {
    console.error('[api/tools/enviar-email]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
