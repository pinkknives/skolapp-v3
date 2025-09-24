'use client'

import React from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { 
  Logo, 
  ResponsiveLogo 
} from '@/components/brand/Logo'

export default function LogoDemoPage() {
  return (
    <Layout>
      <Container>
        <Section spacing="lg">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <Heading level={1}>Logo Demo</Heading>
            <Typography variant="body1" className="text-muted-foreground max-w-2xl mx-auto">
              Demonstration av alla tillgängliga logotyp-variants och storlekar i Skolapp v3
            </Typography>
          </div>

          {/* Logo Variants */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Logo Variants</CardTitle>
                <CardDescription>Olika stilvarianter av Skolapp-logotypen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center space-y-2">
                    <Logo variant="icon" size="lg" />
                    <Typography variant="caption">Icon</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="wordmark" size="lg" />
                    <Typography variant="caption">Wordmark</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="stacked" size="lg" />
                    <Typography variant="caption">Stacked</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="color" size="lg" />
                    <Typography variant="caption">Color</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="gradient" size="lg" />
                    <Typography variant="caption">Gradient</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="monochrome" size="lg" />
                    <Typography variant="caption">Monochrome</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="white" size="lg" />
                    <Typography variant="caption">White</Typography>
                  </div>
                  <div className="text-center space-y-2">
                    <Logo variant="dark" size="lg" />
                    <Typography variant="caption">Dark</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Logo Sizes</CardTitle>
                <CardDescription>Olika storlekar av logotypen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
                    <div key={size} className="flex items-center space-x-4">
                      <Typography variant="body2" className="w-12 text-right">
                        {size}
                      </Typography>
                      <Logo variant="icon" size={size} />
                      <Logo variant="wordmark" size={size} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Responsive Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Responsive Logo</CardTitle>
                <CardDescription>Logo som anpassar sig till skärmstorlek</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <Typography variant="body2" className="mb-2">Mobile (icon) / Desktop (wordmark)</Typography>
                    <ResponsiveLogo 
                      mobileVariant="icon"
                      desktopVariant="wordmark"
                      size="lg"
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Typography variant="body2" className="mb-2">Mobile (stacked) / Desktop (gradient)</Typography>
                    <ResponsiveLogo 
                      mobileVariant="stacked"
                      desktopVariant="gradient"
                      size="lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dark Mode Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Dark Mode Examples</CardTitle>
                <CardDescription>Logotyper på mörk bakgrund</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-900 p-6 rounded-lg space-y-4">
                    <Typography variant="body2" className="text-white">Dark Background</Typography>
                    <div className="space-y-2">
                      <Logo variant="white" size="lg" />
                      <Logo variant="monochrome" size="lg" />
                      <Logo variant="gradient" size="lg" />
                    </div>
                  </div>
                  <div className="bg-primary-600 p-6 rounded-lg space-y-4">
                    <Typography variant="body2" className="text-white">Primary Background</Typography>
                    <div className="space-y-2">
                      <Logo variant="white" size="lg" />
                      <Logo variant="monochrome" size="lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Användningsexempel</CardTitle>
                <CardDescription>Hur logotyper används i applikationen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <Typography variant="body2" className="mb-2">Navbar (Responsive)</Typography>
                    <div className="flex items-center space-x-2">
                      <ResponsiveLogo 
                        mobileVariant="icon"
                        desktopVariant="wordmark"
                        size="lg"
                        className="text-primary-600"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <Typography variant="body2" className="mb-2">Footer (Responsive)</Typography>
                    <div className="flex items-center space-x-2">
                      <ResponsiveLogo 
                        mobileVariant="icon"
                        desktopVariant="wordmark"
                        size="lg"
                        className="text-primary-600"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <Typography variant="body2" className="mb-2">Loading States</Typography>
                    <div className="flex items-center space-x-4">
                      <Logo variant="icon" size="sm" />
                      <Logo variant="icon" size="md" />
                      <Logo variant="icon" size="lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Kod-exempel</CardTitle>
                <CardDescription>Hur du använder logotyperna i din kod</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                    <Typography variant="code" className="text-sm">
                      {`// Grundläggande användning
<Logo variant="wordmark" size="lg" />

// Responsiv logo
<ResponsiveLogo 
  mobileVariant="icon"
  desktopVariant="wordmark"
  size="lg"
/>

// Med anpassad styling
<Logo 
  variant="gradient" 
  size="xl" 
  className="text-primary-600"
  showText={true}
/>`}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </Container>
    </Layout>
  )
}
