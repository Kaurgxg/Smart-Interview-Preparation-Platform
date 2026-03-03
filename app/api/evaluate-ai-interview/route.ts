import { detectPlagiarism } from '@/lib/plagiarism-detector'

interface Answer {
  questionId: string
  transcript: string
  duration: number
  fillerWords: number
  speakingPace: number
}

function evaluateAnswerQuality(transcript: string, duration: number): number {
  const words = transcript.trim().split(/\s+/).length
  const chars = transcript.length

  // Scoring rules for answer quality
  if (words < 20 || chars < 50) return 35 // Too short
  if (words < 50 || chars < 150) return 55 // Somewhat short
  if (words < 100 || chars < 300) return 70 // Good length
  if (words < 200 || chars < 600) return 85 // Comprehensive
  return 95 // Excellent depth
}

function evaluateCommunication(
  transcript: string,
  fillerWords: number,
  speakingPace: number,
  duration: number
): number {
  let score = 80

  // Penalty for filler words (max -20)
  const fillerRate = duration > 0 ? (fillerWords / duration) * 60 : 0
  if (fillerRate > 3) score -= 20
  else if (fillerRate > 2) score -= 12
  else if (fillerRate > 1) score -= 5

  // Bonus/penalty for speaking pace (ideal: 120-160 WPM)
  if (speakingPace < 100) score -= 8 // Too slow
  else if (speakingPace > 180) score -= 5 // Too fast
  else if (speakingPace >= 120 && speakingPace <= 160) score += 5 // Ideal pace

  // Bonus for varied sentence structure
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim()).length
  if (sentences > 3) score += 5

  return Math.max(30, Math.min(100, score))
}

function evaluateTechnicalDepth(transcript: string, category: string): number {
  const lowerTranscript = transcript.toLowerCase()

  const technicalTerms = [
    'implement',
    'algorithm',
    'complexity',
    'optimize',
    'data structure',
    'architecture',
    'framework',
    'database',
    'api',
    'performance',
    'scalable',
    'security',
    'authentication',
    'cache',
    'query',
    'function',
    'method',
    'class',
    'module',
  ]

  const foundTerms = technicalTerms.filter((term) =>
    lowerTranscript.includes(term)
  ).length

  let baseScore = 40
  if (category === 'technical') {
    // For technical questions, expect more technical terms
    if (foundTerms >= 5) baseScore = 85
    else if (foundTerms >= 3) baseScore = 70
    else if (foundTerms >= 1) baseScore = 55
  } else {
    // For behavioral/problem-solving, some technical depth is good
    if (foundTerms >= 3) baseScore = 75
    else if (foundTerms >= 1) baseScore = 60
  }

  return baseScore
}

function evaluateSoftSkills(transcript: string): number {
  const lowerTranscript = transcript.toLowerCase()

  const softSkillTerms = [
    'team',
    'collaborate',
    'communicate',
    'leadership',
    'listen',
    'feedback',
    'adapt',
    'flexible',
    'problem solving',
    'initiative',
    'responsibility',
    'accountability',
    'empathy',
    'mentor',
  ]

  const foundTerms = softSkillTerms.filter((term) =>
    lowerTranscript.includes(term)
  ).length

  let score = 50
  if (foundTerms >= 4) score = 80
  else if (foundTerms >= 2) score = 65
  else if (foundTerms >= 1) score = 55

  // Bonus for longer, more thoughtful responses
  const words = transcript.split(/\s+/).length
  if (words > 80) score += 10

  return Math.min(100, score)
}

function generateStrengths(
  answerQuality: number,
  communication: number,
  technicalDepth: number,
  softSkills: number,
  transcript: string
): string[] {
  const strengths: string[] = []

  if (answerQuality >= 75) {
    strengths.push('Provided detailed and comprehensive answers')
  }

  if (communication >= 80) {
    strengths.push('Clear and fluent communication with minimal filler words')
  }

  if (technicalDepth >= 75) {
    strengths.push('Strong technical knowledge demonstrated throughout')
  }

  if (softSkills >= 70) {
    strengths.push('Good demonstration of soft skills and collaboration mindset')
  }

  if (transcript.length > 300) {
    strengths.push('Thorough responses showing engagement with questions')
  }

  if (strengths.length === 0) {
    strengths.push('Attempted to provide complete answers')
  }

  return strengths.slice(0, 3)
}

function generateAreasToImprove(
  answerQuality: number,
  communication: number,
  technicalDepth: number,
  softSkills: number
): string[] {
  const areas: string[] = []

  if (answerQuality < 70) {
    areas.push('Focus on providing more detailed and comprehensive answers')
  }

  if (communication < 75) {
    areas.push('Work on reducing filler words and speaking more confidently')
  }

  if (technicalDepth < 70) {
    areas.push('Enhance technical terminology and industry knowledge references')
  }

  if (softSkills < 65) {
    areas.push('Develop more explicit examples of teamwork and collaboration')
  }

  if (areas.length === 0) {
    areas.push('Continue practicing to maintain consistency')
  }

  return areas.slice(0, 3)
}

export async function POST(request: Request) {
  try {
    const { questions, answers } = await request.json()

    if (!questions || !answers || answers.length === 0) {
      return Response.json(
        { error: 'Missing questions or answers' },
        { status: 400 }
      )
    }

    // Evaluate each answer
    const scores = {
      answerQuality: 0,
      communication: 0,
      technicalDepth: 0,
      softSkills: 0,
    }

    let feedbackDetails = ''
    let totalPlagiarismScore = 0
    let plagiarismFlags: string[] = []

    answers.forEach((answer: Answer, idx: number) => {
      const question = questions.find((q: any) => q.id === answer.questionId)
      if (!question || !answer.transcript) return

      const aq = evaluateAnswerQuality(answer.transcript, answer.duration)
      const comm = evaluateCommunication(
        answer.transcript,
        answer.fillerWords,
        answer.speakingPace,
        answer.duration
      )
      const tech = evaluateTechnicalDepth(answer.transcript, question.category)
      const soft = evaluateSoftSkills(answer.transcript)

      // Plagiarism detection
      const plagiarismResult = detectPlagiarism(answer.transcript)
      totalPlagiarismScore += plagiarismResult.score
      if (plagiarismResult.flags.length > 0) {
        plagiarismFlags.push(...plagiarismResult.flags)
      }

      scores.answerQuality += aq
      scores.communication += comm
      scores.technicalDepth += tech
      scores.softSkills += soft

      feedbackDetails += `Q${idx + 1}: ${aq}/100 quality, ${comm}/100 communication, ${tech}/100 technical depth. `
    })

    // Calculate averages
    const count = Math.max(answers.length, 1)
    const answerQuality = Math.round(scores.answerQuality / count)
    const communication = Math.round(scores.communication / count)
    const technicalDepth = Math.round(scores.technicalDepth / count)
    const softSkills = Math.round(scores.softSkills / count)
    const plagiarismScore = Math.round(totalPlagiarismScore / count)

    // Calculate overall score (weighted average)
    let overallScore = Math.round(
      answerQuality * 0.35 +
        communication * 0.25 +
        technicalDepth * 0.25 +
        softSkills * 0.15
    )

    // Penalty for plagiarism
    if (plagiarismScore > 40) {
      overallScore = Math.max(0, overallScore - Math.round((plagiarismScore - 40) * 0.5))
    }

    const transcript = answers.map((a: Answer) => a.transcript).join(' ')
    const strengths = generateStrengths(
      answerQuality,
      communication,
      technicalDepth,
      softSkills,
      transcript
    )
    const areasToImprove = generateAreasToImprove(
      answerQuality,
      communication,
      technicalDepth,
      softSkills
    )

    const detailedFeedback = `
Based on your interview performance, here's comprehensive feedback:

Answer Quality (${answerQuality}/100): Your responses demonstrate ${answerQuality >= 80 ? 'excellent depth and completeness' : answerQuality >= 60 ? 'good coverage of topics' : 'room for more detailed responses'}.

Communication (${communication}/100): Your speaking style shows ${communication >= 80 ? 'confidence and clarity with minimal filler words' : communication >= 60 ? 'decent flow with some areas to improve' : 'potential to work on clarity and confidence'}.

Technical Depth (${technicalDepth}/100): Your technical knowledge is ${technicalDepth >= 75 ? 'impressive with strong terminology usage' : technicalDepth >= 60 ? 'solid and demonstrates understanding' : 'developing; consider more technical references'}.

Soft Skills (${softSkills}/100): You ${softSkills >= 70 ? 'effectively demonstrate collaboration and interpersonal skills' : softSkills >= 50 ? 'show some soft skills awareness' : 'could benefit from more examples of teamwork'}.

Authenticity Check (${plagiarismScore}/100): ${plagiarismScore <= 20 ? 'Your responses appear completely original' : plagiarismScore <= 40 ? 'Mostly original with some common patterns' : 'Some concerns about response originality detected: ' + plagiarismFlags.join(', ')}.

Overall Performance: With a score of ${overallScore}/100, you are ${overallScore >= 80 ? 'performing exceptionally well' : overallScore >= 60 ? 'performing satisfactorily with room for improvement' : 'encouraged to practice more interview scenarios'}.

${feedbackDetails}
    `

    const evaluation = {
      answerQuality,
      communication,
      technicalDepth,
      softSkills,
      plagiarismScore,
      overallScore,
      strengths,
      areasToImprove,
      detailedFeedback: detailedFeedback.trim(),
    }

    return Response.json(evaluation)
  } catch (error) {
    console.error('Evaluation error:', error)
    return Response.json(
      { error: 'Failed to evaluate interview' },
      { status: 500 }
    )
  }
}
