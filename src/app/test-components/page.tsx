'use client';

import React, { useState } from 'react';
import { QuestionTypePicker } from '@/components/ui/question-type/QuestionTypePicker';
import { ActionsMenu, ActionItem } from '@/components/ui/actions/ActionsMenu';
import { Container, Section } from '@/components/layout/Layout';
import { Heading, Typography } from '@/components/ui/Typography';
import type { QuestionType } from '@/types/quiz';

export default function ComponentTestPage() {
  const [selectedType, setSelectedType] = useState<QuestionType>('multiple-choice');

  const actions: ActionItem[] = [
    { key: 'new', label: 'Ny fråga', kbd: '⌘N', onSelect: () => console.log('New question') },
    { key: 'copy', label: 'Kopiera länk', kbd: '⌘C', onSelect: () => console.log('Copy link') },
    { key: 'edit', label: 'Redigera', kbd: '⌘⇧E', onSelect: () => console.log('Edit') },
    { key: 'delete', label: 'Ta bort', kbd: '⌘⌫', onSelect: () => console.log('Delete'), danger: true },
  ];

  return (
    <Section className="py-12">
      <Container>
        <div className="mb-8">
          <Heading level={1} className="mb-4">
            Component Test Page
          </Heading>
          <Typography variant="subtitle1" className="text-neutral-600">
            Testing new HeroUI components implementation
          </Typography>
        </div>

        <div className="space-y-12">
          {/* Question Type Picker - Stateful API */}
          <div>
            <Heading level={2} className="mb-4">
              Question Type Picker (Stateful)
            </Heading>
            <Typography variant="body1" className="mb-6 text-neutral-600">
              Using value/onChange API. Selected: {selectedType}
            </Typography>
            <QuestionTypePicker 
              value={selectedType} 
              onChange={setSelectedType} 
            />
          </div>

          {/* Question Type Picker - Action API */}
          <div>
            <Heading level={2} className="mb-4">
              Question Type Picker (Action-based)
            </Heading>
            <Typography variant="body1" className="mb-6 text-neutral-600">
              Using onSelectType API for adding questions
            </Typography>
            <QuestionTypePicker 
              onSelectType={(type) => console.log('Adding question of type:', type)} 
            />
          </div>

          {/* Actions Menu */}
          <div>
            <Heading level={2} className="mb-4">
              Actions Menu
            </Heading>
            <Typography variant="body1" className="mb-6 text-neutral-600">
              Dropdown menu with shortcuts and danger actions
            </Typography>
            <div className="flex justify-start">
              <ActionsMenu items={actions} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}