import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-8 px-4 pt-24 pb-16 text-center md:pt-32 md:pb-24">
      <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
        <Brain className="size-4" />
        <span>AI-Powered Interview Prep</span>
      </div>

      <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
        Ace Your Next{" "}
        <span className="text-primary">Interview</span>
      </h1>

      <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
        Practice with AI-powered mock interviews, get instant feedback, and
        track your progress across aptitude, technical, HR, and coding rounds.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="gap-2 px-8 text-base">
          <Link href="/dashboard">
            Start Practicing
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="px-8 text-base">
          <Link href="#interview-types">Explore Types</Link>
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">65+</span>
          <span>Questions</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">4</span>
          <span>Interview Types</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">AI</span>
          <span>Feedback</span>
        </div>
      </div>
    </section>
  )
}
