import React from 'react'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  children: React.ReactNode
  label?: string
  htmlFor?: string
  helperText?: string
  errorMessage?: string
  required?: boolean
  className?: string
}

/**
 * FormField wrapper component that provides consistent styling for
 * labels, help text, and error messages around form controls.
 */
export function FormField({
  children,
  label,
  htmlFor,
  helperText,
  errorMessage,
  required = false,
  className,
}: FormFieldProps) {
  const hasError = Boolean(errorMessage)

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label-base">
          {label}
          {required && (
            <span className="ml-1 text-error-500" aria-label="obligatorisk">
              *
            </span>
          )}
        </label>
      )}
      
      {children}
      
      {helperText && !hasError && (
        <p className="help-text">
          {helperText}
        </p>
      )}
      
      {hasError && (
        <p className="error-text" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}