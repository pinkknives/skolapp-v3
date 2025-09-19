/**
 * RLS Testing Page
 * Simple interface to run RLS verification tests manually
 */

'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { runRLSTests } from '@/app/actions/rls-tests'
import { Shield, Play, CheckCircle, XCircle } from 'lucide-react'

export default function RLSTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    report: string
    summary: string
  } | null>(null)

  const handleRunTests = async () => {
    setLoading(true)
    setResults(null)

    try {
      const testResults = await runRLSTests()
      setResults(testResults)
    } catch (error) {
      setResults({
        success: false,
        report: `Error running tests: ${error instanceof Error ? error.message : 'Unknown error'}`,
        summary: 'Test execution failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <Heading level={1} className="mb-2 flex items-center gap-3">
              <Shield className="text-primary-600" size={32} />
              RLS Verification Tests
            </Heading>
            <Typography variant="subtitle1" className="text-neutral-600">
              Testa att Row Level Security (RLS) fungerar korrekt för organisationsisolering.
            </Typography>
          </div>

          <div className="space-y-6">
            {/* Test runner card */}
            <Card>
              <CardHeader>
                <CardTitle>Kör RLS-tester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Typography variant="body2" className="text-neutral-600">
                    Detta testet verifierar att användare från olika organisationer inte kan 
                    komma åt varandras data (quiz, medlemmar, försök).
                  </Typography>
                  
                  <Button
                    onClick={handleRunTests}
                    disabled={loading}
                    leftIcon={<Play size={16} />}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Kör tester...' : 'Starta RLS-tester'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results card */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {results.success ? (
                      <CheckCircle className="text-success-600" size={20} />
                    ) : (
                      <XCircle className="text-error-600" size={20} />
                    )}
                    Testresultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <Typography variant="body2" className="font-medium mb-2">
                        Sammanfattning:
                      </Typography>
                      <pre className="text-sm text-neutral-700 whitespace-pre-wrap">
                        {results.summary}
                      </pre>
                    </div>

                    {/* Full report */}
                    <div>
                      <Typography variant="body2" className="font-medium mb-2">
                        Fullständig rapport:
                      </Typography>
                      <div className="p-4 bg-neutral-900 text-neutral-100 rounded-lg overflow-x-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {results.report}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info card */}
            <Card>
              <CardHeader>
                <CardTitle>Om RLS-tester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Typography variant="body2" className="text-neutral-700">
                    <strong>Vad testas:</strong>
                  </Typography>
                  <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1 ml-4">
                    <li>Användare från organisation A kan inte läsa quiz från organisation B</li>
                    <li>Användare från organisation A kan inte se medlemmar från organisation B</li>
                    <li>Användare från organisation A kan inte se försök på quiz från organisation B</li>
                    <li>Användare från organisation A kan inte läsa organisationsdetaljer för organisation B</li>
                  </ul>
                  
                  <Typography variant="body2" className="text-neutral-700 mt-4">
                    <strong>Förväntat resultat:</strong> Alla queries ska antingen ge "permission denied" 
                    eller tomma resultat, vilket indikerar att RLS-policies fungerar korrekt.
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}