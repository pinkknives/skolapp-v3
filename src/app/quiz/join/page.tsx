import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'

export default function QuizJoinPage() {
  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="text-center">
            <Heading level={1} className="mb-6">
              Gå med i Quiz
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 mb-8">
              Den här sidan är under utveckling. Snart kommer du att kunna gå med i quiz här.
            </Typography>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}