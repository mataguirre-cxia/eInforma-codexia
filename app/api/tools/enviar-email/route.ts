import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { enviarEmailOferta } from '@/lib/email';

// Tool del agente (Salida 2): envía el enlace de la oferta por email y registra consentimiento.
//   POST { contact_id }  (los datos de email/url/precio se leen del contacto)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const contactId: string | undefined = body?.contact_id;
    if (!contactId) return NextResponse.json({ error: 'falta contact_id' }, { status: 400 });

    const sb = supabaseAdmin();
    const { data: contact, error } = await sb
      .from('contacts')
      .select('nombre, email, oferta_url, precio_oferta')
      .eq('id', contactId)
      .single();
    if (error || !contact) return NextResponse.json({ error: 'contacto no encontrado' }, { status: 404 });

    // Permitir override desde el body (ej. si el usuario dio otro email en la llamada)
    const to = body?.email || contact.email;
    const ofertaUrl = body?.oferta_url || contact.oferta_url;
    if (!to) return NextResponse.json({ error: 'sin email' }, { status: 400 });
    if (!ofertaUrl) return NextResponse.json({ error: 'sin oferta_url' }, { status: 400 });

    const result = await enviarEmailOferta({
      to,
      nombre: contact.nombre || undefined,
      ofertaUrl,
      precioOferta: contact.precio_oferta || undefined,
    });

    // Registra el resultado como "email" (consentimiento + envío)
    await sb
      .from('calls')
      .update({
        resultado: 'email',
        contactado: true,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', contactId);

    return NextResponse.json({ ok: true, email_sent: result.sent, reason: result.reason });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
