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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="size-4" />
          </div>
          <span className="text-lg font-bold">InterviewAce</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isLoading && user ? (
            <>
              <div className="hidden items-center gap-3 rounded-lg border border-border/60 bg-card/70 px-3 py-2 sm:flex">
                <UserCircle2 className="size-4 text-primary" />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {user.fullName || 'Candidate'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href={isAdmin ? '/admin' : '/dashboard'}>
                  <LayoutDashboard className="size-3.5" />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => void handleSignOut()}>
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/login">
                  <LogIn className="size-3.5" />
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-2">
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
