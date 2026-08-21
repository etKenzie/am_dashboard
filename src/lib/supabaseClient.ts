import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'am-dashboard-auth',
    autoRefreshToken: true,
    flowType: 'pkce',
    detectSessionInUrl: false,
    debug: false,
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

/**
 * Dedicated client for password recovery.
 * Must be used for BOTH resetPasswordForEmail and code/token exchange so the
 * PKCE code_verifier is stored and read from the same storage key.
 */
export const supabaseForPasswordReset = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'am-dashboard-auth-reset',
    autoRefreshToken: true,
    flowType: 'pkce',
    // Manual handling on /auth/reset-password — avoid racing auto-exchange.
    detectSessionInUrl: false,
    debug: false,
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
