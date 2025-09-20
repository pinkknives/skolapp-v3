"use client";

import React from 'react';
import { CheckCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { QuestionTypeButton } from './QuestionTypeButton';
import type { QuestionType } from '@/types/quiz';
import { questionTypes } from '@/locales/sv/quiz';

export interface QuestionTypePickerProps {
  onSelectType: (type: QuestionType) => void;
  selectedType?: QuestionType;
  className?: string;
}

const questionTypeConfigs = [
  {
    type: 'multiple-choice' as QuestionType,
    label: questionTypes.multipleChoice.label,
    description: questionTypes.multipleChoice.description,
    icon: <CheckCircle size={20} strokeWidth={1.5} />
  },
  {
    type: 'free-text' as QuestionType,
    label: questionTypes.freeText.label,
    description: questionTypes.freeText.description,
    icon: <FileText size={20} strokeWidth={1.5} />
  },
  {
    type: 'image' as QuestionType,
    label: questionTypes.image.label,
    description: questionTypes.image.description,
    icon: <ImageIcon size={20} strokeWidth={1.5} />
  }
];

export function QuestionTypePicker({
  onSelectType,
  selectedType,
  className
}: QuestionTypePickerProps) {
  return (
    <div 
      className={className}
      role="radiogroup" 
      aria-label={questionTypes.picker.ariaLabel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questionTypeConfigs.map((config) => (
          <QuestionTypeButton
            key={config.type}
            type={config.type}
            label={config.label}
            description={config.description}
            icon={config.icon}
            isSelected={selectedType === config.type}
            onSelect={onSelectType}
          />
        ))}
      </div>
    </div>
  );
}