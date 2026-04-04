'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Brain, Mic, Shield, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError, role: userRole } = await signIn(email.trim(), password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    router.replace(userRole === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="page-shell flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-white/8 bg-white/4 p-12 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="highlight-ring flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight">InterviewAce</span>
            <span className="block text-xs uppercase tracking-[0.26em] text-muted-foreground">
              Candidate workspace
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="size-4" />
            Built for repeat practice
          </div>

          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
              Walk into interviews with a sharper answer for every round.
            </h1>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Practice with AI-driven interview sessions, review what you missed,
              and keep your progress visible in one place.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              {
                icon: <Mic className="size-4" />,
                text: 'Voice-based AI interviews with live answer capture',
              },
              {
                icon: <Brain className="size-4" />,
                text: 'Per-question evaluation across relevance, keywords, and confidence',
              },
              {
                icon: <Shield className="size-4" />,
                text: 'Private dashboards for attempts, scores, and recent practice history',
              },
            ].map((item) => (
              <div
                key={item.text}
                className="soft-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} InterviewAce. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="section-shell w-full max-w-md space-y-8 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="highlight-ring flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="font-bold">InterviewAce</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue your interview practice
            </p>
          </div>

          <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/4 p-1">
            {(['user', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                  role === r
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'admin' ? (
                  <Shield className="size-3.5" />
                ) : (
                  <Brain className="size-3.5" />
                )}
                {r === 'user' ? 'Candidate' : 'Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 pr-10 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign in as ${role === 'admin' ? 'Admin' : 'Candidate'}`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

