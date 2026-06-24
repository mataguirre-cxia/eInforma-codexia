// Envío de email (Salida 2: el usuario acepta recibir el enlace por correo).
// Usa Resend. Si no hay RESEND_API_KEY, no falla: registra y devuelve "skipped".

export async function enviarEmailOferta(opts: {
  to: string;
  nombre?: string;
  ofertaUrl: string;
  precioOferta?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'RESEND_API_KEY no configurada' };
  if (!opts.to) return { sent: false, reason: 'sin email destino' };

  const from = process.env.EMAIL_FROM || 'eInforma <noreply@informa.es>';
  const nombre = opts.nombre || '';
  const html = `
    <p>Hola ${nombre},</p>
    <p>Como acordamos en la llamada, aquí tienes tu enlace con la oferta de bienvenida${
      opts.precioOferta ? ` (${opts.precioOferta})` : ''
    }:</p>
    <p><a href="${opts.ofertaUrl}">${opts.ofertaUrl}</a></p>
    <p>Un saludo,<br/>Equipo eInforma</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: 'Tu oferta de eInforma',
      html,
    }),
  });

  if (!res.ok) return { sent: false, reason: `Resend ${res.status}: ${await res.text()}` };
  return { sent: true };
}
