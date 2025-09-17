'use client'

import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Plan Management',
    description: 'Organize and track educational plans with ease. Create, edit, and monitor progress.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/plan',
  },
  {
    title: 'Task Management',
    description: 'Stay on top of assignments and deadlines with our comprehensive task system.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    href: '/tasks',
  },
  {
    title: 'Accessibility First',
    description: 'Built with WCAG 2.1 AA compliance, ensuring everyone can use our platform effectively.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    href: '/accessibility',
  },
  {
    title: 'Progressive Web App',
    description: 'Install on any device and enjoy offline functionality with modern web technologies.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    href: '/pwa',
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
                Welcome to{' '}
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
                A modern, accessible, and progressive school management application 
                built with cutting-edge web technologies and inclusive design principles.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/plan">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">Learn More</Link>
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
              Everything you need for modern education management
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed with accessibility, performance, and user experience in mind.
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
                        Learn more →
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
                Uptime Reliability
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" className="text-primary-600 mb-2">
                WCAG 2.1 AA
              </Typography>
              <Typography variant="subtitle2" className="text-neutral-600">
                Accessibility Compliance
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h3" className="text-primary-600 mb-2">
                &lt;2s
              </Typography>
              <Typography variant="subtitle2" className="text-neutral-600">
                Average Load Time
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
                Ready to get started?
              </Heading>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="subtitle1" className="mb-8 text-primary-100">
                Join thousands of educators already using Skolapp to manage their schools.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button 
                variant="secondary" 
                size="lg"
                asChild
              >
                <Link href="/plan">Start Planning</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}