'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { motion } from 'framer-motion'

const teacherFeatures = [
  {
    title: 'Skapa Quiz',
    description: 'Skapa quiz, dela via QR eller kod, rätta snabbt med stöd av AI (alltid under din kontroll).',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Klasshantering',
    description: 'Organisera dina klasser, hantera elevlister och få översikt över resultat och framsteg.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Resultatanalys',
    description: 'Detaljerade rapporter och analytics för att följa upp elevernas lärande och identifiera förbättringsområden.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const studentFeatures = [
  {
    title: 'Gå med i Quiz',
    description: 'Gå med i klassens quiz på sekunder med QR-kod eller fyrteckenskod.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Interaktivt Lärande',
    description: 'Upplev lärande genom spel med omedelbar feedback och engagerande visuella element.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Framstegsspårning',
    description: 'Följ din utveckling över tid och se hur dina kunskaper växer inom olika ämnesområden.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.15, // 150ms, within 120-200ms range
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // swift-in-out
    },
  },
}

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-primary-50 to-white" spacing="xl">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants}>
              <Heading level={1} className="mb-6">
                Välkommen till{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Skolapp
                </span>
              </Heading>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="subtitle1" 
                className="mx-auto max-w-2xl mb-8 text-neutral-600"
              >
                Skapa engagerande quiz, följ elevers utveckling och arbeta smartare – snabbt och enkelt.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/quiz/join">Prova som gäst</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/teacher">Skapa lärarkonto</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* För Lärare Section */}
      <Section>
        <Container>
          <div className="text-center mb-16">
            <Heading level={2} className="mb-4">
              För Lärare
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
              Kraftfulla verktyg för att skapa engagerande lektioner och följa upp elevernas framsteg.
            </Typography>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {teacherFeatures.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 mx-auto">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="text-center"
          >
            <Button size="lg" asChild>
              <Link href="/teacher">Kom igång som lärare</Link>
            </Button>
          </motion.div>
        </Container>
      </Section>

      {/* För Elever Section */}
      <Section className="bg-neutral-50">
        <Container>
          <div className="text-center mb-16">
            <Heading level={2} className="mb-4">
              För Elever
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
              Lär dig på ett roligt och interaktivt sätt genom quiz och utmaningar anpassade för dig.
            </Typography>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {studentFeatures.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 mx-auto">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
            className="text-center"
          >
            <Button size="lg" asChild>
              <Link href="/quiz/join">Gå med i Quiz nu</Link>
            </Button>
          </motion.div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center bg-primary-600 rounded-2xl p-12 text-white"
          >
            <motion.div variants={itemVariants}>
              <Heading level={2} className="mb-4 text-white">
                Redo att förbättra lärandet?
              </Heading>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="subtitle1" className="mb-8 text-primary-100">
                Gå med i tusentals lärare och elever som redan använder Skolapp för bättre lärande.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                asChild
              >
                <Link href="/teacher">Starta som lärare</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600"
                asChild
              >
                <Link href="/quiz/join">Gå med i Quiz</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}