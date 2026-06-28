'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Suscripción Realtime: cuando cambian las llamadas de la campaña, refresca el dashboard.
export default function LiveRefresher({ campaignId }: { campaignId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`calls-${campaignId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calls', filter: `campaign_id=eq.${campaignId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, router]);

  return null;
}
