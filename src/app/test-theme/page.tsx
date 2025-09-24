'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { Mail, Settings, Plus } from 'lucide-react'

export default function ThemeTestPage() {
  const { theme } = useTheme()
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  const selectOptions = [
    { value: 'option1', label: 'Alternativ 1' },
    { value: 'option2', label: 'Alternativ 2' },
    { value: 'option3', label: 'Alternativ 3' },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tema Test</h1>
            <p className="text-muted-foreground mt-2">
              Aktuellt tema: <span className="font-semibold">{theme === 'dark' ? 'Mörkt' : 'Ljust'}</span>
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color Palette Test */}
        <Card>
          <CardHeader>
            <CardTitle>Färgpalett</CardTitle>
            <CardDescription>Test av alla färgvariabler i båda lägen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Primary</h3>
                <div className="space-y-1">
                  <div className="h-8 bg-primary-500 rounded flex items-center justify-center text-white text-xs font-medium">500</div>
                  <div className="h-8 bg-primary-600 rounded flex items-center justify-center text-white text-xs font-medium">600</div>
                  <div className="h-8 bg-primary-700 rounded flex items-center justify-center text-white text-xs font-medium">700</div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Neutral</h3>
                <div className="space-y-1">
                  <div className="h-8 bg-neutral-100 border border-neutral-300 rounded flex items-center justify-center text-neutral-900 text-xs font-medium">100</div>
                  <div className="h-8 bg-neutral-500 rounded flex items-center justify-center text-white text-xs font-medium">500</div>
                  <div className="h-8 bg-neutral-800 rounded flex items-center justify-center text-white text-xs font-medium">800</div>
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Status</h3>
                <div className="space-y-1">
                  <div className="h-8 bg-success-500 rounded flex items-center justify-center text-white text-xs font-medium">Success</div>
                  <div className="h-8 bg-warning-500 rounded flex items-center justify-center text-white text-xs font-medium">Warning</div>
                  <div className="h-8 bg-error-500 rounded flex items-center justify-center text-white text-xs font-medium">Error</div>
                </div>
              </div>

              {/* Background Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Background</h3>
                <div className="space-y-1">
                  <div className="h-8 bg-background border border-border rounded flex items-center justify-center text-foreground text-xs font-medium">Background</div>
                  <div className="h-8 bg-card border border-border rounded flex items-center justify-center text-card-foreground text-xs font-medium">Card</div>
                  <div className="h-8 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs font-medium">Muted</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants Test */}
        <Card>
          <CardHeader>
            <CardTitle>Knappar</CardTitle>
            <CardDescription>Alla knappvarianter och storlekar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Varainter</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Storlekar</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Tillstånd</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button leftIcon={<Plus className="h-4 w-4" />}>Med ikon</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Test */}
        <Card>
          <CardHeader>
            <CardTitle>Formulärkomponenter</CardTitle>
            <CardDescription>Input, Select och andra formulärelement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Input Variants */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Input-fält</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Standard input"
                    placeholder="Skriv här..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input
                    label="Med ikon"
                    placeholder="E-post"
                    leftIcon={<Mail className="h-4 w-4" />}
                  />
                  <Input
                    label="Lösenord"
                    type="password"
                    placeholder="Lösenord"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    showPasswordToggle
                  />
                  <Input
                    label="Felmeddelande"
                    placeholder="Detta fält har fel"
                    errorMessage="Detta fält är obligatoriskt"
                    variant="error"
                  />
                </div>
              </div>

              {/* Select Component */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Select-fält</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Standard select"
                    placeholder="Välj alternativ"
                    options={selectOptions}
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                  />
                  <Select
                    label="Med hjälptext"
                    placeholder="Välj alternativ"
                    options={selectOptions}
                    helperText="Välj det alternativ som passar bäst"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants Test */}
        <Card>
          <CardHeader>
            <CardTitle>Kortvarianter</CardTitle>
            <CardDescription>Olika kortstilar och padding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card variant="default" padding="sm">
                <CardHeader>
                  <CardTitle className="text-base">Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Standard kort med liten padding</p>
                </CardContent>
              </Card>

              <Card variant="outlined" padding="md">
                <CardHeader>
                  <CardTitle className="text-base">Outlined</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Kort med outline-stil</p>
                </CardContent>
              </Card>

              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle className="text-base">Elevated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Kort med skugga</p>
                </CardContent>
              </Card>

              <Card variant="interactive" padding="md">
                <CardHeader>
                  <CardTitle className="text-base">Interactive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Klickbart kort</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>Typografi</CardTitle>
            <CardDescription>Textstilar och hierarki</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">H1 Heading</h1>
                <h2 className="text-3xl font-semibold text-foreground">H2 Heading</h2>
                <h3 className="text-2xl font-semibold text-foreground">H3 Heading</h3>
                <h4 className="text-xl font-semibold text-foreground">H4 Heading</h4>
                <h5 className="text-lg font-semibold text-foreground">H5 Heading</h5>
                <h6 className="text-base font-semibold text-foreground">H6 Heading</h6>
              </div>
              
              <div className="space-y-2">
                <p className="text-base text-foreground">Detta är en vanlig paragraf med text.</p>
                <p className="text-sm text-muted-foreground">Detta är mindre text med muted färg.</p>
                <p className="text-xs text-muted-foreground">Detta är mycket liten text.</p>
              </div>

              <div className="space-y-2">
                <p className="text-primary-600 dark:text-primary-400">Primär färg text</p>
                <p className="text-success-600 dark:text-success-400">Success färg text</p>
                <p className="text-warning-600 dark:text-warning-400">Warning färg text</p>
                <p className="text-error-600 dark:text-error-400">Error färg text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tillgänglighet</CardTitle>
            <CardDescription>Focus states och kontrast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Testa att navigera med Tab-tangenten för att se focus states.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Fokusbar knapp</Button>
                <Input placeholder="Fokusbart input" />
                <Select
                  placeholder="Fokusbar select"
                  options={selectOptions}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
