// Compat: mantiene `supabaseAdmin()` (service-role, solo servidor).
// Para auth/sesión usa @/lib/supabase/server (SSR) y para navegador @/lib/supabase/client.
export { createAdminClient as supabaseAdmin } from './supabase/server';
