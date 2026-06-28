import { createAdminClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'campaign_created'
  | 'test_call_placed'
  | 'seed_run';

/**
 * Registra una acción de operador en `audit_log` (best-effort).
 * Escribe con service-role en el servidor. Nunca lanza: un fallo de
 * auditoría no debe romper el flujo principal.
 * No guardar PII de contactos en `meta` (solo ids/conteos/acción).
 */
export async function logAudit(entry: {
  action: AuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const sb = createAdminClient();
    await sb.from('audit_log').insert({
      action: entry.action,
      actor_id: entry.actorId ?? null,
      actor_email: entry.actorEmail ?? null,
      ip: entry.ip ?? null,
      meta: entry.meta ?? null,
    });
  } catch (e) {
    console.error('[audit] insert failed', e instanceof Error ? e.message : e);
  }
}
