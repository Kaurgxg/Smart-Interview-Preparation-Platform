import { getSupabase } from './supabase'

export type UserRole = 'user' | 'admin'

function getRoleFromMetadata(metadata: unknown): UserRole {
  if (
    metadata &&
    typeof metadata === 'object' &&
    'role' in metadata &&
    metadata.role === 'admin'
  ) {
    return 'admin'
  }

  return 'user'
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  adminCode?: string
): Promise<{ error: string | null }> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        adminCode: adminCode?.trim(),
      }),
    })

    const result = (await response.json()) as { error?: string | null }
    return { error: result.error ?? null }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to sign up right now. Please try again.',
    }
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null; role: UserRole | null }> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message, role: null }

  let role = getRoleFromMetadata(data.user.user_metadata)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profile?.role === 'admin' || profile?.role === 'user') {
    role = profile.role as UserRole
  }

  return { error: null, role }
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

  const fallbackRole = getRoleFromMetadata(user.user_metadata)

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return (data?.role as UserRole) ?? fallbackRole
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
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? '',
    full_name:
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : ''),
    role: profile?.role ?? getRoleFromMetadata(user.user_metadata),
    ...profile,
  }
}
