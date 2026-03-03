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
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">
          Everything You Need
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Built to simulate real interview conditions with intelligent feedback
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 transition-colors hover:border-primary/30"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
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
