import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { InterviewTypes } from "@/components/landing/interview-types"
import { SiteHeader } from "@/components/landing/site-header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl">
        <Hero />
        <Features />
        <InterviewTypes />
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>InterviewAce - AI-powered interview preparation platform</p>
      </footer>
    </div>
  )
}
