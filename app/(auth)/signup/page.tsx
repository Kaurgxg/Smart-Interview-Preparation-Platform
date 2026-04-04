'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { Brain, Shield, Eye, EyeOff, Loader2, KeyRound, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error: authError } = await signUp(
      email,
      password,
      fullName,
      role,
      adminCode
    )

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center bg-background p-6">
        <div className="section-shell w-full max-w-md space-y-5 rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/12">
            <Brain className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Open it to
            activate your account, then come back here to sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
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
              Account setup
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="size-4" />
            Start your prep journey
          </div>

          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight">
              Create a workspace for better interview practice and cleaner progress tracking.
            </h1>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Candidates get private dashboards and practice history. Admins can manage
              modes, questions, and the live interview catalog.
            </p>
          </div>

          <div className="grid gap-3">
            <div
              className={`rounded-2xl border p-4 transition-colors ${
                role === 'user'
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-white/10 bg-white/4'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Brain className="size-4 text-primary" />
                Candidate account
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Practice interviews, review results, and monitor your own progress over time.
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 transition-colors ${
                role === 'admin'
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-white/10 bg-white/4'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Shield className="size-4 text-primary" />
                Admin account
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Manage live interview modes, add questions, and keep the candidate experience up to date.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} InterviewAce. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="section-shell w-full max-w-md space-y-7 rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="highlight-ring flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="font-bold">InterviewAce</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose your role and get started
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
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>

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
                  placeholder="Minimum 8 characters"
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

            {role === 'admin' && (
              <div className="space-y-1.5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <KeyRound className="size-3.5 text-primary" />
                  Admin Access Code
                </label>
                <input
                  type="password"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                  className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Contact your system administrator if you do not have this code.
                </p>
              </div>
            )}

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
                  Creating account...
                </>
              ) : (
                `Create ${role === 'admin' ? 'Admin' : 'Candidate'} Account`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

