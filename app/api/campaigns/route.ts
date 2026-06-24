import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { submitBatchCall, type BatchRecipient } from '@/lib/elevenlabs';

// Normaliza una fila del CSV a nuestro esquema, tolerando nombres de columna distintos.
function pick(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of Object.keys(row)) {
    const norm = k.trim().toLowerCase();
    if (keys.includes(norm)) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
    }
  }
  return null;
}

function normalizeContact(row: Record<string, unknown>) {
  return {
    nombre: pick(row, ['nombre', 'name', 'first_name', 'firstname']),
    telefono: pick(row, ['telefono', 'teléfono', 'phone', 'tel', 'movil', 'móvil']),
    email: pick(row, ['email', 'correo', 'e-mail', 'mail']),
    cif: pick(row, ['cif', 'nif', 'vat']),
    ultimo_informe: pick(row, ['ultimo_informe', 'último_informe', 'informe', 'last_report', 'report']),
    num_informes: pick(row, ['num_informes', 'numero_informes', 'informes', 'reports']),
    oferta_url: pick(row, ['oferta_url', 'url', 'oferta', 'link']),
    precio_oferta: pick(row, ['precio_oferta', 'precio', 'price', 'oferta_precio']),
  };
}

// GET /api/campaigns → lista de campañas
export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('campaigns')
      .select('id, name, status, total_contacts, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ campaigns: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

// POST /api/campaigns
// Body: { name, contacts: [...filas del CSV...] }
// 1) crea campaña + contactos + llamadas (queued)  2) dispara batch calling en ElevenLabs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name: string = body?.name?.trim() || 'POC eInforma';
    const rawContacts: Array<Record<string, unknown>> = Array.isArray(body?.contacts) ? body.contacts : [];

    const contacts = rawContacts.map(normalizeContact).filter((c) => c.telefono);
    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No hay contactos con teléfono válido' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    const { data: campaign, error: cErr } = await sb
      .from('campaigns')
      .insert({ name, status: 'running', total_contacts: contacts.length })
      .select('id')
      .single();
    if (cErr || !campaign) throw new Error(cErr?.message || 'No se pudo crear la campaña');

    const rows = contacts.map((c) => ({
      campaign_id: campaign.id,
      nombre: c.nombre,
      telefono: c.telefono!,
      email: c.email,
      cif: c.cif,
      ultimo_informe: c.ultimo_informe,
      num_informes: c.num_informes ? parseInt(c.num_informes, 10) || null : null,
      oferta_url: c.oferta_url,
      precio_oferta: c.precio_oferta,
    }));
    const { data: inserted, error: iErr } = await sb.from('contacts').insert(rows).select('*');
    if (iErr || !inserted) throw new Error(iErr?.message || 'No se pudieron insertar contactos');

    await sb.from('calls').insert(
      inserted.map((ct) => ({ campaign_id: campaign.id, contact_id: ct.id, status: 'queued' })),
    );

    // Disparar batch calling (solo si ElevenLabs está configurado)
    let batchId: string | null = null;
    let batchNote: string | undefined;
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_AGENT_ID) {
      const recipients: BatchRecipient[] = inserted.map((ct) => ({
        phone_number: ct.telefono,
        dynamic_variables: {
          nombre: ct.nombre ?? '',
          ultimo_informe: ct.ultimo_informe ?? '',
          num_informes: ct.num_informes ?? '',
          oferta_url: ct.oferta_url ?? '',
          precio_oferta: ct.precio_oferta ?? '',
          email: ct.email ?? '',
          contact_id: ct.id,
        },
      }));
      try {
        const batch = await submitBatchCall({ callName: name, recipients });
        batchId = batch.id;
      } catch (e) {
        batchNote = `Contactos cargados, pero el batch falló: ${e instanceof Error ? e.message : 'error'}`;
      }
    } else {
      batchNote = 'ElevenLabs no configurado: contactos cargados, batch no disparado.';
    }

    return NextResponse.json({ ok: true, campaignId: campaign.id, contacts: inserted.length, batchId, note: batchNote });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
