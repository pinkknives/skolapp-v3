'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Designsystem',
    description: 'Komplett designsystem med tokens, komponenter och responsiv design för konsekvent användarupplevelse.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1a2 2 0 001 1.732l.732.732a2 2 0 002.828 0l.732-.732A2 2 0 0017 6V5a2 2 0 012-2h2a2 2 0 012 2v12a4 4 0 01-4 4H7z" />
      </svg>
    ),
    href: '/designsystem',
  },
  {
    title: 'Tillgänglighet först',
    description: 'Byggd med WCAG 2.1 AA-efterlevnad för att säkerställa att alla kan använda vår plattform effektivt.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    href: '/tillganglighet',
  },
  {
    title: 'Progressiv webbapp',
    description: 'Installera på vilken enhet som helst och njut av offline-funktionalitet med modern webbteknik.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    href: '/pwa',
  },
  {
    title: 'Prestanda',
    description: 'Optimerad för snabb laddning och responsiv användarinteraktion på alla enheter.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    href: '/prestanda',
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
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as [number, number, number, number],
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
                  Skolapp v3
                </span>
              </Heading>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="subtitle1" 
                className="mx-auto max-w-2xl mb-8 text-neutral-600"
              >
                En modern, tillgänglig och progressiv applikation för skolhantering 
                byggd med banbrytande webbteknologi och inkluderande designprinciper.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/designsystem">Kom igång</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/funktioner">Läs mer</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section>
        <Container>
          <div className="text-center mb-16">
            <Heading level={2} className="mb-4">
              Allt du behöver för modern designsystem-utveckling
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
              Kraftfulla funktioner designade med tillgänglighet, prestanda och användarupplevelse i åtanke.
            </Typography>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card 
                  variant="interactive" 
                  className="h-full group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href={feature.href}>
                        Läs mer →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="bg-neutral-50">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h3" className="text-primary-600 mb-2">
                99.9%
              </Typography>
              <Typography variant="subtitle2" className="text-neutral-600">
                Drifttillförlitlighet
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" className="text-primary-600 mb-2">
                WCAG 2.1 AA
              </Typography>
              <Typography variant="subtitle2" className="text-neutral-600">
                Tillgänglighetsefterlevnad
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" className="text-primary-600 mb-2">
                &lt;2s
              </Typography>
              <Typography variant="subtitle2" className="text-neutral-600">
                Genomsnittlig laddningstid
              </Typography>
            </motion.div>
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
                Redo att komma igång?
              </Heading>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="subtitle1" className="mb-8 text-primary-100">
                Upptäck kraften i ett modernt designsystem byggt för skalbarhet och prestanda.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button 
                variant="secondary" 
                size="lg"
                asChild
              >
                <Link href="/designsystem">Utforska designsystemet</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}