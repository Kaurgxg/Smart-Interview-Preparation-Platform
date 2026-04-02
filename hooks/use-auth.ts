// hooks/use-auth.ts
'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/auth'

interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
}

interface UseAuthReturn {
  user: AuthUser | null
  role: UserRole | null
  isAdmin: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()

    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setUser(null); setIsLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser({
        id: authUser.id,
        email: authUser.email ?? '',
        fullName: profile?.full_name ?? '',
        role: profile?.role ?? 'user',
      })
      setIsLoading(false)
    }

    loadUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    role: user?.role ?? null,
    isAdmin: user?.role === 'admin',
    isLoading,
    signOut,
  }
}