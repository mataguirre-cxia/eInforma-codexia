import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Resultado } from '@/lib/types';

// POST /api/seed → crea una campaña demo con contactos y llamadas (datos realistas)
// para que el dashboard muestre datos reales sin necesidad de hacer llamadas.
const DEMO = [
  { nombre: 'Sebastián G.', informe: 'Telefónica', resultado: 'conversion', dur: 161 },
  { nombre: 'María L.', informe: 'Orange', resultado: 'email', dur: 118 },
  { nombre: 'Javier R.', informe: 'Inditex', resultado: 'transferido', dur: 192 },
  { nombre: 'Ana P.', informe: 'Repsol', resultado: 'no_interesado', dur: 47 },
  { nombre: 'Carlos M.', informe: 'Iberdrola', resultado: 'conversion', dur: 125 },
  { nombre: 'Lucía F.', informe: 'Santander', resultado: 'email', dur: 99 },
  { nombre: 'Diego S.', informe: 'BBVA', resultado: 'no_interesado', dur: 38 },
  { nombre: 'Marta V.', informe: 'Naturgy', resultado: 'conversion', dur: 143 },
  { nombre: 'Pablo H.', informe: 'Ferrovial', resultado: 'sin_contacto', dur: 0 },
  { nombre: 'Elena R.', informe: 'Acciona', resultado: 'email', dur: 110 },
];

export async function POST() {
  try {
    const sb = supabaseAdmin();

    const { data: campaign, error: cErr } = await sb
      .from('campaigns')
      .insert({ name: 'POC eInforma — Demo', status: 'completed', total_contacts: DEMO.length })
      .select('id')
      .single();
    if (cErr || !campaign) throw new Error(cErr?.message || 'No se pudo crear campaña');

    for (const d of DEMO) {
      const { data: contact } = await sb
        .from('contacts')
        .insert({
          campaign_id: campaign.id,
          nombre: d.nombre,
          telefono: '+34600000000',
          email: 'demo@example.com',
          ultimo_informe: d.informe,
          oferta_url: 'informa.es/oferta',
          precio_oferta: '19 €',
        })
        .select('id')
        .single();
      if (!contact) continue;

      const resultado = d.resultado as Resultado;
      await sb.from('calls').insert({
        campaign_id: campaign.id,
        contact_id: contact.id,
        status: 'completed',
        contactado: resultado !== 'sin_contacto',
        resultado,
        duration_seconds: d.dur,
        ended_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, campaignId: campaign.id, contactos: DEMO.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
