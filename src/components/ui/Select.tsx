'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const selectVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus-visible:ring-primary-500 dark:border-neutral-700 dark:hover:border-neutral-600',
        error: 'border-error-500 focus:border-error-600 focus-visible:ring-error-500 dark:border-error-600',
        success: 'border-success-500 focus:border-success-600 focus-visible:ring-success-500 dark:border-success-600',
      },
      size: {
        sm: 'h-11 px-2 text-xs',
        md: 'h-12 px-3 text-sm',
        lg: 'h-14 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className,
    variant,
    size,
    label,
    helperText,
    errorMessage,
    options,
    placeholder,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const selectId = id || 'select-default'
    const helperTextId = 'helper-select'
    const errorId = 'error-select'

    const hasError = Boolean(errorMessage)
    const actualVariant = hasError ? 'error' : variant

    const describedBy = [
      ariaDescribedBy,
      helperText && helperTextId,
      hasError && errorId,
    ].filter(Boolean).join(' ')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <select
          className={cn(selectVariants({ variant: actualVariant, size }), className)}
          ref={ref}
          id={selectId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && !hasError && (
          <p id={helperTextId} className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {helperText}
          </p>
        )}
        {hasError && (
          <p
            id={errorId}
            className="mt-1 text-xs text-error-600"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select, selectVariants }