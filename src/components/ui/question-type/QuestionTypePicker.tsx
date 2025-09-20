"use client";

import React from 'react';
import { CheckCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { QuestionTypeButton } from './QuestionTypeButton';
import type { QuestionType } from '@/types/quiz';

// Import UI strings from the new ui.json file
import uiStrings from '@/locales/sv/ui.json';

export interface QuestionTypePickerProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
  className?: string;
}

// Updated to use the api specified in the issue (value/onChange instead of selectedType/onSelectType)
export function QuestionTypePicker({
  value,
  onChange,
  className
}: QuestionTypePickerProps) {
  const groupId = React.useId();

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
            isSelected={value === config.type}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  );
}