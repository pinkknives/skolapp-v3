'use client'

import React, { useState } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Radio } from '@/components/ui/Radio'
import { Switch } from '@/components/ui/Switch'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function ComponentTestPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    acceptTerms: false,
    gender: '',
    enableNotifications: false,
  })

  const [darkMode, setDarkMode] = useState(false)

  const categoryOptions = [
    { value: '', label: 'Välj kategori' },
    { value: 'matematik', label: 'Matematik' },
    { value: 'svenska', label: 'Svenska' },
    { value: 'engelska', label: 'Engelska' },
    { value: 'naturvetenskap', label: 'Naturvetenskap' },
  ]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout>
        <Section className="py-12">
          <Container>
            <div className="mb-8 text-center">
              <Heading level={1} className="mb-4">
                Formulärkontroller Test
              </Heading>
              <Typography variant="subtitle1" className="text-neutral-600 mb-4">
                Test av förbättrade formulärfält med design tokens och a11y
              </Typography>
              <Button onClick={toggleDarkMode}>
                Växla till {darkMode ? 'ljust' : 'mörkt'} läge
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Basic Form Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Grundläggande fält</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    label="Namn"
                    placeholder="Ange ditt namn"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    helperText="Detta fält är obligatoriskt"
                    required
                  />

                  <Input
                    label="E-post"
                    type="email"
                    placeholder="din@email.se"
                    errorMessage="Ogiltig e-postadress"
                  />

                  <Input
                    label="Lösenord"
                    type="password"
                    placeholder="Ange lösenord"
                    showPasswordToggle
                    helperText="Minst 8 tecken"
                  />

                  <Textarea
                    label="Beskrivning"
                    placeholder="Beskriv ditt quiz..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    helperText="Berätta mer om innehållet"
                  />

                  <Select
                    label="Kategori"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    helperText="Välj vilken kategori som passar bäst"
                  />
                </CardContent>
              </Card>

              {/* Choice Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Valkomponenter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    label="Checkbox exempel"
                    helperText="Välj de alternativ som gäller för dig"
                  >
                    <div className="space-y-3">
                      <Checkbox
                        label="Jag accepterar användarvillkoren"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                      />
                      <Checkbox
                        label="Jag vill få nyhetsbrev"
                        size="sm"
                      />
                      <Checkbox
                        label="Stor checkbox"
                        size="lg"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Kön"
                    helperText="Välj det som stämmer bäst"
                  >
                    <div className="space-y-3">
                      <Radio
                        name="gender"
                        value="man"
                        label="Man"
                        checked={formData.gender === 'man'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      />
                      <Radio
                        name="gender"
                        value="kvinna"
                        label="Kvinna"
                        checked={formData.gender === 'kvinna'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      />
                      <Radio
                        name="gender"
                        value="annat"
                        label="Annat/vill inte säga"
                        checked={formData.gender === 'annat'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Switch exempel"
                    helperText="Aktivera eller inaktivera funktioner"
                  >
                    <div className="space-y-3">
                      <Switch
                        label="Aktivera notifikationer"
                        checked={formData.enableNotifications}
                        onChange={(e) => setFormData(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                      />
                      <Switch
                        label="Liten switch"
                        size="sm"
                      />
                      <Switch
                        label="Stor switch"
                        size="lg"
                      />
                    </div>
                  </FormField>

                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Skicka formulär
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* State examples */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Tillstånd och varianter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-4">
                    <Typography variant="subtitle2">Standard tillstånd</Typography>
                    <Input placeholder="Normal input" />
                    <Textarea placeholder="Normal textarea" />
                    <Select options={[{ value: '', label: 'Välj alternativ' }]} />
                  </div>

                  <div className="space-y-4">
                    <Typography variant="subtitle2">Fel-tillstånd</Typography>
                    <Input 
                      placeholder="Input med fel" 
                      errorMessage="Detta fält är obligatoriskt"
                    />
                    <Textarea 
                      placeholder="Textarea med fel" 
                      errorMessage="För kort beskrivning"
                    />
                    <Select 
                      options={[{ value: '', label: 'Välj alternativ' }]} 
                      errorMessage="Du måste välja ett alternativ"
                    />
                  </div>

                  <div className="space-y-4">
                    <Typography variant="subtitle2">Inaktiverade</Typography>
                    <Input placeholder="Inaktiverad input" disabled />
                    <Textarea placeholder="Inaktiverad textarea" disabled />
                    <Select 
                      options={[{ value: '', label: 'Välj alternativ' }]} 
                      disabled 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </Layout>
    </div>
  )
}