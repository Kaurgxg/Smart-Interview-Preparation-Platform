'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { Brain, Shield, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
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
    const { error: authError } = await signUp(email, password, fullName, role, adminCode)

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
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Brain className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-card border-r border-border p-12">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">PrepAI</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Start your journey
              <br />
              <span className="text-primary">to interview success.</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Join thousands of candidates who've landed their dream jobs using
              AI-powered mock interviews.
            </p>
          </div>

          {/* Role description cards */}
          <div className="space-y-3">
            <div className={`rounded-xl border p-4 transition-colors ${role === 'user' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <Brain className="size-4 text-primary" /> Candidate Account
              </div>
              <p className="text-xs text-muted-foreground">
                Practice interviews, track performance, and get AI feedback on every answer. Your data is completely private.
              </p>
            </div>
            <div className={`rounded-xl border p-4 transition-colors ${role === 'admin' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                <Shield className="size-4 text-primary" /> Admin Account
              </div>
              <p className="text-xs text-muted-foreground">
                Manage questions, add interview modes, and oversee the question bank. Requires an admin access code.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PrepAI. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-7">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="font-bold">PrepAI</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose your role and get started
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-1 gap-1">
            {(['user', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                  role === r
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'admin' ? <Shield className="size-3.5" /> : <Brain className="size-3.5" />}
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Admin code field — only shown when admin role selected */}
            {role === 'admin' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" />
                  Admin Access Code
                </label>
                <input
                  type="password"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                  className="w-full rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Contact your system administrator for the access code.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Creating account...</>
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