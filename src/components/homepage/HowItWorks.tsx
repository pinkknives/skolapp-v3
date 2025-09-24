'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading, ResponsiveGrid } from '@/components/layout/ResponsiveContainer'
import { Stack } from '@/components/layout/Stack'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { NotebookPen, QrCode, BarChart3, ArrowRight } from 'lucide-react'

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

const steps = [
  {
    title: 'Skapa ditt quiz',
    description: 'Välj ämne och årskurs – låt AI föreslå frågor eller lägg till egna.',
    icon: NotebookPen,
  },
  {
    title: 'Dela på sekunder',
    description: 'Starta en live-session, dela QR-kod eller PIN och se eleverna ansluta direkt.',
    icon: QrCode,
  },
  {
    title: 'Få tydliga insikter',
    description: 'Realtidsresultat, automatisk rättning och rapporter att dela med kollegor eller vårdnadshavare.',
    icon: BarChart3,
  },
]

export function HowItWorks() {
  return (
    <ResponsiveSection id="how-it-works">
      <ResponsiveContainer size="xl" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-120px' }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <Stack align="center" gap="sm" className="mb-12 sm:mb-14 text-center">
              <ResponsiveHeading level={2} className="text-foreground">
                Så kommer du igång på 5 minuter
              </ResponsiveHeading>
              <Typography
                variant="subtitle1"
                className="text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed"
              >
                Ingen installation, inga krångliga uppstarter. Skolapp är byggd för att fungera direkt i klassrummet.
              </Typography>
            </Stack>
          </motion.div>

          <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="lg" className="mb-10">
            {steps.map((step, index) => (
              <motion.div key={step.title} variants={itemVariants}>
                <Card className="h-full border-neutral-200/80 dark:border-neutral-800">
                  <CardContent className="p-6 flex flex-col gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                        <step.icon size={22} />
                      </div>
                      <div className="text-sm font-semibold text-primary-600">Steg {index + 1}</div>
                    </div>
                    <Typography variant="h5" className="text-foreground">
                      {step.title}
                    </Typography>
                    <Typography variant="body2" className="text-neutral-600 dark:text-neutral-300">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </ResponsiveGrid>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-4 h-14" asChild>
              <Link href="/register" className="flex items-center gap-3">
                <span>Skapa lärarkonto</span>
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 h-14" asChild>
              <Link href="/live/join" className="flex items-center gap-3">
                <span>Elever: gå med med PIN</span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
