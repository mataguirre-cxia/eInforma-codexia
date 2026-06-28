import { NextRequest, NextResponse } from 'next/server';
import { placeOutboundCall } from '@/lib/elevenlabs';

// POST /api/test-call → lanza UNA llamada de prueba del agente al número indicado.
// Body: { toNumber, nombre?, ultimo_informe?, precio_oferta?, oferta_url?, email? }
export async function POST(req: NextRequest) {
  try {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_AGENT_ID || !process.env.ELEVENLABS_PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: 'ElevenLabs no configurado (faltan ELEVENLABS_API_KEY / AGENT_ID / PHONE_NUMBER_ID)' },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const toNumber: string = String(body?.toNumber || '').trim();
    if (!toNumber) return NextResponse.json({ error: 'Falta el número de teléfono' }, { status: 400 });

    const result = await placeOutboundCall({
      toNumber,
      dynamicVariables: {
        nombre: body?.nombre || 'Sebastián',
        ultimo_informe: body?.ultimo_informe || 'Telefónica',
        precio_oferta: body?.precio_oferta || '19 €',
        oferta_url: body?.oferta_url || 'informa.es/oferta',
        email: body?.email || '',
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
