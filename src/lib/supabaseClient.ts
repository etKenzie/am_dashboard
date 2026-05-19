import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const sharedAuthOptions = {
  persistSession: true,
  storageKey: 'am-dashboard-auth',
  autoRefreshToken: true,
  flowType: 'pkce' as const,
  debug: false,
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...sharedAuthOptions,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'am-dashboard',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export const supabaseForPasswordReset = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...sharedAuthOptions,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'am-dashboard',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
