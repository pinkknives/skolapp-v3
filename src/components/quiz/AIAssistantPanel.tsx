'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { 
  Sparkles, 
  BookOpen, 
  Zap, 
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { isOpenAIAvailable } from '@/lib/ai/openai'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

interface AIAssistantPanelProps {
  onGenerateQuestions: () => void
  onGenerateTitle: () => void
  onGenerateAnswers: () => void
  onSimplifyText: () => void
  isGenerating?: boolean
  hasQuestions?: boolean
  subject?: string
  gradeLevel?: string
}

export function AIAssistantPanel({
  onGenerateQuestions,
  onGenerateTitle,
  onGenerateAnswers,
  onSimplifyText,
  isGenerating = false,
  hasQuestions = false,
  subject = '',
  gradeLevel = ''
}: AIAssistantPanelProps) {
  // const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const aiFeatures = [
    {
      id: 'questions',
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Generera frågor',
      description: 'Låt AI skapa frågor baserat på ämne och årskurs',
      action: onGenerateQuestions,
      primary: true,
      available: true
    },
    {
      id: 'title',
      icon: <Zap className="w-5 h-5" />,
      title: 'Förslag på titel',
      description: 'Få AI-förslag på engagerande quiz-titlar',
      action: onGenerateTitle,
      primary: false,
      available: true
    },
    {
      id: 'answers',
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Generera svar',
      description: 'Låt AI skapa svarsalternativ för flervalsfrågor',
      action: onGenerateAnswers,
      primary: false,
      available: hasQuestions
    },
    {
      id: 'simplify',
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Förenkla text',
      description: 'Anpassa textens svårighetsgrad för eleverna',
      action: onSimplifyText,
      primary: false,
      available: hasQuestions
    }
  ]

  const getContextInfo = () => {
    if (subject && gradeLevel) {
      return `För ${subject} i årskurs ${gradeLevel}`
    } else if (subject) {
      return `För ${subject}`
    } else if (gradeLevel) {
      return `För årskurs ${gradeLevel}`
    }
    return 'Baserat på dina inställningar'
  }

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200
      dark:from-neutral-900 dark:to-neutral-900 dark:border-neutral-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              AI Quiz-assistent
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs
                      border-neutral-300 bg-white/60 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300 cursor-default">
                      {isOpenAIAvailable ? 'OpenAI aktiv' : 'Demo‑läge'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography variant="caption">
                      {isOpenAIAvailable ? 'Modell: gpt-4o-mini' : 'Visar placeholder-svar – aktivera OPENAI_API_KEY för riktiga frågor.'}
                    </Typography>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <Typography variant="body2" className="text-neutral-600 dark:text-neutral-300">
              Generera frågor automatiskt. {getContextInfo()}
            </Typography>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Status */}
        <div className="bg-white border border-primary-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 text-primary-600 animate-spin" />
                <Typography variant="body2" className="text-primary-700">
                  AI arbetar...
                </Typography>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-success-600" />
                <Typography variant="body2" className="text-success-700">
                  AI redo att hjälpa
                </Typography>
              </>
            )}
          </div>
        </div>

        {/* AI Features */}
        <div className="grid grid-cols-1 gap-3">
          {aiFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`border rounded-lg p-3 transition-all ${
                feature.available
                  ? 'border-neutral-200 hover:border-primary-300 bg-white'
                  : 'border-neutral-100 bg-neutral-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    feature.available 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <Typography variant="body2" className="font-medium">
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" className="text-neutral-600">
                      {feature.description}
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!feature.available && (
                    <AlertCircle className="w-4 h-4 text-neutral-400" />
                  )}
                  <Button
                    size="sm"
                    variant={feature.primary ? 'primary' : 'outline'}
                    onClick={feature.action}
                    disabled={!feature.available || isGenerating}
                    rightIcon={feature.primary ? <ArrowRight size={14} /> : undefined}
                  >
                    {feature.primary ? 'Generera' : 'Använd'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <Typography variant="body2" className="font-medium text-blue-800 mb-1">
                Pro tips för bästa resultat
              </Typography>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ange tydligt ämne och årskurs för bättre AI-förslag</li>
                <li>• AI använder Skolverkets läroplaner som referens</li>
                <li>• Du kan alltid redigera AI-genererat innehåll</li>
                <li>• Kombinera AI med manuell redigering för bästa resultat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-primary-200">
          <Typography variant="caption" className="text-neutral-600 mb-3 block">
            Snabbåtgärder
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateQuestions}
              disabled={isGenerating}
              className="text-xs"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Generera 5 frågor
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateTitle}
              disabled={isGenerating}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Föreslå titel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
