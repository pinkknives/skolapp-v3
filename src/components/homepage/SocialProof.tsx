'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading, ResponsiveGrid } from '@/components/layout/ResponsiveContainer'
import { Star, Quote, Users, BarChart3, Clock } from 'lucide-react'

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

const stats = [
  { icon: <Users size={20} />, value: '2,500+', label: 'Aktiva lärare' },
  { icon: <BarChart3 size={20} />, value: '15,000+', label: 'Quiz skapade' },
  { icon: <Clock size={20} />, value: '500+', label: 'Timmar sparat' },
  { icon: <Star size={20} />, value: '4.8/5', label: 'Betyg av lärare' },
]

const testimonials = [
  {
    name: 'Anna Lindqvist',
    role: 'Matematiklärare, Grundskola',
    school: 'Viktor Rydbergs Gymnasium',
    content: 'Skolapp har revolutionerat min undervisning. Jag kan skapa quiz på 2 minuter och få omedelbar feedback om elevernas förståelse. Tiden jag sparat kan jag lägga på individuell hjälp.',
    rating: 5,
    avatar: 'AL'
  },
  {
    name: 'Erik Johansson',
    role: 'Svensklärare, Grundskola',
    school: 'Kungsholmens Grundskola',
    content: 'AI-funktionen är fantastisk! Den genererar frågor som faktiskt matchar läroplanen. Eleverna älskar de interaktiva elementen och jag får bättre översikt över deras framsteg.',
    rating: 5,
    avatar: 'EJ'
  },
  {
    name: 'Maria Andersson',
    role: 'Naturvetenskapslärare, Gymnasium',
    school: 'Östra Real',
    content: 'Live-sessionerna är en game-changer. Eleverna är mer engagerade när de ser sina resultat i realtid. Rapporterna hjälper mig identifiera vilka områden som behöver mer fokus.',
    rating: 5,
    avatar: 'MA'
  },
  {
    name: 'Lars Svensson',
    role: 'Historialärare, Grundskola',
    school: 'Södra Latin',
    content: 'Enkelt att komma igång, kraftfullt i användning. Eleverna tycker det är roligt att använda och jag får värdefull data om deras lärande. Rekommenderar varmt!',
    rating: 5,
    avatar: 'LS'
  },
  {
    name: 'Sofia Nilsson',
    role: 'Engelsklärare, Grundskola',
    school: 'Norra Real',
    content: 'Perfekt för att variera undervisningen. Eleverna kan arbeta i sitt eget tempo och jag får detaljerad statistik. Särskilt bra för att förbereda inför prov.',
    rating: 5,
    avatar: 'SN'
  },
  {
    name: 'Johan Eriksson',
    role: 'Fysiklärare, Gymnasium',
    school: 'Kungliga Tekniska Högskolan',
    content: 'AI-genererade frågor är verkligen intelligenta. De anpassar sig till årskurs och svårighetsgrad automatiskt. Sparar massor av tid och eleverna får bättre feedback.',
    rating: 5,
    avatar: 'JE'
  }
]

export function SocialProof() {
  return (
    <ResponsiveSection id="social-proof" className="bg-neutral-50 dark:bg-neutral-950">
      <ResponsiveContainer size="xl" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Stats */}
          <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
            <ResponsiveHeading level={2} className="mb-4 text-foreground">
              Förtroende av tusentals lärare
            </ResponsiveHeading>
            <Typography variant="subtitle1" className="text-muted-foreground mb-8 text-lg sm:text-xl">
              Används i över 500 skolor i Sverige
            </Typography>
            
            <ResponsiveGrid cols={{ default: 2, md: 4 }} gap="md">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mx-auto mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
                </div>
              ))}
            </ResponsiveGrid>
          </motion.div>

          {/* Testimonials */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <ResponsiveHeading level={3} className="mb-4 text-foreground">
                Vad säger lärare om Skolapp?
              </ResponsiveHeading>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-500 fill-current" />
                ))}
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  4.8/5 baserat på 247 recensioner
                </span>
              </div>
            </div>

            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-500 fill-current" />
                        ))}
                      </div>
                      
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {testimonial.role}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500">
                            {testimonial.school}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <Quote size={20} className="text-primary-200 absolute -top-2 -left-2" />
                        <Typography variant="body2" className="text-neutral-700 dark:text-neutral-300 italic pl-6">
                          &ldquo;{testimonial.content}&rdquo;
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
