import { supabaseAdmin } from './supabase';
import { DEMO_DASHBOARD, DEMO_CALLS } from './demo-data';
import type { DashboardData, Campaign, CampaignMetrics, CallRow, CallDetail } from './types';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Lista de campañas (vacía si no hay Supabase). */
export async function getCampaigns(): Promise<Campaign[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('campaigns')
    .select('id, name, status, total_contacts, created_at')
    .order('created_at', { ascending: false });
  return (data as Campaign[]) || [];
}

/**
 * Datos del dashboard. Si Supabase no está configurado o la campaña no tiene
 * datos, devuelve los datos demo (para que las pantallas siempre se vean).
 */
export async function getDashboardData(campaignId?: string): Promise<DashboardData> {
  if (!isSupabaseConfigured()) return DEMO_DASHBOARD;

  try {
    const sb = supabaseAdmin();

    // Campaña: la indicada o la más reciente
    let campaign: { id: string; name: string } | null = null;
    if (campaignId) {
      const { data } = await sb.from('campaigns').select('id, name').eq('id', campaignId).single();
      campaign = data;
    } else {
      const { data } = await sb
        .from('campaigns')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      campaign = data;
    }
    if (!campaign) return DEMO_DASHBOARD;

    const { data: metrics } = await sb
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaign.id)
      .maybeSingle();

    // Llamadas recientes con el nombre/informe del contacto
    const { data: callsRaw } = await sb
      .from('calls')
      .select('resultado, duration_seconds, updated_at, contacts(nombre, ultimo_informe)')
      .eq('campaign_id', campaign.id)
      .order('updated_at', { ascending: false })
      .limit(8);

    const recientes: CallRow[] = (callsRaw || []).map((c: Record<string, unknown>) => {
      const ct = (c.contacts as { nombre?: string; ultimo_informe?: string } | null) || null;
      return {
        nombre: ct?.nombre || '—',
        ultimo_informe: ct?.ultimo_informe || null,
        resultado: (c.resultado as CallRow['resultado']) ?? null,
        duration_seconds: (c.duration_seconds as number) ?? null,
      };
    });

    return {
      campaign,
      metrics: (metrics as CampaignMetrics) || null,
      recientes,
      isDemo: false,
    };
  } catch {
    // Cualquier error de conexión → demo, para no romper la pantalla
    return DEMO_DASHBOARD;
  }
}

/** Llamadas con grabación + transcripción. Fallback a demo si no hay Supabase/datos. */
export async function getCallsDetailed(): Promise<{ calls: CallDetail[]; isDemo: boolean }> {
  if (!isSupabaseConfigured()) return { calls: DEMO_CALLS, isDemo: true };
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('calls')
      .select('id, resultado, duration_seconds, recording_url, transcript, updated_at, contacts(nombre, ultimo_informe)')
      .order('updated_at', { ascending: false })
      .limit(30);

    const calls: CallDetail[] = (data || []).map((c: Record<string, unknown>) => {
      const ct = (c.contacts as { nombre?: string; ultimo_informe?: string } | null) || null;
      return {
        id: String(c.id),
        nombre: ct?.nombre || '—',
        ultimo_informe: ct?.ultimo_informe || null,
        resultado: (c.resultado as CallDetail['resultado']) ?? null,
        duration_seconds: (c.duration_seconds as number) ?? null,
        recording_url: (c.recording_url as string) ?? null,
        transcript: (c.transcript as string) ?? null,
      };
    });

    if (calls.length === 0) return { calls: DEMO_CALLS, isDemo: true };
    return { calls, isDemo: false };
  } catch {
    return { calls: DEMO_CALLS, isDemo: true };
  }
}
