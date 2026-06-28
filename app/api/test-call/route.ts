import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { placeOutboundCall } from '@/lib/elevenlabs';
import { getSessionUser } from '@/lib/auth-guard';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

// POST /api/test-call → lanza UNA llamada de prueba del agente (solo operador).
const Body = z
  .object({
    toNumber: z.string().trim().regex(/^\+?[0-9\s().-]{6,20}$/),
    nombre: z.string().max(120).optional(),
    ultimo_informe: z.string().max(120).optional(),
    precio_oferta: z.string().max(40).optional(),
    oferta_url: z.string().max(300).optional(),
    email: z.string().max(254).optional(),
  })
  .strict();

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

    await placeOutboundCall({
      toNumber: d.toNumber,
      dynamicVariables: {
        nombre: d.nombre || 'Sebastián',
        ultimo_informe: d.ultimo_informe || 'Telefónica',
        precio_oferta: d.precio_oferta || '19 €',
        oferta_url: d.oferta_url || 'informa.es/oferta',
        email: d.email || '',
      },
    });

    await logAudit({ action: 'test_call_placed', actorId: user.id, actorEmail: user.email, ip: clientIp(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/test-call] POST', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
