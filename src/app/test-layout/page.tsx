'use client'

import React from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography, Heading } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'

export default function TestLayoutPage() {
  return (
    <Layout>
      <Section className="min-h-screen py-12 bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="xl" className="max-w-6xl">
          <div className="text-center mb-12">
            <Heading level={1} className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Layout Test
            </Heading>
            <Typography variant="subtitle1" className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Detta är en test-sida för att kontrollera layouten och se om allt ser bra ut.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Test Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body1">
                  Detta är en test-kort för att se hur layouten ser ut.
                </Typography>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Test Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body1">
                  Detta är en test-kort för att se hur layouten ser ut.
                </Typography>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Test Card 3</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body1">
                  Detta är en test-kort för att se hur layouten ser ut.
                </Typography>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="px-8 py-4">
              Test Button
            </Button>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}
