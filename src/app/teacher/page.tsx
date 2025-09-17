import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'

export default function TeacherPage() {
  return (
    <Layout>
      <Section spacing="xl">
        <Container>
          <div className="text-center">
            <Heading level={1} className="mb-6">
              Lärarportal
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 mb-8">
              Den här sidan är under utveckling. Snart kommer lärare att kunna hantera sina klasser här.
            </Typography>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}