'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading, ResponsiveGrid } from '@/components/layout/ResponsiveContainer'
import { Stack } from '@/components/layout/Stack'
import { Typography } from '@/components/ui/Typography'
import { Sparkles, Users, BarChart3, ShieldCheck } from 'lucide-react'

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
      duration: 0.18,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

const sellingPoints = [
  {
    title: 'AI som förstår läroplanen',
    description: 'Skapa kompletta quiz på svenska på under två minuter med AI som tar hänsyn till ämne, årskurs och kunskapskrav.',
    icon: Sparkles,
    bullet: 'Redo att använda direkt – redigera enkelt vid behov.'
  },
  {
    title: 'Ett flow eleverna älskar',
    description: 'Starta live-sessioner med QR-kod eller PIN, följ resultat i realtid och låt eleverna spela i klassrum eller på distans.',
    icon: Users,
    bullet: 'Fungerar på alla enheter utan installation.'
  },
  {
    title: 'Insikter för smartare undervisning',
    description: 'Automatisk rättning, tydliga rapporter och tidiga signaler om vilka områden som behöver mer träning.',
    icon: BarChart3,
    bullet: 'Exportera underlag till utvecklingssamtal på sekunder.'
  },
]

export function UniqueSellingPoints() {
  return (
    <ResponsiveSection id="unique-selling-points" className="bg-neutral-50 dark:bg-neutral-950">
      <ResponsiveContainer size="xl" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-120px' }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Stack align="center" gap="sm" className="text-center mb-12 sm:mb-16">
              <ResponsiveHeading level={2} className="text-foreground">
                Varför skolor väljer <span className="text-brand-gradient">Skolapp</span>
              </ResponsiveHeading>
              <Typography variant="subtitle1" className="text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed">
                Vi kombinerar AI, live-engagemang och tydliga insikter så att du kan fokusera på undervisning istället för administration.
              </Typography>
            </Stack>
          </motion.div>

          <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="lg">
            {sellingPoints.map((point) => (
              <motion.div key={point.title} variants={itemVariants}>
                <Card className="h-full border-neutral-200/80 hover:shadow-md transition-shadow dark:border-neutral-800">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                      <point.icon size={22} />
                    </div>
                    <div>
                      <Typography variant="h5" className="text-foreground mb-2">
                        {point.title}
                      </Typography>
                      <Typography variant="body2" className="text-neutral-600 dark:text-neutral-300">
                        {point.description}
                      </Typography>
                    </div>
                    <div className="mt-auto text-sm font-medium text-primary-600 dark:text-primary-400">
                      {point.bullet}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </ResponsiveGrid>

          <motion.div variants={itemVariants}>
            <Stack gap="sm" className="mt-12 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 sm:flex-row sm:items-center" align="start">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <Stack gap="xs" align="start" className="text-left">
                <Typography variant="subtitle1" className="text-foreground">
                  Byggd för skolan, med full GDPR-efterlevnad och drift i EU.
                </Typography>
                <Typography variant="caption" className="text-neutral-500">
                  Trygg hosting, enkel hantering av vårdnadshavarsamtycke och support på svenska.
                </Typography>
              </Stack>
            </Stack>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
