import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Main browser client - this is what we'll use most for now
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Simple server client (for loaders / server functions in TanStack Start)
export const createServerSupabase = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)  // fallback for now
}

// Optional: Service role client (for admin tasks)
export const createServiceClient = () => {
  return createBrowserClient(
    supabaseUrl,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}