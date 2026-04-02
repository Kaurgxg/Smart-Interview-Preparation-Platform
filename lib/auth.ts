// lib/auth.ts
import { getSupabase } from './supabase'

export type UserRole = 'user' | 'admin'

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE ?? 'ADMIN2024'

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  adminCode?: string
): Promise<{ error: string | null }> {
  // Validate admin code
  if (role === 'admin') {
    if (!adminCode || adminCode !== ADMIN_SECRET) {
      return { error: 'Invalid admin code. Please contact your administrator.' }
    }
  }

  const supabase = getSupabase()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
    },
  })

  if (error) return { error: error.message }
  return { error: null }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null; role: UserRole | null }> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message, role: null }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  return { error: null, role: (profile?.role as UserRole) ?? 'user' }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

// ─── Get current user role ────────────────────────────────────────────────────
export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (data?.role as UserRole) ?? null
}

// ─── Get current user ─────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}