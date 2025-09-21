import { LiveQuizControlPanel } from '@/components/quiz/LiveQuizControlPanel'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'

// Demo data
const demoQuiz = {
  id: 'demo-quiz-123',
  title: 'Demo Quiz - Svenska Verb',
  questions: [
    {
      id: 'q1',
      title: 'Vad är presens av verbet "att springa"?',
      type: 'multiple-choice' as const,
      options: [
        { id: 'opt1', text: 'spring' },
        { id: 'opt2', text: 'springer' },
        { id: 'opt3', text: 'sprang' },
        { id: 'opt4', text: 'sprungit' }
      ]
    },
    {
      id: 'q2', 
      title: 'Vilket av följande är ett starkt verb?',
      type: 'multiple-choice' as const,
      options: [
        { id: 'opt1', text: 'hoppa' },
        { id: 'opt2', text: 'sjunga' },
        { id: 'opt3', text: 'prata' },
        { id: 'opt4', text: 'leka' }
      ]
    },
    {
      id: 'q3',
      title: 'Förklara skillnaden mellan presens och preteritum.',
      type: 'free-text' as const
    }
  ]
}

export default function LiveQuizTeacherDemo() {
  // Check if feature is enabled
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_LIVE_QUIZ === 'true'

  if (!isFeatureEnabled) {
    return (
      <Layout>
        <Section spacing="xl">
          <Container>
            <div className="text-center py-12">
              <Heading level={1} className="mb-4">Live Quiz-funktionen är inaktiverad</Heading>
              <Typography variant="body1" className="text-neutral-600">
                Aktivera NEXT_PUBLIC_FEATURE_LIVE_QUIZ i miljövariablerna för att testa live quiz.
              </Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <Heading level={1} className="mb-4">
                Live Quiz - Lärarvy (Demo)
              </Heading>
              <Typography variant="body1" className="text-neutral-600">
                Demo av live quiz-kontroller med Ably-integration.
              </Typography>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <LiveQuizControlPanel
                  quizId={demoQuiz.id}
                  questions={demoQuiz.questions}
                  teacherName="Demo Lärare"
                />
              </div>
              
              <div className="space-y-6">
                <div className="bg-neutral-50 p-6 rounded-lg">
                  <Heading level={3} className="mb-4">Testinstruktioner</Heading>
                  <div className="space-y-2 text-sm">
                    <p>1. Öppna studentvyn i en annan flik: <code>/demo/live-quiz/student</code></p>
                    <p>2. Klicka &quot;Starta quiz&quot; för att börja</p>
                    <p>3. Använd &quot;Nästa fråga&quot; för att gå vidare</p>
                    <p>4. Se hur svaren kommer in i realtid</p>
                    <p>5. Klicka &quot;Avsluta quiz&quot; när du är klar</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <Heading level={3} className="mb-4">Teknisk info</Heading>
                  <div className="space-y-2 text-sm">
                    <p><strong>Quiz ID:</strong> {demoQuiz.id}</p>
                    <p><strong>Kanaler:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• quiz:{demoQuiz.id}:control</li>
                      <li>• quiz:{demoQuiz.id}:answers</li>
                      <li>• quiz:{demoQuiz.id}:room</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}