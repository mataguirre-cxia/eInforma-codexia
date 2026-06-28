// Envío de email (Salida 2: el usuario acepta recibir el enlace por correo).
// Usa Resend. Si no hay RESEND_API_KEY, no falla: registra y devuelve "skipped".

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPE[c]);
}

// Normaliza y valida la URL: solo http/https. Devuelve null si no es válida.
function safeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function enviarEmailOferta(opts: {
  to: string;
  nombre?: string;
  ofertaUrl: string;
  precioOferta?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'email_not_configured' };
  if (!opts.to) return { sent: false, reason: 'no_recipient' };

  const url = safeUrl(opts.ofertaUrl);
  if (!url) return { sent: false, reason: 'invalid_offer_url' };

  const from = process.env.EMAIL_FROM || 'eInforma <noreply@informa.es>';
  const nombre = esc(opts.nombre || '');
  const precio = opts.precioOferta ? ` (${esc(opts.precioOferta)})` : '';
  const urlSafe = esc(url);
  const html = `
    <p>Hola ${nombre},</p>
    <p>Como acordamos en la llamada, aquí tienes tu enlace con la oferta de bienvenida${precio}:</p>
    <p><a href="${urlSafe}">${urlSafe}</a></p>
    <p>Un saludo,<br/>Equipo eInforma</p>
  `;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: opts.to, subject: 'Tu oferta de eInforma', html }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[email] resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return { sent: false, reason: 'email_send_failed' };
    }
    return { sent: true };
  } catch (e) {
    console.error('[email] request failed:', e instanceof Error ? e.message : e);
    return { sent: false, reason: 'email_send_failed' };
  } finally {
    clearTimeout(timer);
  }
}
