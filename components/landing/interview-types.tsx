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
    <section id="interview-types" className="section-shell px-6 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">
              Interview library
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Choose the round you want to sharpen next
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Built-in modes and admin-added modes all appear here, so the candidate
            experience stays connected to what your platform actually offers.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {modes.map((mode) => {
            const Icon = iconMap[mode.icon] ?? Brain
            const href =
              mode.kind === "ai-interviewer"
                ? `/interview/ai-mode?mode=${encodeURIComponent(mode.id)}`
                : `/interview/${mode.id}`

            return (
              <Card
                key={mode.id}
                className="group flex flex-col rounded-[1.75rem] border-white/10 bg-white/4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/6"
              >
                <CardHeader>
                  <div className="mb-3 flex flex-col gap-2">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-transform duration-200 group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-sm sm:text-base">{mode.label}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="border-white/10 bg-white/4 text-xs">
                      {mode.questionCount}Q
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/4 text-xs">
                      {Math.round((mode.timePerQuestion * mode.questionCount) / 60)}m
                    </Badge>
                  </div>
                  <CardDescription className="mt-2 text-xs leading-relaxed">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Button asChild size="sm" className="w-full gap-2 rounded-xl">
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
