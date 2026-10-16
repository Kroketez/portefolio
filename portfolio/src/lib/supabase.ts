import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// null when the project is not configured: the app then runs in demo mode.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
