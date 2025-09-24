'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { ResponsiveContainer, ResponsiveSection } from '@/components/layout/ResponsiveContainer'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Clock,
  Users,
  BarChart3,
  Zap
} from 'lucide-react'
import { Stack } from '@/components/layout/Stack'

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

const urgencyStats = [
  { icon: <Users size={16} />, text: '2,500+ lärare använder redan Skolapp' },
  { icon: <Clock size={16} />, text: 'Sparar i snitt 2 timmar per vecka' },
  { icon: <BarChart3 size={16} />, text: 'Ger klara rapporter på minuter' },
]

const benefits = [
  'Gratis att komma igång',
  'Ingen bindningstid',
  'GDPR-säker hosting inom EU',
  'Support på svenska',
]

export function ImprovedCTA() {

  return (
    <ResponsiveSection id="cta">
      <ResponsiveContainer size="xl" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center bg-primary-600 rounded-2xl p-12 text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <Stack gap="lg" align="center" className="text-center">
              <motion.div variants={itemVariants} className="w-full">
                <Heading level={2} className="text-white">
                  Redo att förbättra <span className="text-brand-gradient">lärandet</span>?
                </Heading>
              </motion.div>

              <motion.div variants={itemVariants} className="w-full">
                <Typography
                  variant="subtitle1"
                  className="text-left mx-auto max-w-5xl text-primary-100 text-lg sm:text-xl lg:text-2xl leading-relaxed"
                >
                  Gå med i tusentals lärare som redan sparar tid och får bättre översikt 
                  över elevernas framsteg med Skolapp.
                </Typography>
              </motion.div>

              {/* Urgency stats */}
              <motion.div variants={itemVariants} className="w-full">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-100">
                  {urgencyStats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="text-primary-200">{stat.icon}</div>
                      <span>{stat.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div variants={itemVariants} className="w-full">
                <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-primary-200 flex-shrink-0" />
                          <span className="text-white">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <Button 
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50 text-base px-8 py-4 flex items-center gap-3"
                  asChild
                >
                  <Link href="/register">
                    <Sparkles size={20} className="flex-shrink-0" />
                    <span>Starta gratis som lärare</span>
                    <ArrowRight size={20} className="flex-shrink-0" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-primary-700 dark:text-white dark:hover:text-primary-700 text-base px-8 py-4 flex items-center gap-3"
                  asChild
                >
                  <Link href="/live/join">
                    <Zap size={20} className="flex-shrink-0" />
                    <span>Prova som elev</span>
                  </Link>
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={itemVariants} className="w-full">
                <Typography variant="caption" className="text-primary-200">
                  ✓ Ingen bindningstid • ✓ GDPR-säker • ✓ Support på svenska
                </Typography>
              </motion.div>
            </Stack>
          </div>
        </motion.div>

        {/* Pricing teaser */}
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
