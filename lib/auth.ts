import { getSupabase } from './supabase'

export type UserRole = 'user' | 'admin'

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  adminCode?: string
): Promise<{ error: string | null }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      role,
      adminCode,
    }),
  })

  const result = (await response.json()) as { error?: string | null }
  return { error: result.error ?? null }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null; role: UserRole | null }> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message, role: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  return { error: null, role: (profile?.role as UserRole) ?? 'user' }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  await supabase.auth.signOut()
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (data?.role as UserRole) ?? null
}

export async function getCurrentUser() {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
