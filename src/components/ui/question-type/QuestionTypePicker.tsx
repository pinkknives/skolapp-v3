"use client";

import React from 'react';
import { CheckCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { QuestionTypeButton } from './QuestionTypeButton';
import type { QuestionType } from '@/types/quiz';

// Import UI strings from the new ui.json file
import uiStrings from '@/locales/sv/ui.json';

export interface QuestionTypePickerProps {
  // Stateful usage (controlled component)
  value?: QuestionType;
  onChange?: (type: QuestionType) => void;
  // Action-based usage (for adding questions)
  onSelectType?: (type: QuestionType) => void;
  selectedType?: QuestionType;
  className?: string;
}

// Updated to support both APIs from the issue and existing usage
export function QuestionTypePicker({
  value,
  onChange,
  onSelectType,
  selectedType,
  className
}: QuestionTypePickerProps) {
  const groupId = React.useId();
  
  // Use value/onChange if provided (new API), otherwise fall back to onSelectType/selectedType (existing API)
  const currentValue = value ?? selectedType;
  const handleSelect = onChange ?? onSelectType;

  const questionTypeConfigs = [
    {
      type: 'multiple-choice' as QuestionType,
      label: uiStrings.ui.questionTypes.multipleChoice,
      description: 'Elever väljer bland flera alternativ',
      icon: <CheckCircle size={20} strokeWidth={1.5} />
    },
    {
      type: 'free-text' as QuestionType,
      label: uiStrings.ui.questionTypes.freeText,
      description: 'Elever skriver eget svar',
      icon: <FileText size={20} strokeWidth={1.5} />
    },
    {
      type: 'image' as QuestionType,
      label: uiStrings.ui.questionTypes.image,
      description: 'Lägg till visuellt innehåll',
      icon: <ImageIcon size={20} strokeWidth={1.5} />
    }
  ];

  return (
    <div 
      className={className}
      role="radiogroup" 
      aria-labelledby={`${groupId}-label`}
    >
      <span id={`${groupId}-label`} className="sr-only">
        Välj frågetyp
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questionTypeConfigs.map((config) => (
          <QuestionTypeButton
            key={config.type}
            type={config.type}
            label={config.label}
            description={config.description}
            icon={config.icon}
            isSelected={currentValue === config.type}
            onSelect={handleSelect || (() => {})}
          />
        ))}
      </div>
    </div>
  );
}