'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { ResponsiveContainer, ResponsiveSection, ResponsiveHeading } from '@/components/layout/ResponsiveContainer'
import { ChevronDown, ChevronUp, HelpCircle, Shield, CreditCard, Zap, Globe } from 'lucide-react'

const faqCategories = [
  {
    id: 'general',
    title: 'Allmänt',
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        question: 'Vad är Skolapp?',
        answer: 'Skolapp är en AI-driven plattform för att skapa, hantera och köra interaktiva quiz och live-sessioner i klassrummet. Vi hjälper lärare att spara tid genom automatisk rättning och ger elever en engagerande lärupplevelse.'
      },
      {
        question: 'Hur fungerar Skolapp?',
        answer: 'Lärare kan antingen skapa quiz manuellt eller använda vår AI-assistent för att generera frågor baserat på ämne och årskurs. Quiz kan köras live i klassrummet eller delas med elever för individuell genomgång. Alla svar rättas automatiskt och resultat analyseras i realtid.'
      },
      {
        question: 'Vilka ämnen stöds?',
        answer: 'Vi stöder alla ämnen från grundskola till gymnasium, inklusive matematik, svenska, engelska, naturvetenskap, historia, geografi och många fler. Vår AI är tränad på Skolverkets läroplaner och kan anpassa frågor efter specifika kurser och årskurser.'
      },
      {
        question: 'Behöver elever ladda ner en app?',
        answer: 'Nej! Elever kan delta via webbläsare på vilken enhet som helst - dator, surfplatta eller mobiltelefon. Ingen appinstallation krävs, vilket gör det enkelt att komma igång direkt.'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'Prissättning & Betalning',
    icon: <CreditCard className="w-5 h-5" />,
    questions: [
      {
        question: 'Vilka abonnemang erbjuder ni?',
        answer: 'Vi erbjuder tre planer: Gratis (för att testa), Standard (89 kr/månad för enskilda lärare) och Skola (149 kr/månad per lärare för hela skolan). Alla planer inkluderar grundläggande funktioner, med fler funktioner och support på högre nivåer.'
      },
      {
        question: 'Finns det en gratis provperiod?',
        answer: 'Ja! Du kan testa alla funktioner gratis i 14 dagar utan att behöva ange betalningsinformation. Efter provperioden kan du välja att fortsätta med ett betalt abonnemang eller använda vår begränsade gratisversion.'
      },
      {
        question: 'Vilka betalningsmetoder accepterar ni?',
        answer: 'Vi accepterar alla större kreditkort (Visa, Mastercard, American Express), Swish, Apple Pay, Google Pay och banköverföring. Betalningar hanteras säkert via Stripe och vi erbjuder månads- eller årsfakturering.'
      },
      {
        question: 'Kan jag avsluta mitt abonnemang när som helst?',
        answer: 'Ja, du kan avsluta ditt abonnemang när som helst utan bindningstid. Du behåller tillgång till alla funktioner till slutet av din betalningsperiod.'
      },
      {
        question: 'Finns det rabatter för skolor?',
        answer: 'Ja! Skolplanen erbjuder betydande rabatter för flera lärare och inkluderar administrativa verktyg, centraliserad fakturering och prioriterad support. Kontakta oss för en personlig offert.'
      }
    ]
  },
  {
    id: 'security',
    title: 'Säkerhet & GDPR',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        question: 'Hur säker är min data?',
        answer: 'Vi tar datasäkerhet mycket seriöst. All data krypteras i vila och under överföring, vi följer GDPR-bestämmelser och är certifierade enligt ISO 27001. Våra servrar finns i Sverige och vi genomför regelbundna säkerhetsauditer.'
      },
      {
        question: 'Vad händer med elevernas data?',
        answer: 'Elevernas personuppgifter hanteras enligt GDPR och vår integritetspolicy. Vi samlar endast nödvändig information och raderar data när den inte längre behövs. Elever under 13 år kräver föräldrars samtycke.'
      },
      {
        question: 'Kan jag exportera min data?',
        answer: 'Ja, du kan när som helst exportera all din data i standardformat (JSON, CSV). Vi erbjuder också hjälp med datamigration om du vill byta plattform.'
      },
      {
        question: 'Vem har tillgång till mina quiz?',
        answer: 'Endast du och de elever du bjuder in har tillgång till dina quiz. Vi delar aldrig ditt innehåll med tredje parter utan ditt uttryckliga samtycke.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Tekniskt & Support',
    icon: <Zap className="w-5 h-5" />,
    questions: [
      {
        question: 'Vilka systemkrav gäller?',
        answer: 'Skolapp fungerar i alla moderna webbläsare (Chrome, Firefox, Safari, Edge) på datorer, surfplattor och mobiler. Ingen installation krävs och vi stöder alla operativsystem.'
      },
      {
        question: 'Fungerar det offline?',
        answer: 'Grundläggande funktioner som att skapa quiz fungerar offline, men för att köra live-sessioner och synkronisera data krävs internetanslutning. Vi arbetar på att utöka offline-funktionaliteten.'
      },
      {
        question: 'Hur når jag support?',
        answer: 'Vi erbjuder support via e-post (support@skolapp.se), live-chat på vår webbplats och telefon (mån-fre 08:00-17:00). Premium-användare får prioriterad support med snabbare svarstider.'
      },
      {
        question: 'Finns det integrationsmöjligheter?',
        answer: 'Ja! Vi integrerar med Google Classroom, Microsoft Teams, Canvas, Moodle och andra LMS-system. Vi erbjuder också API:er för anpassade integrationer.'
      }
    ]
  }
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
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="text-neutral-900 dark:text-neutral-100 pr-4">
            {question}
          </Typography>
          <div className="flex-shrink-0">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-primary-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Typography variant="body1" className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {answer}
                </Typography>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </Card>
  )
}

export function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState('general')

  const toggleItem = (categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const currentCategory = faqCategories.find(cat => cat.id === activeCategory)

  return (
    <ResponsiveSection className="bg-neutral-50 dark:bg-neutral-900">
      <ResponsiveContainer size="lg" padding="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.div variants={itemVariants}>
              <ResponsiveHeading level={2} className="mb-4 text-foreground">
                Vanliga frågor
              </ResponsiveHeading>
              <Typography
                variant="subtitle1"
                className="text-left mx-auto max-w-5xl text-muted-foreground text-lg sm:text-xl lg:text-2xl leading-relaxed"
              >
                Hitta svar på de vanligaste frågorna om Skolapp. 
                Kan du inte hitta det du letar efter? Kontakta vår support.
              </Typography>
            </motion.div>
          </div>

          {/* Category Tabs */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  {category.icon}
                  {category.title}
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ Items */}
          <motion.div variants={itemVariants} className="space-y-4">
            {currentCategory?.questions.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openItems[`${activeCategory}-${index}`] || false}
                onToggle={() => toggleItem(activeCategory, index)}
              />
            ))}
          </motion.div>

          {/* Contact CTA */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4 gap-3">
                  <HelpCircle className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  <Heading level={3} className="text-primary-900 dark:text-primary-100">
                    Hittar du inte svaret?
                  </Heading>
                </div>
                <Typography variant="body1" className="text-primary-800 dark:text-primary-200 mb-6">
                  Vår support hjälper dig gärna med alla frågor om Skolapp.
                </Typography>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@skolapp.se"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors gap-2"
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span>E-post support</span>
                  </a>
                  <a
                    href="tel:+46123456789"
                    className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors gap-2"
                  >
                    <span>Ring oss</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </ResponsiveContainer>
    </ResponsiveSection>
  )
}
