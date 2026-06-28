import crypto from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verifica que un webhook (tools del agente o post-llamada de ElevenLabs)
 * proviene de un origen de confianza, ANTES de procesar el cuerpo.
 *
 * Acepta dos esquemas, usando WEBHOOK_SHARED_SECRET:
 *  - Cabecera compartida `x-webhook-secret` (configurada en cada tool de ElevenLabs).
 *  - Firma HMAC de ElevenLabs `elevenlabs-signature` (`t=...,v0=...`) sobre `t.body`.
 *
 * Posture POC: si NO hay secreto configurado, no bloquea (devuelve enforced:false)
 * para no romper el entorno aún sin configurar — pero lo registra. Antes de campañas
 * reales: definir WEBHOOK_SHARED_SECRET y añadir la cabecera en ElevenLabs.
 */
export function verifyWebhook(req: Request, rawBody: string): { ok: boolean; enforced: boolean } {
  const secret = process.env.WEBHOOK_SHARED_SECRET;
  if (!secret) {
    console.warn('[webhook] WEBHOOK_SHARED_SECRET no configurado — webhook sin verificar');
    return { ok: true, enforced: false };
  }

  // 1) Cabecera compartida
  const shared = req.headers.get('x-webhook-secret');
  if (shared && safeEqual(shared, secret)) return { ok: true, enforced: true };

  // 2) Firma HMAC de ElevenLabs
  const sig = req.headers.get('elevenlabs-signature');
  if (sig) {
    const parts = Object.fromEntries(sig.split(',').map((p) => p.split('=') as [string, string]));
    const t = parts['t'];
    const v0 = parts['v0'];
    if (t && v0) {
      const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
      if (safeEqual(v0, expected)) return { ok: true, enforced: true };
    }
  }

  return { ok: false, enforced: true };
}
