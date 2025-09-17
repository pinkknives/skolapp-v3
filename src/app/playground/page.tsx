'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Typography, Heading, Text, Code, Kbd, Link } from '@/components/ui/Typography'
import { tokens } from '@/lib/design-tokens'

export default function PlaygroundPage() {
  const [inputValue, setInputValue] = useState('')

  return (
    <Layout>
      <Section>
        <Container>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <Heading level={1} className="text-primary-600 mb-4">
                Design System Playground
              </Heading>
              <Text className="text-neutral-600 text-lg">
                Testa och visa upp Skolapps designtokens och komponenter
              </Text>
            </div>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle>Färger</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Primary Colors */}
                  <div>
                    <Typography variant="h4" className="mb-4">Primary</Typography>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {Object.entries(tokens.colors.primary).map(([scale, color]) => (
                        <div key={scale} className="text-center">
                          <div 
                            className="w-12 h-12 rounded-lg shadow-sm border border-neutral-200 mb-2"
                            style={{ backgroundColor: color }}
                          />
                          <Text size="sm" className="text-neutral-600">{scale}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neutral Colors */}
                  <div>
                    <Typography variant="h4" className="mb-4">Neutral</Typography>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {Object.entries(tokens.colors.neutral).map(([scale, color]) => (
                        <div key={scale} className="text-center">
                          <div 
                            className="w-12 h-12 rounded-lg shadow-sm border border-neutral-200 mb-2"
                            style={{ backgroundColor: color }}
                          />
                          <Text size="sm" className="text-neutral-600">{scale}</Text>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Semantic Colors */}
                  <div>
                    <Typography variant="h4" className="mb-4">Semantiska färger</Typography>
                    <div className="grid grid-cols-3 gap-4">
                      {['success', 'warning', 'error'].map((semantic) => (
                        <div key={semantic} className="text-center">
                          <Typography variant="h5" className="mb-2 capitalize">{semantic}</Typography>
                          <div className="flex justify-center gap-2">
                            {Object.entries(tokens.colors[semantic as keyof typeof tokens.colors]).map(([scale, color]) => (
                              <div key={scale} className="text-center">
                                <div 
                                  className="w-10 h-10 rounded-lg shadow-sm border border-neutral-200 mb-1"
                                  style={{ backgroundColor: color }}
                                />
                                <Text size="sm" className="text-neutral-600">{scale}</Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typografi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Typography variant="h4" className="mb-4">Rubriker</Typography>
                    <div className="space-y-4">
                      <Heading level={1}>Rubrik nivå 1</Heading>
                      <Heading level={2}>Rubrik nivå 2</Heading>
                      <Heading level={3}>Rubrik nivå 3</Heading>
                      <Heading level={4}>Rubrik nivå 4</Heading>
                      <Heading level={5}>Rubrik nivå 5</Heading>
                      <Heading level={6}>Rubrik nivå 6</Heading>
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="h4" className="mb-4">Brödtext</Typography>
                    <div className="space-y-3">
                      <Typography variant="body1">Brödtext stor - Detta är en vanlig paragraf med normal storlek för läsning av längre texter.</Typography>
                      <Typography variant="body2">Brödtext liten - Mindre text som kan användas för mindre viktiga detaljer eller kompakt information.</Typography>
                      <Typography variant="caption">Bildtext - Mycket liten text för bildtexter, metadata eller hjälptext.</Typography>
                    </div>
                  </div>

                  <div>
                    <Typography variant="h4" className="mb-4">Specialtext</Typography>
                    <div className="space-y-3">
                      <div>
                        <Code>const exempelKod = &quot;Detta är kod&quot;;</Code>
                      </div>
                      <div>
                        <Text>Tryck <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> för att kopiera</Text>
                      </div>
                      <div>
                        <Link href="#">Detta är en länk</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Knappar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Typography variant="h4" className="mb-4">Varianter</Typography>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary">Primär</Button>
                      <Button variant="secondary">Sekundär</Button>
                      <Button variant="outline">Kontur</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destruktiv</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="h4" className="mb-4">Storlekar</Typography>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Liten</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Stor</Button>
                    </div>
                  </div>

                  <div>
                    <Typography variant="h4" className="mb-4">Tillstånd</Typography>
                    <div className="flex flex-wrap gap-4">
                      <Button>Normal</Button>
                      <Button disabled>Inaktiverad</Button>
                      <Button fullWidth>Full bredd</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Formulärelement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-md">
                  <Input
                    label="Standard input"
                    placeholder="Skriv här..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  
                  <Input
                    label="E-postadress"
                    type="email"
                    placeholder="namn@exempel.se"
                    helperText="Vi kommer aldrig att dela din e-postadress"
                  />
                  
                  <Input
                    label="Lösenord"
                    type="password"
                    placeholder="Skriv ditt lösenord"
                  />
                  
                  <Input
                    label="Input med fel"
                    placeholder="Detta fält har ett fel"
                    errorMessage="Detta fält är obligatoriskt"
                  />
                  
                  <Input
                    label="Inaktiverad input"
                    placeholder="Detta fält är inaktiverat"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Kort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Enkelt kort</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text>Detta är ett enkelt kort med rubrik och innehåll.</Text>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Kort med beskrivning</CardTitle>
                      <Typography variant="body2" className="text-neutral-600">
                        Här är en beskrivning
                      </Typography>
                    </CardHeader>
                    <CardContent>
                      <Text>Detta kort har både rubrik och beskrivning.</Text>
                      <Button variant="outline" className="mt-4">
                        Handling
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Interaktivt kort</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text className="mb-4">Detta kort innehåller interaktiva element.</Text>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Skriv något"
                          size="sm"
                        />
                        <Button variant="primary" size="sm" fullWidth>
                          Skicka
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Spacing */}
            <Card>
              <CardHeader>
                <CardTitle>Mellanrum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Typography variant="h4" className="mb-4">Spacing-skala</Typography>
                  {Object.entries(tokens.spacing).map(([scale, size]) => (
                    <div key={scale} className="flex items-center gap-4">
                      <div className="w-16">
                        <Code className="text-sm">{scale}</Code>
                      </div>
                      <div 
                        className="bg-primary-200 h-4"
                        style={{ width: size }}
                      />
                      <Text size="sm" className="text-neutral-600">{size}</Text>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motion */}
            <Card>
              <CardHeader>
                <CardTitle>Animationer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Typography variant="h4" className="mb-4">Hastigheter</Typography>
                    <div className="space-y-2">
                      {Object.entries(tokens.motion.duration).map(([name, duration]) => (
                        <div key={name} className="flex items-center gap-4">
                          <div className="w-16">
                            <Code className="text-sm">{name}</Code>
                          </div>
                          <Text size="sm" className="text-neutral-600">{duration}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="h4" className="mb-4">Testanimation</Typography>
                    <Button 
                      variant="primary"
                      className="transition-transform hover:scale-105 duration-150"
                    >
                      Hovra över mig
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}