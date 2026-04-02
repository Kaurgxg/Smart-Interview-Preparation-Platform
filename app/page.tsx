import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { InterviewTypes } from "@/components/landing/interview-types"
import { SiteHeader } from "@/components/landing/site-header"

export default function Home() {
  return (
    <div className="page-shell min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-4 md:px-6">
        <Hero />
        <Features />
        <InterviewTypes />
      </main>

      <footer className="border-t border-white/8 py-8 text-center text-sm text-muted-foreground">
        <p>InterviewAce - AI-powered interview preparation platform</p>
      </footer>
    </div>
  )
}
