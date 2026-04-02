'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Code, Users, Terminal, Mic, ArrowRight } from "lucide-react"
import { getInterviewModes, subscribeToInterviewCatalogUpdates } from "@/lib/interview-catalog"
import type { InterviewModeConfig } from "@/lib/types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  code: Code,
  users: Users,
  terminal: Terminal,
  microphone: Mic,
}

export function InterviewTypes() {
  const [modes, setModes] = useState<InterviewModeConfig[]>([])

  useEffect(() => {
    const loadModes = () => {
      setModes(getInterviewModes())
    }

    loadModes()
    return subscribeToInterviewCatalogUpdates(loadModes)
  }, [])

  return (
    <section id="interview-types" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-foreground">
          Choose Your Interview Type
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Practice across all major interview categories
        </p>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {modes.map((mode) => {
            const Icon = iconMap[mode.icon] ?? Brain
            const href =
              mode.kind === "ai-interviewer"
                ? `/interview/ai-mode?mode=${encodeURIComponent(mode.id)}`
                : `/interview/${mode.id}`

            return (
              <Card
                key={mode.id}
                className="flex flex-col border-border/50 bg-card/50 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-3 flex flex-col gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-sm sm:text-base">{mode.label}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {mode.questionCount}Q
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((mode.timePerQuestion * mode.questionCount) / 60)}m
                    </Badge>
                  </div>
                  <CardDescription className="mt-2 text-xs leading-relaxed">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Button asChild size="sm" className="w-full gap-2">
                    <Link href={href}>
                      Start
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
