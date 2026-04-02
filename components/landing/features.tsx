import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sparkles, ShieldCheck, BarChart3, Clock } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Feedback",
    description:
      "Get personalized, actionable feedback analyzing answer quality, communication, and technical depth. Understand your strengths and areas for improvement.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Cheat System",
    description:
      "Tab switching and paste detection ensures honest practice. Simulates real proctored interview conditions.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track scores over time, identify weak topics, and monitor your improvement with detailed charts and breakdowns.",
  },
  {
    icon: Clock,
    title: "Timed Sessions",
    description:
      "Per-question timers create real interview pressure. Practice managing your time across different question types.",
  },
]

export function Features() {
  return (
    <section className="section-shell px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">
              What you get
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Practice sessions that feel structured, not generic
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Every round is designed to mimic real interview pressure while still giving
            you feedback that is clear enough to act on immediately.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group rounded-[1.75rem] border-white/10 bg-white/4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/6"
            >
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-transform duration-200 group-hover:scale-105">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
