// Rate limiter en memoria (best-effort). Suficiente para proteger acciones
// caras en el POC (p. ej. lanzar llamadas). En producción serverless conviene
// Upstash Redis con sliding window (ver backlog en CLAUDE.md).
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
