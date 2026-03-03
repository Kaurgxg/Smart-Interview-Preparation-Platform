import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { InterviewTypes } from "@/components/landing/interview-types"
import Link from "next/link"
import { Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="text-lg font-bold">InterviewAce</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="#interview-types"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Practice
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl">
        <Hero />
        <Features />
        <InterviewTypes />
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>InterviewAce -- AI-powered interview preparation platform</p>
      </footer>
    </div>
  )
}
