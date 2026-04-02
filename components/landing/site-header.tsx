'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, LayoutDashboard, LogIn, LogOut, UserPlus, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function SiteHeader() {
  const router = useRouter()
  const { user, isLoading, isAdmin, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <div className="highlight-ring flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Brain className="size-4" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">InterviewAce</span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Practice studio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isLoading && user ? (
            <>
              <div className="soft-panel hidden items-center gap-3 rounded-2xl px-4 py-2.5 sm:flex">
                <UserCircle2 className="size-4 text-primary" />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {user.fullName || 'Candidate'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-2 rounded-xl">
                <Link href={isAdmin ? '/admin' : '/dashboard'}>
                  <LayoutDashboard className="size-3.5" />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl" onClick={() => void handleSignOut()}>
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2 rounded-xl">
                <Link href="/login">
                  <LogIn className="size-3.5" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2 rounded-xl px-4">
                <Link href="/signup">
                  <UserPlus className="size-3.5" />
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
