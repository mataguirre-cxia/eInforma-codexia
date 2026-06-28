import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiter con Upstash Redis (sliding window) cuando está configurado
// (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN). Si no, cae a un limiter
// en memoria best-effort (válido solo en un único proceso / dev).

const limiters = new Map<string, Ratelimit>();

function upstash(limit: number, windowSec: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const key = `${limit}:${windowSec}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: 'einforma-rl',
    });
    limiters.set(key, l);
  }
  return l;
}

const memory = new Map<string, number[]>();
function memoryAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);
  return true;
}

/** true si la petición está dentro del límite; false si hay que rechazar (429). */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const l = upstash(limit, windowSec);
  if (l) {
    const { success } = await l.limit(key);
    return success;
  }
  return memoryAllow(key, limit, windowSec * 1000);
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
