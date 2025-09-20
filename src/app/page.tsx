'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessTeacherPortal } from '@/lib/auth-utils'
import { BookOpen, Users, BarChart3, Zap, Heart, TrendingUp } from 'lucide-react'

const teacherFeatures = [
  {
    title: 'Skapa Quiz',
    description: 'Skapa quiz, dela via QR eller kod, rätta snabbt med stöd av AI (alltid under din kontroll).',
    icon: <BookOpen size={20} strokeWidth={2} />,
  },
  {
    title: 'Klasshantering',
    description: 'Organisera dina klasser, hantera elevlister och få översikt över resultat och framsteg.',
    icon: <Users size={20} strokeWidth={2} />,
  },
  {
    title: 'Resultatanalys',
    description: 'Detaljerade rapporter och analytics för att följa upp elevernas lärande och identifiera förbättringsområden.',
    icon: <BarChart3 size={20} strokeWidth={2} />,
  },
]

const studentFeatures = [
  {
    title: 'Gå med i Quiz',
    description: 'Gå med i klassens quiz på sekunder med QR-kod eller fyrteckenskod.',
    icon: <Zap size={20} strokeWidth={2} />,
  },
  {
    title: 'Interaktivt Lärande',
    description: 'Upplev lärande genom spel med omedelbar feedback och engagerande visuella element.',
    icon: <Heart size={20} strokeWidth={2} />,
  },
  {
    title: 'Framstegsspårning',
    description: 'Följ din utveckling över tid och se hur dina kunskaper växer inom olika ämnesområden.',
    icon: <TrendingUp size={20} strokeWidth={2} />,
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
  const { user, isAuthenticated } = useAuth()

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
              {!isAuthenticated && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/register">Skapa lärarkonto</Link>
                </Button>
              )}
              {isAuthenticated && canAccessTeacherPortal(user) && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/teacher">Gå till lärarportal</Link>
                </Button>
              )}
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
            {!isAuthenticated && (
              <Button size="lg" asChild>
                <Link href="/register">Kom igång som lärare</Link>
              </Button>
            )}
            {isAuthenticated && canAccessTeacherPortal(user) && (
              <Button size="lg" asChild>
                <Link href="/teacher">Gå till lärarportal</Link>
              </Button>
            )}
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
            className="text-center space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/quiz/join">Gå med i Quiz nu</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/join/class">Gå med i Klass</Link>
              </Button>
            </div>
            <Typography variant="body2" className="text-neutral-500">
              Ange koden från din lärare för att komma igång
            </Typography>
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
              {!isAuthenticated && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  asChild
                >
                  <Link href="/register">Starta som lärare</Link>
                </Button>
              )}
              {isAuthenticated && canAccessTeacherPortal(user) && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  asChild
                >
                  <Link href="/teacher">Gå till lärarportal</Link>
                </Button>
              )}
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