import React, { useId } from 'react'
import { cn } from '@/lib/utils'
import { Stack } from '@/components/layout/Stack'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  label?: React.ReactNode
  helperText?: React.ReactNode
  errorMessage?: React.ReactNode
  children: React.ReactElement
  requiredIndicator?: boolean
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
}

export function FormField({
  id,
  label,
  helperText,
  errorMessage,
  children,
  requiredIndicator = false,
  labelProps,
  className,
  ...props
}: FormFieldProps) {
  const autoId = useId()
  const fieldId = id || (children.props.id as string) || autoId
  const helperId = helperText ? `${fieldId}-helper` : undefined
  const errorId = errorMessage ? `${fieldId}-error` : undefined
  const describedBy = [children.props['aria-describedby'], helperId, errorId]
    .filter(Boolean)
    .join(' ')

  const child = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': errorMessage ? true : children.props['aria-invalid'],
  })

  return (
    <Stack gap="xs" className={cn('w-full', className)} {...props}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn('text-sm font-medium text-neutral-700 dark:text-neutral-300')}
          {...labelProps}
        >
          {label}
          {requiredIndicator && <span className="ml-1 text-error-600">*</span>}
        </label>
      )}
      {child}
      {helperText && !errorMessage && (
        <p id={helperId} className="text-xs text-neutral-600 dark:text-neutral-400">
          {helperText}
        </p>
      )}
      {errorMessage && (
        <p
          id={errorId}
          className="text-xs text-error-600"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </Stack>
  )}
