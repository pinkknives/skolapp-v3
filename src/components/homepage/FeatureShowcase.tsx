'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading, ResponsiveGrid } from '@/components/layout/ResponsiveContainer'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Zap, 
  Heart, 
  TrendingUp,
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'

// Note: containerVariants declared but unused previously; removing to satisfy lint

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

const teacherFeatures = [
  {
    title: 'AI-assisterad Quiz-skapande',
    description: 'Skapa engagerande quiz på 2 minuter med AI som förstår svenska läroplaner.',
    icon: <BookOpen size={20} strokeWidth={2} />,
    benefits: [
      'Generera frågor baserat på ämne och årskurs',
      'Automatisk svårighetsgradsjustering',
      'Integrerat med Skolverkets läroplaner',
      'Redigera och anpassa enkelt'
    ],
    example: 'Matematik för årskurs 6 → 10 frågor om bråk och decimaler',
    cta: 'Skapa ditt första quiz'
  },
  {
    title: 'Live-sessioner & Klasshantering',
    description: 'Kör quiz i realtid med dina elever och få omedelbar feedback.',
    icon: <Users size={20} strokeWidth={2} />,
    benefits: [
      'Live-sessioner med QR-kod eller PIN',
      'Realtidsresultat och statistik',
      'Hantera flera klasser samtidigt',
      'Automatisk elevregistrering'
    ],
    example: 'Starta quiz → Elever scannar QR → Se resultat live',
    cta: 'Starta live-session'
  },
  {
    title: 'Intelligent Analys & Rapporter',
    description: 'Få djupgående insikter om elevernas lärande och identifiera kunskapsluckor.',
    icon: <BarChart3 size={20} strokeWidth={2} />,
    benefits: [
      'Detaljerade resultatrapporter',
      'Identifiera svåra frågor',
      'Spåra framsteg över tid',
      'Exportera data för utvecklingssamtal'
    ],
    example: 'Se att 70% av eleverna behöver mer träning på bråk',
    cta: 'Visa exempelrapport'
  },
]

const studentFeatures = [
  {
    title: 'Snabb & Enkel Deltagande',
    description: 'Gå med i klassens quiz på sekunder med QR-kod eller PIN-kod.',
    icon: <Zap size={20} strokeWidth={2} />,
    benefits: [
      'Scanna QR-kod eller ange PIN',
      'Ingen registrering krävs',
      'Fungerar på alla enheter',
      'Spara framsteg automatiskt'
    ],
    example: 'Lärare visar QR-kod → Du scannar → Börja quiz direkt',
    cta: 'Gå med i quiz nu'
  },
  {
    title: 'Interaktivt & Engagerande',
    description: 'Upplev lärande genom spel med omedelbar feedback och visuella belöningar.',
    icon: <Heart size={20} strokeWidth={2} />,
    benefits: [
      'Omedelbar feedback på svar',
      'Visuella belöningar och animationer',
      'Anpassad svårighetsgrad',
      'Gamification-element'
    ],
    example: 'Rätt svar → ✓ + poäng + animation',
    cta: 'Se hur det fungerar'
  },
  {
    title: 'Spåra Ditt Framsteg',
    description: 'Följ din utveckling över tid och se hur dina kunskaper växer.',
    icon: <TrendingUp size={20} strokeWidth={2} />,
    benefits: [
      'Personlig framstegsstatistik',
      'Se förbättringar över tid',
      'Identifiera styrkor och utvecklingsområden',
      'Motiverande mål och utmaningar'
    ],
    example: 'Från 60% till 85% på matematikquiz',
    cta: 'Visa min framsteg'
  },
]

interface FeatureShowcaseProps {
  title: string
  subtitle: string
  features: typeof teacherFeatures
  ctaText: string
  ctaLink: string
  bgColor?: string
}

function FeatureShowcase({ 
  title, 
  subtitle, 
  features, 
  ctaText, 
  ctaLink, 
  bgColor = "bg-white" 
}: FeatureShowcaseProps) {
  return (
    <ResponsiveSection className={bgColor}>
      <ResponsiveContainer size="xl" padding="lg">
        <div className="text-center mb-12 sm:mb-16">
          <ResponsiveHeading level={2} className="mb-4 text-foreground">
            {title}
          </ResponsiveHeading>
          <Typography
            variant="subtitle1"
            className="text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed"
          >
            {subtitle}
          </Typography>
        </div>

        <ResponsiveGrid 
          cols={{ default: 1, md: 2, lg: 3 }} 
          gap="lg" 
          className="mb-12"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.title} 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Benefits list */}
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-600 dark:text-neutral-300">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Example */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      <Sparkles size={14} />
                      Exempel:
                    </div>
                    <Typography variant="caption" className="text-neutral-600 dark:text-neutral-400">
                      {feature.example}
                    </Typography>
                  </div>

                  {/* CTA */}
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" asChild>
                    <Link href={ctaLink}>
                      <span>{feature.cta}</span>
                      <ArrowRight size={14} className="flex-shrink-0" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </ResponsiveGrid>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center"
        >
          <Button size="lg" asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}

export function TeacherFeatures() {
  return (
    <FeatureShowcase
      title="För Lärare"
      subtitle="Kraftfulla verktyg för att skapa engagerande lektioner och följa upp elevernas framsteg."
      features={teacherFeatures}
      ctaText="Kom igång som lärare"
      ctaLink="/auth?mode=register"
    />
  )
}

export function StudentFeatures() {
  return (
    <FeatureShowcase
      title="För Elever"
      subtitle="Lär dig på ett roligt och interaktivt sätt genom quiz och utmaningar anpassade för dig."
      features={studentFeatures}
      ctaText="Gå med i Quiz nu"
      ctaLink="/quiz/join"
      bgColor="bg-neutral-50 dark:bg-neutral-950"
    />
  )
}
