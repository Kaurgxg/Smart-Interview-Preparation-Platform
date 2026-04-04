'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type UseProtectedRouteOptions = {
  requireAdmin?: boolean
  redirectTo?: string
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { requireAdmin = false, redirectTo = '/login' } = options
  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    if (auth.isLoading) {
      return
    }

    if (!auth.user) {
      router.replace(redirectTo)
      return
    }

    if (requireAdmin && !auth.isAdmin) {
      router.replace('/dashboard')
    }
  }, [auth.isAdmin, auth.isLoading, auth.user, redirectTo, requireAdmin, router])

  return auth
}
