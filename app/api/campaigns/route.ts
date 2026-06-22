import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { submitBatchCall, type BatchRecipient } from '@/lib/elevenlabs';

// POST /api/campaigns
// Body: { name, contacts: [{ nombre, telefono, email, cif, ultimo_informe, num_informes, oferta_url, precio_oferta }] }
// 1) crea campaña + contactos + llamadas (queued)  2) dispara batch calling en ElevenLabs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name: string = body?.name || 'POC eInforma';
    const contacts: Array<Record<string, unknown>> = Array.isArray(body?.contacts) ? body.contacts : [];

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No hay contactos' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 1) Campaña
    const { data: campaign, error: cErr } = await sb
      .from('campaigns')
      .insert({ name, status: 'running', total_contacts: contacts.length })
      .select('id')
      .single();
    if (cErr || !campaign) throw new Error(cErr?.message || 'No se pudo crear la campaña');

    // 2) Contactos
    const rows = contacts.map((c) => ({
      campaign_id: campaign.id,
      nombre: c.nombre ?? null,
      telefono: String(c.telefono ?? '').trim(),
      email: c.email ?? null,
      cif: c.cif ?? null,
      ultimo_informe: c.ultimo_informe ?? null,
      num_informes: c.num_informes ?? null,
      oferta_url: c.oferta_url ?? null,
      precio_oferta: c.precio_oferta ?? null,
    }));
    const { data: inserted, error: iErr } = await sb.from('contacts').insert(rows).select('*');
    if (iErr || !inserted) throw new Error(iErr?.message || 'No se pudieron insertar contactos');

    // 3) Llamadas (queued) — una por contacto
    await sb.from('calls').insert(
      inserted.map((ct) => ({ campaign_id: campaign.id, contact_id: ct.id, status: 'queued' })),
    );

    // 4) Disparar batch calling en ElevenLabs con variables dinámicas
    const recipients: BatchRecipient[] = inserted
      .filter((ct) => ct.telefono)
      .map((ct) => ({
        phone_number: ct.telefono,
        dynamic_variables: {
          nombre: ct.nombre ?? '',
          ultimo_informe: ct.ultimo_informe ?? '',
          num_informes: ct.num_informes ?? '',
          oferta_url: ct.oferta_url ?? '',
          precio_oferta: ct.precio_oferta ?? '',
          email: ct.email ?? '',
          contact_id: ct.id, // para casar el resultado en el webhook
        },
      }));

    let batchId: string | null = null;
    if (process.env.ELEVENLABS_API_KEY) {
      const batch = await submitBatchCall({ callName: name, recipients });
      batchId = batch.id;
    }

    return NextResponse.json({
      ok: true,
      campaignId: campaign.id,
      contacts: inserted.length,
      batchId,
      note: batchId ? undefined : 'ELEVENLABS_API_KEY no configurada: contactos cargados, batch no disparado.',
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
