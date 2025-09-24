'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading } from '@/components/layout/ResponsiveContainer'
import { Stack } from '@/components/layout/Stack'
import Link from 'next/link'
import {
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react'

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
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

const quickStats = [
  { icon: <Users size={16} />, label: 'Aktiva lärare', value: '2,500+' },
  { icon: <BarChart3 size={16} />, label: 'Quiz skapade', value: '15,000+' },
  { icon: <Clock size={16} />, label: 'Tid sparad/vecka', value: '2h' },
]

const keyBenefits = [
  'AI-genererade frågor som följer svenska läroplaner',
  'Live-sessioner med QR/PIN som engagerar hela klassen',
  'Automatisk rättning och rapporter klara direkt efter passet',
]

export function ImprovedHero() {
  return (
    <ResponsiveSection id="hero" className="relative bg-background">
      {/* Decorative gradient background */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background to-background/0"
      />
      
      <ResponsiveContainer size="xl" padding="lg" className="py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center"
        >
          <Stack gap="lg" align="center">
            {/* Main headline */}
            <motion.div variants={itemVariants} className="w-full">
              <ResponsiveHeading level={1} className="text-foreground leading-tight">
                Skolapp ger dig smartare quiz, live-engagemang och tydliga <span className="text-brand-gradient">insikter</span>
              </ResponsiveHeading>
            </motion.div>

            {/* Subtitle with clear value proposition */}
            <motion.div variants={itemVariants} className="w-full">
              <Typography 
                variant="subtitle1" 
                className="dark:text-neutral-300 text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed"
              >
                Skapa quiz på svenska med AI, starta en live-session på sekunder och få rapporter som gör det enkelt att följa varje elevs utveckling.
              </Typography>
            </motion.div>

            {/* Quick stats */}
            <motion.div variants={itemVariants} className="w-full">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
                {quickStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="text-primary-600">{stat.icon}</div>
                    <span className="font-medium">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key benefits */}
            <motion.div variants={itemVariants} className="w-full">
              <Card className="max-w-4xl mx-auto bg-primary-50 border-primary-200 dark:bg-primary-950/20 dark:border-primary-800">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-left">
                    {keyBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full">
              <Button asChild size="lg" className="text-base px-8 py-4 h-14 flex items-center justify-center gap-3">
                <Link href="/register">
                  <Sparkles size={20} className="flex-shrink-0" />
                  <span>Skapa lärarkonto gratis</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base px-8 py-4 h-14 flex items-center justify-center gap-3"
                asChild
              >
                <Link href="/live/join">
                  <ArrowRight size={20} className="flex-shrink-0" />
                  <span>Elever: gå med med PIN</span>
                </Link>
              </Button>
            </motion.div>

            {/* Removed testimonials/ratings to focus on onboarding */}
          </Stack>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
