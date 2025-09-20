import { LiveQuizDisplay } from '@/components/quiz/LiveQuizDisplay'

// Demo data matching teacher and student demos
const demoQuiz = {
  id: 'demo-quiz-123',
  title: 'Demo Quiz - Svenska Verb',
  questions: [
    {
      id: 'q1',
      title: 'Vad är presens av verbet "att springa"?'
    },
    {
      id: 'q2', 
      title: 'Vilket av följande är ett starkt verb?'
    },
    {
      id: 'q3',
      title: 'Förklara skillnaden mellan presens och preteritum.'
    }
  ]
}

export default function LiveQuizDisplayDemo() {
  // Check if feature is enabled
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_LIVE_QUIZ === 'true'

  if (!isFeatureEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Live Quiz-funktionen är inaktiverad</h1>
          <p className="text-neutral-600">
            Aktivera NEXT_PUBLIC_FEATURE_LIVE_QUIZ i miljövariablerna för att testa live quiz.
          </p>
        </div>
      </div>
    )
  }

  return (
    <LiveQuizDisplay
      quizId={demoQuiz.id}
      quizTitle={demoQuiz.title}
      questions={demoQuiz.questions}
    />
  )
}