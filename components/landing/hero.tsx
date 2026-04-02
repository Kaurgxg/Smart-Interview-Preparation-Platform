"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function Hero() {
  const { user, isAdmin } = useAuth()
  const primaryHref = user ? (isAdmin ? "/admin" : "/dashboard") : "/login"
  const primaryLabel = user ? (isAdmin ? "Open Admin" : "Open Dashboard") : "Get Started"

  return (
    <section className="section-shell hero-mesh relative overflow-hidden px-6 py-12 md:px-10 md:py-16">
      <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col items-start gap-6 text-left">
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Brain className="size-4" />
            <span>AI-Powered Interview Prep</span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Build interview confidence with a practice space that feels
              <span className="text-primary"> sharp, timed, and real.</span>
            </h1>

            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Train across aptitude, technical, HR, coding, and AI voice rounds with
              performance tracking, answer reviews, and feedback that actually helps
              you improve.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 rounded-2xl px-8 text-base">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/12 bg-white/4 px-8 text-base">
              <Link href="#interview-types">Explore Types</Link>
            </Button>
          </div>

          <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { value: "65+", label: "Questions live" },
              { value: "5", label: "Practice modes" },
              { value: "AI", label: "Voice feedback" },
            ].map((item) => (
              <div key={item.label} className="soft-panel rounded-2xl px-4 py-4">
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="section-shell rounded-[1.75rem] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Session snapshot
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">Average score lift</p>
                <p className="mt-2 text-3xl font-bold text-foreground">+18%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  after repeated timed practice
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                <p className="text-sm text-muted-foreground">AI interview mode</p>
                <p className="mt-2 text-3xl font-bold text-foreground">Voice</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  scoring for relevance, keywords, and confidence
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="soft-panel rounded-[1.5rem] p-5">
              <p className="text-sm font-semibold text-foreground">Why it feels better</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Timed rounds, private dashboards, and answer review screens make each
                session feel like focused training instead of a random quiz.
              </p>
            </div>
            <div className="soft-panel rounded-[1.5rem] p-5">
              <p className="text-sm font-semibold text-foreground">Built for iteration</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Practice once, review clearly, and jump back in with stronger answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
