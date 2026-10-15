import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase.js'

const supabaseConfig = (typeof window !== 'undefined' ? window.__SUPABASE_CONFIG__ : null) || {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
}

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey)

let clientPromise

export async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) =>
      createClient(supabaseConfig.url, supabaseConfig.anonKey),
    )
  }
  return clientPromise
}
