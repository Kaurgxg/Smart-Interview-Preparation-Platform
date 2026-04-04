'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Shield,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import {
  AVAILABLE_MODE_ICONS,
  deleteInterviewMode,
  deleteInterviewQuestion,
  getInterviewModes,
  getQuestionsForAdmin,
  saveInterviewMode,
  saveInterviewQuestion,
  subscribeToInterviewCatalogUpdates,
  toggleInterviewQuestion,
} from '@/lib/interview-catalog'
import type {
  Difficulty,
  InterviewModeConfig,
  InterviewType,
  ManagedAIQuestion,
  ManagedCodingQuestion,
  ManagedInterviewQuestion,
  ManagedMCQQuestion,
  ModeKind,
} from '@/lib/types'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const emptyModeForm = {
  id: '',
  label: '',
  description: '',
  timePerQuestion: 90,
  questionCount: 10,
  icon: 'brain',
  kind: 'mcq' as ModeKind,
}

const emptyQuestionForm = {
  topic: '',
  difficulty: 'medium' as Difficulty,
  prompt: '',
  explanation: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  title: '',
  description: '',
  starterCode: '',
  expectedOutput: '',
  hints: '',
  category: 'behavioral' as ManagedAIQuestion['category'],
  expectedDuration: 180,
  expectedKeywords: '',
  expectedSentences: '',
}

function slugifyModeId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading, signOut } = useProtectedRoute({ requireAdmin: true })

  const [modes, setModes] = useState<InterviewModeConfig[]>([])
  const [selectedModeId, setSelectedModeId] = useState<InterviewType | null>(null)
  const [questions, setQuestions] = useState<ManagedInterviewQuestion[]>([])
  const [showModeForm, setShowModeForm] = useState(false)
  const [editingModeId, setEditingModeId] = useState<InterviewType | null>(null)
  const [modeForm, setModeForm] = useState(emptyModeForm)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCatalog = () => {
      const nextModes = getInterviewModes()
      setModes(nextModes)
      setSelectedModeId((current) => current ?? nextModes[0]?.id ?? null)
    }

    loadCatalog()
    return subscribeToInterviewCatalogUpdates(loadCatalog)
  }, [])

  useEffect(() => {
    if (!selectedModeId) {
      setQuestions([])
      return
    }

    setQuestions(getQuestionsForAdmin(selectedModeId))
  }, [selectedModeId, modes])

  const selectedMode = useMemo(
    () => modes.find((mode) => mode.id === selectedModeId) ?? null,
    [modes, selectedModeId]
  )

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const openCreateMode = () => {
    setEditingModeId(null)
    setModeForm(emptyModeForm)
    setShowModeForm(true)
  }

  const openEditMode = (mode: InterviewModeConfig) => {
    setEditingModeId(mode.id)
    setModeForm({
      id: mode.id,
      label: mode.label,
      description: mode.description,
      timePerQuestion: mode.timePerQuestion,
      questionCount: mode.questionCount,
      icon: mode.icon,
      kind: mode.kind,
    })
    setShowModeForm(true)
  }

  const saveMode = () => {
    const generatedId = editingModeId ?? slugifyModeId(modeForm.id || modeForm.label)

    if (!generatedId) {
      toast.error('Mode name is required.')
      return
    }

    saveInterviewMode({
      id: generatedId,
      label: modeForm.label.trim() || generatedId,
      description: modeForm.description.trim(),
      timePerQuestion: Number(modeForm.timePerQuestion),
      questionCount: Number(modeForm.questionCount),
      icon: modeForm.icon,
      kind: modeForm.kind,
      builtIn: modes.find((mode) => mode.id === generatedId)?.builtIn ?? false,
    })

    setSelectedModeId(generatedId)
    setShowModeForm(false)
    toast.success(editingModeId ? 'Mode updated.' : 'Mode created.')
  }

  const removeMode = (mode: InterviewModeConfig) => {
    try {
      deleteInterviewMode(mode.id)
      setSelectedModeId((current) =>
        current === mode.id ? getInterviewModes()[0]?.id ?? null : current
      )
      toast.success('Mode deleted.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete mode.')
    }
  }

  const openCreateQuestion = () => {
    if (!selectedMode) return

    setEditingQuestionId(null)
    setQuestionForm({
      ...emptyQuestionForm,
      expectedDuration: selectedMode.timePerQuestion,
    })
    setShowQuestionForm(true)
  }

  const openEditQuestion = (question: ManagedInterviewQuestion) => {
    setEditingQuestionId(question.id)

    if (question.kind === 'mcq') {
      setQuestionForm({
        ...emptyQuestionForm,
        topic: question.topic,
        difficulty: question.difficulty,
        prompt: question.question,
        explanation: question.explanation,
        options: question.options,
        correctAnswer: question.correctAnswer,
      })
    } else if (question.kind === 'coding') {
      setQuestionForm({
        ...emptyQuestionForm,
        topic: question.topic,
        difficulty: question.difficulty,
        title: question.title,
        description: question.description,
        starterCode: question.starterCode,
        expectedOutput: question.expectedOutput,
        hints: question.hints.join('\n'),
      })
    } else {
      setQuestionForm({
        ...emptyQuestionForm,
        prompt: question.question,
        category: question.category,
        expectedDuration: question.expectedDuration,
        expectedKeywords: question.expectedKeywords?.join(', ') ?? '',
        expectedSentences: question.expectedSentences?.join('\n') ?? '',
      })
    }

    setShowQuestionForm(true)
  }

  const saveQuestion = async () => {
    if (!selectedMode) return

    setSaving(true)

    try {
      if (selectedMode.kind === 'mcq') {
        if (!questionForm.prompt.trim() || !questionForm.topic.trim()) {
          throw new Error('Question text and topic are required.')
        }

        saveInterviewQuestion(
          {
            modeId: selectedMode.id,
            kind: 'mcq',
            active: true,
            question: questionForm.prompt.trim(),
            topic: questionForm.topic.trim(),
            difficulty: questionForm.difficulty,
            explanation: questionForm.explanation.trim(),
            options: questionForm.options.map((option) => option.trim()).filter(Boolean),
            correctAnswer: questionForm.correctAnswer,
          } satisfies Omit<ManagedMCQQuestion, 'id'>,
          editingQuestionId ?? undefined
        )
      } else if (selectedMode.kind === 'coding') {
        if (!questionForm.title.trim() || !questionForm.description.trim()) {
          throw new Error('Coding title and description are required.')
        }

        saveInterviewQuestion(
          {
            modeId: selectedMode.id,
            kind: 'coding',
            active: true,
            title: questionForm.title.trim(),
            description: questionForm.description.trim(),
            starterCode: questionForm.starterCode,
            expectedOutput: questionForm.expectedOutput.trim(),
            topic: questionForm.topic.trim() || 'Coding',
            difficulty: questionForm.difficulty,
            hints: questionForm.hints
              .split('\n')
              .map((hint) => hint.trim())
              .filter(Boolean),
          } satisfies Omit<ManagedCodingQuestion, 'id'>,
          editingQuestionId ?? undefined
        )
      } else {
        if (!questionForm.prompt.trim()) {
          throw new Error('AI interview prompt is required.')
        }

        saveInterviewQuestion(
          {
            modeId: selectedMode.id,
            kind: 'ai-interviewer',
            active: true,
            question: questionForm.prompt.trim(),
            category: questionForm.category,
            expectedDuration: Number(questionForm.expectedDuration),
            expectedKeywords: questionForm.expectedKeywords
              .split(',')
              .map((keyword) => keyword.trim())
              .filter(Boolean),
            expectedSentences: questionForm.expectedSentences
              .split('\n')
              .map((sentence) => sentence.trim())
              .filter(Boolean),
          } satisfies Omit<ManagedAIQuestion, 'id'>,
          editingQuestionId ?? undefined
        )
      }

      setShowQuestionForm(false)
      toast.success(editingQuestionId ? 'Question updated.' : 'Question added.')
      setQuestions(getQuestionsForAdmin(selectedMode.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save question.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="page-shell min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="highlight-ring flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Shield className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.22em]">Admin Panel</span>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => void handleSignOut()}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="section-shell mb-8 flex flex-col gap-5 rounded-[2rem] px-6 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary">Catalog control</p>
            <h1 className="mt-2 text-3xl font-bold">Modes and Questions</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add custom modes, manage questions, and control what candidates actually see.
            </p>
          </div>
          <button
            onClick={openCreateMode}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            New Mode
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`rounded-[1.75rem] border p-5 transition-all ${
                selectedModeId === mode.id
                  ? 'border-primary/35 bg-primary/10 shadow-[0_20px_50px_rgba(0,0,0,0.16)]'
                  : 'border-white/10 bg-white/4'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setSelectedModeId(mode.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <p className="font-semibold">{mode.label}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {mode.kind} | {mode.questionCount} questions | {mode.timePerQuestion}s each
                  </p>
                </button>
                {!mode.builtIn && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditMode(mode)}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => removeMode(mode)}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedMode && (
          <>
            <div className="section-shell mb-6 flex flex-col gap-4 rounded-[1.75rem] px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedMode.label} Questions</h2>
                <p className="text-sm text-muted-foreground">
                  Manage the live question bank for this mode.
                </p>
              </div>
              <button
                onClick={openCreateQuestion}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="size-4" />
                Add Question
              </button>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4 backdrop-blur-xl">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/4">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Question</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kind</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        No questions yet for this mode.
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-white/4">
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {question.kind === 'coding' ? question.title : question.question}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {question.kind === 'coding' ? question.topic : question.kind === 'mcq' ? question.topic : question.category}
                          </p>
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">
                          {question.kind.replace('-', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleInterviewQuestion(question.id)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              question.active
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {question.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditQuestion(question)}
                              className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                deleteInterviewQuestion(question.id)
                                toast.success('Question deleted.')
                                setQuestions(getQuestionsForAdmin(selectedMode.id))
                              }}
                              className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {showModeForm && (
        <ModalShell
          title={editingModeId ? 'Edit Mode' : 'Create New Mode'}
          onClose={() => setShowModeForm(false)}
          onSave={saveMode}
          saving={false}
        >
          <div className="space-y-4">
            {!editingModeId && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mode Slug</label>
                <input
                  value={modeForm.id}
                  onChange={(event) => setModeForm((current) => ({ ...current, id: slugifyModeId(event.target.value) }))}
                  placeholder="system-design"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mode Name</label>
              <input
                value={modeForm.label}
                onChange={(event) => setModeForm((current) => ({ ...current, label: event.target.value }))}
                placeholder="System Design"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={3}
                value={modeForm.description}
                onChange={(event) => setModeForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mode Kind</label>
                <select
                  value={modeForm.kind}
                  onChange={(event) => setModeForm((current) => ({ ...current, kind: event.target.value as ModeKind }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="coding">Coding</option>
                  <option value="ai-interviewer">AI Interview</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Icon</label>
                <select
                  value={modeForm.icon}
                  onChange={(event) => setModeForm((current) => ({ ...current, icon: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {AVAILABLE_MODE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Question Count</label>
                <input
                  type="number"
                  min={1}
                  value={modeForm.questionCount}
                  onChange={(event) => setModeForm((current) => ({ ...current, questionCount: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Time Per Question</label>
                <input
                  type="number"
                  min={30}
                  value={modeForm.timePerQuestion}
                  onChange={(event) => setModeForm((current) => ({ ...current, timePerQuestion: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {showQuestionForm && selectedMode && (
        <ModalShell
          title={editingQuestionId ? 'Edit Question' : `Add ${selectedMode.label} Question`}
          onClose={() => setShowQuestionForm(false)}
          onSave={() => void saveQuestion()}
          saving={saving}
        >
          {selectedMode.kind === 'mcq' && (
            <div className="space-y-4">
              <TextInput label="Question" value={questionForm.prompt} onChange={(value) => setQuestionForm((current) => ({ ...current, prompt: value }))} />
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Topic" value={questionForm.topic} onChange={(value) => setQuestionForm((current) => ({ ...current, topic: value }))} />
                <SelectInput
                  label="Difficulty"
                  value={questionForm.difficulty}
                  onChange={(value) => setQuestionForm((current) => ({ ...current, difficulty: value as Difficulty }))}
                  options={DIFFICULTIES}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Options</label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm((current) => ({ ...current, correctAnswer: index }))}
                    />
                    <input
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...questionForm.options]
                        nextOptions[index] = event.target.value
                        setQuestionForm((current) => ({ ...current, options: nextOptions }))
                      }}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              <TextAreaInput label="Explanation" value={questionForm.explanation} onChange={(value) => setQuestionForm((current) => ({ ...current, explanation: value }))} rows={3} />
            </div>
          )}

          {selectedMode.kind === 'coding' && (
            <div className="space-y-4">
              <TextInput label="Title" value={questionForm.title} onChange={(value) => setQuestionForm((current) => ({ ...current, title: value }))} />
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Topic" value={questionForm.topic} onChange={(value) => setQuestionForm((current) => ({ ...current, topic: value }))} />
                <SelectInput
                  label="Difficulty"
                  value={questionForm.difficulty}
                  onChange={(value) => setQuestionForm((current) => ({ ...current, difficulty: value as Difficulty }))}
                  options={DIFFICULTIES}
                />
              </div>
              <TextAreaInput label="Description" value={questionForm.description} onChange={(value) => setQuestionForm((current) => ({ ...current, description: value }))} rows={5} />
              <TextAreaInput label="Starter Code" value={questionForm.starterCode} onChange={(value) => setQuestionForm((current) => ({ ...current, starterCode: value }))} rows={5} />
              <TextInput label="Expected Output" value={questionForm.expectedOutput} onChange={(value) => setQuestionForm((current) => ({ ...current, expectedOutput: value }))} />
              <TextAreaInput label="Hints (one per line)" value={questionForm.hints} onChange={(value) => setQuestionForm((current) => ({ ...current, hints: value }))} rows={4} />
            </div>
          )}

          {selectedMode.kind === 'ai-interviewer' && (
            <div className="space-y-4">
              <TextAreaInput label="Prompt" value={questionForm.prompt} onChange={(value) => setQuestionForm((current) => ({ ...current, prompt: value }))} rows={4} />
              <div className="grid grid-cols-2 gap-3">
                <SelectInput
                  label="Category"
                  value={questionForm.category}
                  onChange={(value) => setQuestionForm((current) => ({ ...current, category: value as ManagedAIQuestion['category'] }))}
                  options={['behavioral', 'technical', 'problem-solving']}
                />
                <TextInput
                  label="Expected Duration"
                  type="number"
                  value={String(questionForm.expectedDuration)}
                  onChange={(value) => setQuestionForm((current) => ({ ...current, expectedDuration: Number(value) }))}
                />
              </div>
              <TextInput label="Expected Keywords (comma separated)" value={questionForm.expectedKeywords} onChange={(value) => setQuestionForm((current) => ({ ...current, expectedKeywords: value }))} />
              <TextAreaInput label="Expected Key Points (one per line)" value={questionForm.expectedSentences} onChange={(value) => setQuestionForm((current) => ({ ...current, expectedSentences: value }))} rows={4} />
            </div>
          )}
        </ModalShell>
      )}
    </div>
  )
}

function ModalShell({
  title,
  children,
  onClose,
  onSave,
  saving,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

function TextAreaInput({
  label,
  value,
  onChange,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
