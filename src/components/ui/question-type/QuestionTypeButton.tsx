"use client";

import React from 'react';
import { Button } from '@heroui/react';
import { cn } from '@/lib/cn';
import type { QuestionType } from '@/types/quiz';

export interface QuestionTypeButtonProps {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onSelect: (type: QuestionType) => void;
  className?: string;
}

export function QuestionTypeButton({
  type,
  label,
  description,
  icon,
  isSelected = false,
  onSelect,
  className
}: QuestionTypeButtonProps) {
  const handleClick = () => {
    onSelect(type);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(type);
    }
  };

  return (
    <Button
      variant={isSelected ? "flat" : "bordered"}
      color={isSelected ? "primary" : "default"}
      className={cn(
        // Base styles following design tokens
        'h-auto p-4 flex flex-col items-start justify-start min-h-[88px] w-full',
        // Touch target requirement (44x44px minimum)
        'min-w-[44px] min-h-[44px]',
        // Focus ring always visible (not just focus-visible) per a11y requirements
        'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        // Hover and active states using design tokens
        !isSelected && 'hover:bg-primary-50 hover:border-primary-400',
        isSelected && 'bg-primary-500 text-white',
        // Transition using design token durations
        'transition-all duration-200',
        className
      )}
      startContent={null} // Override HeroUI default icon positioning
      onPress={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${label}: ${description}`}
      data-testid={`question-type-${type}`}
    >
      <div className="flex items-center gap-x-2 mb-2 w-full">
        <span 
          className={cn(
            'flex-shrink-0 transition-colors duration-200',
            isSelected ? 'text-white' : 'text-primary-600'
          )} 
          aria-hidden="true"
        >
          {icon}
        </span>
        <h3 className={cn(
          'font-semibold text-left',
          isSelected ? 'text-white' : 'text-gray-900'
        )}>
          {label}
        </h3>
      </div>
      <p className={cn(
        'text-sm text-left',
        isSelected ? 'text-white/90' : 'text-gray-600'
      )}>
        {description}
      </p>
    </Button>
  );
}